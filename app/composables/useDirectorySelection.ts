import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { createError, navigateTo, useAsyncData, useNuxtApp, useRoute } from '#app'
import { useSubjectDirectoryApi } from '~/composables/api/subject-directory/useSubjectDirectory.api'
import { DIRECTORY_DEFAULT_BOARD_CODE } from '~/constants/pastpaper/directory'
import type { BoardDTO, GradeDTO, SubjectDTO } from '~/types/board'
import type { DirectoryOptionSource, DirectorySelection, DirectorySelectorPath, DirectorySelectorSnapshot, DirectorySelectorStage } from '~/types/subject-directory'

// Resolve a URL's board, grade and subject. Each missing or unknown level falls
// back to the first option (the default board for boards); the page then 301s
// to the resolved URL.
const resolveDirectorySelection = async (
  source: DirectoryOptionSource,
  path: DirectorySelectorPath,
): Promise<DirectorySelectorSnapshot> => {
  const snapshot: DirectorySelectorSnapshot = {
    boards: [], grades: [], subjects: [], board: null, grade: null, subject: null, errorStage: null,
  }
  let stage: DirectorySelectorStage = 'board'
  const byId = (value: string | number) => String(value) === path.subject

  try {
    snapshot.boards = await source.getBoards()
    snapshot.board = snapshot.boards.find(board => String(board.code) === path.board)
      || snapshot.boards.find(board => board.code === DIRECTORY_DEFAULT_BOARD_CODE)
      || snapshot.boards[0]
      || null
    if (!snapshot.board) return snapshot

    stage = 'grade'
    snapshot.grades = await source.getGrades(snapshot.board.code)
    snapshot.grade = snapshot.grades.find(grade => String(grade.id) === path.grade) || snapshot.grades[0] || null
    if (!snapshot.grade) return snapshot

    stage = 'subject'
    snapshot.subjects = await source.getSubjects(snapshot.grade.id)
    snapshot.subject = snapshot.subjects.find(subject => byId(subject.id)) || snapshot.subjects[0] || null
    return snapshot
  }
  catch {
    // Failed lookups are retryable; never treat a network error as an invalid ID.
    snapshot.errorStage = stage
    return snapshot
  }
}

const readQuery = (value: unknown) => String((Array.isArray(value) ? value[0] : value) ?? '')

export const getDirectorySelectionQuery = ({ board, grade, subject }: DirectorySelection): DirectorySelectorPath => ({
  board: String(board.code), grade: String(grade.id), subject: String(subject.id),
})

// The URL (?board&grade&subject) is the selection. It is resolved on the server
// and again whenever the query changes; choosing a subject just navigates.
export const useDirectorySelection = async () => {
  const nuxtApp = useNuxtApp()
  const route = useRoute()
  const api = useSubjectDirectoryApi()
  const path = computed<DirectorySelectorPath>(() => ({
    board: readQuery(route.query.board),
    grade: readQuery(route.query.grade),
    subject: readQuery(route.query.subject),
  }))

  const request = useAsyncData('directory-selection', () => resolveDirectorySelection(api, path.value), { watch: [path] })
  const { data: snapshot, refresh } = request

  const selection = computed<DirectorySelection | null>(() => {
    const { board, grade, subject } = snapshot.value ?? {}
    return board && grade && subject ? { board, grade, subject } : null
  })
  const canonicalQuery = () => selection.value ? getDirectorySelectionQuery(selection.value) : null
  const isCanonical = () => {
    const query = canonicalQuery()
    return !query || JSON.stringify(query) === JSON.stringify(path.value)
  }

  const select = (next: DirectorySelection) => navigateTo({ query: { ...getDirectorySelectionQuery(next) } })

  // In the browser, a bare or partial URL is replaced by the resolved one.
  watch(selection, () => {
    const query = canonicalQuery()
    if (query && !isCanonical()) navigateTo({ query: { ...query } }, { replace: true })
  })

  await request

  // One URL per subject: a bare, subject-only or unknown query gets a 301 to the
  // full board/grade/subject URL instead of a 200 duplicate.
  const query = canonicalQuery()
  if (import.meta.server && query && !isCanonical()) {
    await nuxtApp.runWithContext(() => navigateTo({ path: route.path, query: { ...query } }, { redirectCode: 301 }))
    // Stop rendering the throwaway page; Nuxt sends the recorded redirect ahead of the error.
    throw createError({ statusCode: 301, statusMessage: 'Redirecting to canonical URL' })
  }

  return { snapshot, selection, select, refresh }
}

// Browsing state for the Board / Grade / Subject menu. Each time it opens it
// starts from the current selection; picking a subject hands the full path back.
export const useDirectoryPicker = (
  snapshot: Ref<DirectorySelectorSnapshot | null | undefined>,
  onSelect: (selection: DirectorySelection) => void,
) => {
  const api = useSubjectDirectoryApi()
  const open = ref(false)
  const stage = ref<DirectorySelectorStage>('subject')
  const board = ref<BoardDTO | null>(null)
  const grade = ref<GradeDTO | null>(null)
  const grades = ref<GradeDTO[]>([])
  const subjects = ref<SubjectDTO[]>([])
  const loading = ref<DirectorySelectorStage | null>(null)
  const error = ref<DirectorySelectorStage | null>(null)
  const search = ref('')

  watch(open, (isOpen) => {
    if (!isOpen) return
    const current = snapshot.value
    board.value = current?.board ?? null
    grade.value = current?.grade ?? null
    grades.value = current?.grades ?? []
    subjects.value = current?.subjects ?? []
    stage.value = grade.value ? 'subject' : board.value ? 'grade' : 'board'
    error.value = null
    search.value = ''
  })

  // Load a column; a newer click on the same column wins over a slower response.
  const load = async <T>(column: DirectorySelectorStage, target: Ref<T[]>, request: () => Promise<T[]>) => {
    loading.value = column
    error.value = null
    target.value = []
    const owner = column === 'grade' ? board.value : grade.value
    try {
      const items = await request()
      if (owner === (column === 'grade' ? board.value : grade.value)) target.value = items
    }
    catch {
      error.value = column
    }
    finally {
      if (loading.value === column) loading.value = null
    }
  }

  const selectBoard = (item: BoardDTO) => {
    board.value = item
    grade.value = null
    subjects.value = []
    stage.value = 'grade'
    return load('grade', grades, () => api.getGrades(item.code))
  }

  const selectGrade = (item: GradeDTO) => {
    grade.value = item
    search.value = ''
    stage.value = 'subject'
    return load('subject', subjects, () => api.getSubjects(item.id))
  }

  const selectSubject = (item: SubjectDTO) => {
    if (!board.value || !grade.value) return
    open.value = false
    onSelect({ board: board.value, grade: grade.value, subject: item })
  }

  const retry = () => {
    if (error.value === 'subject' && grade.value) return selectGrade(grade.value)
    if (board.value) return selectBoard(board.value)
  }

  // Search filters the chosen grade's subjects by name or syllabus code.
  const visibleSubjects = computed(() => {
    const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return terms.length
      ? subjects.value.filter(subject => terms.every(term => subject.title.toLowerCase().includes(term)))
      : subjects.value
  })

  return {
    open, stage, board, grade, grades, visibleSubjects, loading, error, search,
    selectBoard, selectGrade, selectSubject, retry,
  }
}

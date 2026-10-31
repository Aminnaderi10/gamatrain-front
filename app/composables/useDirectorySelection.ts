import { computed, watch } from 'vue'
import { createError, navigateTo, useAsyncData, useNuxtApp, useRoute } from '#app'
import { useDirectoryOptionsApi } from '~/composables/api/subject-directory/useDirectoryOptions.api'
import { DIRECTORY_DEFAULT_BOARD_CODE } from '~/constants/pastpaper/directory'
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
  const api = useDirectoryOptionsApi()
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

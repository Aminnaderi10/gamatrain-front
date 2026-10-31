import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useDirectoryOptionsApi } from '~/composables/api/subject-directory/useDirectoryOptions.api'
import type { BoardDTO, GradeDTO, SubjectDTO } from '~/types/board'
import type { DirectorySelection, DirectorySelectorSnapshot, DirectorySelectorStage } from '~/types/subject-directory'

// Browsing state for the Board / Grade / Subject menu. Each time it opens it
// starts from the current selection; picking a subject hands the full path back.
export const useDirectoryPicker = (
  snapshot: Ref<DirectorySelectorSnapshot | null | undefined>,
  onSelect: (selection: DirectorySelection) => void,
) => {
  const api = useDirectoryOptionsApi()
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

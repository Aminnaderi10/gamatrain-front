import { useNuxtApp } from '#app'
import { useApiService } from '~/composables/useApiService'
import { DIRECTORY_BOARD_ORDER } from '~/constants/pastpaper/directory'
import { resolveDirectorySelection } from '~/utils/directorySelection'
import type { ApiResult } from '~/types/api'
import type { BoardDTO, GradeDTO, SubjectDTO } from '~/types/board'
import type { DirectorySelection, DirectorySelectorPath } from '~/types/subject-directory/cascader'

// Board, grade and subject lists for the directory picker. Each list is requested
// once per picker (pending requests are shared) and dropped again if it fails.
export const useDirectoryOptionsApi = () => {
  const nuxtApp = useNuxtApp()
  const lists = new Map<string, Promise<unknown[]>>()

  const getList = <T>(key: string, request: () => Promise<ApiResult<T[]>>): Promise<T[]> => {
    const cached = lists.get(key)
    if (cached) return cached as Promise<T[]>
    const pending = nuxtApp.runWithContext(request).then((response) => {
      if (response.succeeded === false || !Array.isArray(response.data)) throw new Error('Unable to load directory options')
      return response.data
    }).catch((error: unknown) => {
      lists.delete(key)
      throw error
    })
    lists.set(key, pending)
    return pending
  }

  const getBoards = async () => {
    const boards = await getList<BoardDTO>('boards', () =>
      useApiService.get<ApiResult<BoardDTO[]>>('/api/v2/boards', undefined, { public: true }))
    const order = new Map(DIRECTORY_BOARD_ORDER.map((title, index) => [title, index]))
    return [...boards].sort((first, second) =>
      (order.get(first.title) ?? Number.MAX_SAFE_INTEGER) - (order.get(second.title) ?? Number.MAX_SAFE_INTEGER))
  }

  const getGrades = (boardId: number | string) => getList<GradeDTO>(`grades:${boardId}`, () =>
    useApiService.get<ApiResult<GradeDTO[]>>('/api/v1/types/list/', { type: 'base', section_id: boardId }, { public: true }))

  const getSubjects = (gradeId: string) => getList<SubjectDTO>(`subjects:${gradeId}`, () =>
    useApiService.get<ApiResult<SubjectDTO[]>>('/api/v1/types/list/', { type: 'lesson', base_id: gradeId }, { public: true }))

  const getBoardSubjectPaths = async (board: BoardDTO): Promise<DirectorySelection[]> => {
    const grades = await getGrades(board.code)
    const subjectLists = await Promise.all(grades.map(grade => getSubjects(grade.id)))
    return grades.flatMap((grade, index) => (subjectLists[index] ?? []).map(subject => ({ board, grade, subject })))
  }

  const resolvePath = (path: DirectorySelectorPath) => resolveDirectorySelection({ getBoards, getGrades, getSubjects }, path)

  return { getBoards, getGrades, getSubjects, getBoardSubjectPaths, resolvePath }
}

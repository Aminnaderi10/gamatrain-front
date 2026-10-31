import { DIRECTORY_DEFAULT_BOARD_CODE } from '../constants/pastpaper/directory'
import type { DirectoryOptionSource, DirectorySelectorPath, DirectorySelectorSnapshot, DirectorySelectorStage } from '../types/subject-directory/cascader'

// Resolve a URL's board, grade and subject. Each missing or unknown level falls
// back to the first option (the default board for boards); the page then 301s
// to the resolved URL.
export const resolveDirectorySelection = async (
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

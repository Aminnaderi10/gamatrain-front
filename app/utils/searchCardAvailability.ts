import type { SearchCardAnswerFields } from '@/types/search'

export const hasEmbeddedAnswers = (information: SearchCardAnswerFields): boolean => {
  if (information.is_paper || !['1', '2'].includes(String(information.answer_type))) {
    return false
  }

  const answerFileExists = information.files?.answer?.exist ?? information.a_file
  if (answerFileExists === true) return false

  if (typeof information.answers_at_end_of_files === 'boolean') {
    return information.answers_at_end_of_files
  }

  // Missing file metadata is unknown, not evidence that answers are embedded.
  return answerFileExists === false
}

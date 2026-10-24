import type {
  ApiResult,
  ExamDetaiDTO,
  ExamRelatedContentDTO,
  RelatedContentDTO,
} from '@/types'

const loadingGetItemById = ref(false)
// const NAME = 'Exam'

export const useExam = () => {
  // const { $toast } = useNuxtApp()
  const { handleApiResponseError, handleApiCatchError, createApiFailure } = useApiErrorHandler()

  const getItemById = async (id: string | number) => {
    loadingGetItemById.value = true

    try {
      const response = await useApiService.get<ApiResult<ExamDetaiDTO>>(
        `/api/v1/exams/${id}`,
      )
      if (response.status == 0) {
        handleApiResponseError(response)
      }
      // gama-api sends `topics: ""` for an exam without topics, and the page maps over it: the server render threw
      // and answered 500 for every such exam (about 4 in 10) since the 2026-10-19 redesign.
      if (response.data && !Array.isArray(response.data.topics)) {
        response.data.topics = []
      }

      return response
    }
    catch (err: unknown) {
      handleApiCatchError(err)

      return createApiFailure<ExamDetaiDTO>(err)
    }
    finally {
      loadingGetItemById.value = false
    }
  }

  // Other quizzes for the same subject, for the "More ... quizzes" row. The recommendation already leaves the
  // quiz itself out; a failed request just means no row, so it never reports an error.
  const getRelatedExams = async (id: string | number): Promise<ExamRelatedContentDTO[]> => {
    try {
      const response = await useApiService.get<ApiResult<RelatedContentDTO>>(
        '/api/v1/recommendations/related',
        { source: 'exam', request: 'exam', id },
        { public: true },
      )

      return (response.data?.exams ?? []).filter(exam => String(exam.id) !== String(id))
    }
    catch {
      return []
    }
  }

  return {
    getItemById,
    getRelatedExams,
    loadingGetItemById,
  }
}

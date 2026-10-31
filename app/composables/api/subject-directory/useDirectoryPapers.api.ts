import { useNuxtApp } from '#app'
import { useApiService } from '~/composables/useApiService'
import type { DirectoryFetchPapers, DirectoryPaperResponse } from '~/types/subject-directory/papers'

export const useDirectoryPapersApi = () => {
  const nuxtApp = useNuxtApp()
  const fetchPapers: DirectoryFetchPapers = (params, signal) =>
    nuxtApp.runWithContext(() => useApiService.get<DirectoryPaperResponse>(
      '/api/v1/tests/search', { ...params }, { public: true, signal },
    ))
  return { fetchPapers }
}

import { computed } from 'vue'
import type { Ref } from 'vue'
import { useAsyncData } from '#app'
import { useApiService } from '~/composables/useApiService'
import type { DirectoryResourceGroup } from '~/types/subject-directory/resources'

interface DirectoryResourcesResponse {
  data?: { list?: DirectoryResourceGroup[] }
}

export const useDirectoryResources = async (context: Ref<{ subjectId: string | number }>) => {
  const key = computed(() => `directory-resources:${context.value.subjectId || 'none'}`)
  const { data, pending, error, refresh } = await useAsyncData(key, () => {
    const subjectId = context.value.subjectId
    if (!subjectId) return Promise.resolve<DirectoryResourcesResponse>({ data: { list: [] } })
    return useApiService.get<DirectoryResourcesResponse>('/api/v1/tests/search', {
      is_paper: false,
      directory: true,
      lesson: subjectId,
    }, { public: true })
  })

  return {
    resourcesData: computed<DirectoryResourceGroup[]>(() => {
      const list = data.value?.data?.list
      return Array.isArray(list) ? list : []
    }),
    isLoadingResources: pending,
    resourceError: error,
    refreshResources: refresh,
  }
}

import { computed } from 'vue'
import type { Ref } from 'vue'
import { useAsyncData } from '#app'
import { useApiService } from '~/composables/useApiService'
import { DIRECTORY_RESOURCE_PRESENTATION } from '~/constants/pastpaper/directory'
import type { DirectoryResourceContext, DirectoryResourceGroup } from '~/types/subject-directory'

interface DirectoryResourcesResponse {
  data?: { list?: DirectoryResourceGroup[] }
}

// The subject's non-empty resource collections, each linking to the matching Search results.
export const useDirectoryResources = async (context: Ref<DirectoryResourceContext>) => {
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

  const collections = computed(() => (data.value?.data?.list ?? [])
    .filter(group => group.items?.length)
    .map((group) => {
      const presentation = DIRECTORY_RESOURCE_PRESENTATION[group.title?.trim().toLowerCase() ?? '']
      return {
        id: group.type_id,
        label: presentation?.label || group.title,
        icon: presentation?.icon || 'md:description_outlined',
        count: group.items.length,
        to: {
          path: '/search',
          query: {
            type: 'study-materials',
            section: context.value.boardId || undefined,
            base: context.value.gradeId || undefined,
            lesson: context.value.subjectId || undefined,
            test_type: group.type_id,
          },
        },
      }
    }))

  return { collections, isLoadingResources: pending, resourceError: error, refreshResources: refresh }
}

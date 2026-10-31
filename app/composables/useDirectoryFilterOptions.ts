import { computed, onMounted, reactive, watch } from 'vue'
import { useAsyncData } from '#app'
import { useApiService } from '~/composables/useApiService'
import { DIRECTORY_YEAR_OPTIONS, getDirectorySessions } from '~/constants/pastpaper/directory'
import { getDirectoryVariantOptions } from '~/utils/directoryPapers'
import type { DirectoryFilterKey, DirectoryFilterOption, DirectoryPaperContext } from '~/types/subject-directory/papers'

interface DirectoryOptionsResponse {
  status: number | string
  data: DirectoryFilterOption[]
}

type CatalogueFilter = 'paper' | 'variant'

// Directory catalogue loading is kept outside the shared filter presentation.
export const useDirectoryFilterOptions = (context: DirectoryPaperContext) => {
  const catalogues = reactive<Record<string, DirectoryFilterOption[]>>({})
  const loading = reactive<Record<string, boolean>>({})
  const errors = reactive<Record<string, string>>({})
  const requests = new Map<string, Promise<void>>()
  const catalogueKey = (key: CatalogueFilter) => key === 'paper' ? `papers:${context.boardId}` : 'variants'

  const optionLists = computed<Record<DirectoryFilterKey, readonly { id: string | number, title: string }[]>>(() => ({
    year: DIRECTORY_YEAR_OPTIONS,
    series: getDirectorySessions(context.gradeId),
    paper: catalogues[catalogueKey('paper')] || [],
    variant: catalogues.variants || [],
  }))
  const optionLoading = computed<Partial<Record<DirectoryFilterKey, boolean>>>(() => ({
    paper: Boolean(loading[catalogueKey('paper')]),
    variant: Boolean(loading.variants),
  }))
  const optionErrors = computed<Partial<Record<DirectoryFilterKey, string>>>(() => ({
    paper: errors[catalogueKey('paper')] || '',
    variant: errors.variants || '',
  }))

  const fetchOptions = async (filter: string): Promise<void> => {
    if ((filter !== 'paper' && filter !== 'variant') || !context.subjectId) return
    if (filter === 'paper' && !context.boardId) return
    const key = catalogueKey(filter)
    if (catalogues[key]) return
    const existing = requests.get(key)
    if (existing) return existing

    loading[key] = true
    errors[key] = ''
    const params = filter === 'paper'
      ? { type: 'test_type', section_id: context.boardId }
      : { type: 'variant' }
    const request = (async () => {
      try {
        const response = await useApiService.get<DirectoryOptionsResponse>('/api/v1/types/list', params, { public: true })
        if (Number(response?.status) !== 1 || !Array.isArray(response.data)) throw new Error('Invalid options')
        catalogues[key] = filter === 'paper'
          ? response.data.filter(item => item.is_paper === true || item.is_paper === '1' || item.is_paper === 1)
          : getDirectoryVariantOptions(response.data)
      }
      catch {
        errors[key] = 'Unable to load options. Please try again.'
      }
      finally {
        loading[key] = false
        requests.delete(key)
      }
    })()
    requests.set(key, request)
    return request
  }

  let mounted = false
  const preloadOptions = () => Promise.all((['paper', 'variant'] as const).map(fetchOptions))
  onMounted(() => {
    mounted = true
    preloadOptions()
  })
  watch(() => [context.subjectId, context.boardId], () => {
    if (mounted) preloadOptions()
  })

  // Load the inline Paper/Variant options during server rendering, so their rows
  // render at full size instead of growing (and shifting the page) after hydration.
  // The caller awaits `ready` after registering its own lifecycle hooks.
  const paperKey = catalogueKey('paper')
  const ready = context.subjectId
    ? useAsyncData(`directory-filter-options:${paperKey}`, async () => {
        await preloadOptions()
        return { [paperKey]: catalogues[paperKey] || null, variants: catalogues.variants || null }
      }).then(({ data }) => {
        // A failed list stays missing here and is retried by the mounted preload.
        for (const [key, items] of Object.entries(data.value || {})) if (items) catalogues[key] = items
      })
    : Promise.resolve()

  return { optionLists, optionLoading, optionErrors, fetchOptions, ready }
}

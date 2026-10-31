import { computed, onMounted, onScopeDispose, reactive, ref, watch } from 'vue'
import { useNuxtData } from '#app'
import { useDirectoryPapersApi } from '~/composables/api/subject-directory/useDirectoryPapers.api'
import { useDirectoryFilterOptions } from '~/composables/useDirectoryFilterOptions'
import { getDirectoryInitialPapersKey, useDirectoryInitialPapers } from '~/composables/useDirectoryInitialPapers'
import { DIRECTORY_FILTERS, DIRECTORY_PAGE_SIZE, getDirectorySessions } from '~/constants/pastpaper/directory'
import { appendDirectoryPapers, createDirectoryPaperList, groupDirectoryPapers } from '~/utils/directoryPapers'
import type { DirectoryStructuredDataPaper } from '~/types/subject-directory/structuredData'
import type {
  DirectoryFilterKey,
  DirectoryPaperContext,
  DirectoryPaperQuery,
  DirectoryPaperResponse,
} from '~/types/subject-directory/papers'

type LoadStatus = 'ok' | 'empty' | 'error'

// One paginated, newest-first paper search per subject and filter set, grouped
// into years and sessions in the browser. Only the newest session opens by itself.
export const useDirectoryPapers = async (context: DirectoryPaperContext) => {
  const filters = reactive<Record<DirectoryFilterKey, string>>({ year: '', series: '', paper: '', variant: '' })
  const { optionLists, optionLoading, optionErrors, fetchOptions, ready: optionsReady } = useDirectoryFilterOptions(context)
  const { fetchPapers } = useDirectoryPapersApi()

  const list = reactive(createDirectoryPaperList())
  const expandedYears = ref<number[]>([])
  const expandedSessions = reactive<Record<number, number[]>>({})
  let controller: AbortController | null = null

  const years = computed(() => groupDirectoryPapers(list.items, getDirectorySessions(context.gradeId)))

  const filterButtons = computed(() => DIRECTORY_FILTERS.map((filter) => {
    const key = filter.key as DirectoryFilterKey
    return {
      ...filter,
      selectedItem: optionLists.value[key].find(item => String(item.id) === filters[key]) || null,
      items: optionLists.value[key],
      disabled: !context.subjectId || (key === 'paper' && !context.boardId),
      loading: Boolean(optionLoading.value[key]),
      error: optionErrors.value[key] || '',
    }
  }))

  const selectFilter = (key: string, item: { id: string | number } | null) => {
    if (Object.hasOwn(filters, key)) filters[key as DirectoryFilterKey] = item ? String(item.id) : ''
  }
  const clearFilters = () => {
    Object.assign(filters, { year: '', series: '', paper: '', variant: '' })
  }

  const query = (): DirectoryPaperQuery => ({
    lesson: context.subjectId,
    edu_year: filters.year || undefined,
    edu_month: filters.series || undefined,
    test_type: filters.paper || undefined,
    variant: filters.variant || undefined,
  })

  const openNewestSession = () => {
    const year = years.value[0]
    const session = year?.sessions[0]
    for (const key of Object.keys(expandedSessions)) Reflect.deleteProperty(expandedSessions, key)
    expandedYears.value = year ? [year.id] : []
    if (year && session) expandedSessions[year.id] = [session.id]
  }

  const addPage = (response: DirectoryPaperResponse) => {
    try {
      appendDirectoryPapers(list, response, DIRECTORY_PAGE_SIZE)
    }
    catch {
      list.error = true
    }
  }

  // Load the next (older) page; v-infinite-scroll's manual "load more" calls it.
  const loadMore = async (): Promise<LoadStatus> => {
    if (!context.subjectId || !list.hasMore) return 'empty'
    controller = new AbortController()
    const { signal } = controller
    list.loading = true
    list.error = false
    try {
      const response = await fetchPapers({
        ...query(), is_paper: true, directory: true, page: list.page + 1, perpage: DIRECTORY_PAGE_SIZE,
      }, signal)
      if (signal.aborted) return 'ok'
      addPage(response)
      if (list.error) return 'error'
      return list.hasMore ? 'ok' : 'empty'
    }
    catch {
      if (signal.aborted) return 'ok'
      list.error = true
      return 'error'
    }
    finally {
      if (!signal.aborted) list.loading = false
    }
  }

  // Start the list over for a new subject or filter set, then open its newest session.
  const reload = async () => {
    controller?.abort()
    Object.assign(list, createDirectoryPaperList())
    openNewestSession()
    await loadMore()
    openNewestSession()
  }

  const expandSessions = (year: number, months: number[]) => {
    expandedSessions[year] = months
  }
  const isSessionOpen = (year: number, month: number) => expandedYears.value.includes(year)
    && (expandedSessions[year] || []).includes(month)

  // Papers in open sessions, for the page's structured data.
  const openPapers = computed<DirectoryStructuredDataPaper[]>(() => years.value.flatMap(year => year.sessions
    .filter(session => isSessionOpen(year.id, session.id))
    .flatMap(session => session.papers.map(paper => ({ paper, year: year.title, session: session.title })))))

  // A new subject clears the filters; the query watcher below then reloads once.
  watch(() => [context.subjectId, context.gradeId, context.boardId].join(':'), clearFilters)
  watch(() => JSON.stringify(query()), () => reload())

  onMounted(() => {
    // The server payload was missing or failed: load the first page in the browser.
    if (context.subjectId && !list.loaded) reload()
  })
  onScopeDispose(() => controller?.abort())

  if (context.subjectId) {
    const cached = useNuxtData<DirectoryPaperResponse | null>(getDirectoryInitialPapersKey(context.subjectId))
    const { data } = cached.data.value ? cached : await useDirectoryInitialPapers(context)
    if (data.value) {
      addPage(data.value)
      openNewestSession()
    }
  }

  // Awaited last: an await inside a composable drops the component and Nuxt
  // context that the hooks and data composables above rely on.
  await optionsReady

  return {
    filters, filterButtons, years, list, expandedYears, expandedSessions, openPapers,
    selectFilter, clearFilters, fetchOptions, expandSessions, loadMore, reload,
  }
}

import { computed, onMounted, onScopeDispose, reactive, ref, watch } from 'vue'
import { useAsyncData, useNuxtData } from '#app'
import { useDirectoryPapersApi } from '~/composables/api/subject-directory/useDirectoryPapers.api'
import { useApiService } from '~/composables/useApiService'
import { DIRECTORY_FILTERS, DIRECTORY_PAGE_SIZE, DIRECTORY_YEAR_OPTIONS, getDirectorySessions } from '~/constants/pastpaper/directory'
import { PAPER_VARIANT_OPTIONS } from '~/constants/search'
import { appendDirectoryPapers, createDirectoryPaperList, groupDirectoryPapers } from '~/utils/directoryPapers'
import type { DirectoryStructuredDataPaper } from '~/utils/directorySeo'
import type {
  DirectoryFilterKey,
  DirectoryFilterOption,
  DirectoryPaperContext,
  DirectoryPaperQuery,
  DirectoryPaperResponse,
} from '~/types/subject-directory'

const getDirectoryInitialPapersKey = (subjectId: string | number) => `directory-papers:${subjectId}`

// The subject's newest page of papers, rendered on the server. The page starts it
// alongside Resources; useDirectoryPapers reads the same payload.
export const useDirectoryInitialPapers = ({ subjectId }: { subjectId: string | number }) => {
  const { fetchPapers } = useDirectoryPapersApi()
  return useAsyncData(getDirectoryInitialPapersKey(subjectId), () => subjectId
    ? fetchPapers({ lesson: subjectId, is_paper: true, directory: true, page: 1, perpage: DIRECTORY_PAGE_SIZE })
    : Promise.resolve(null))
}

// One paginated, newest-first paper search per subject and filter set, grouped
// into years and sessions in the browser. Only the newest session opens by itself.
export const useDirectoryPapers = async (context: DirectoryPaperContext) => {
  const filters = reactive<Record<DirectoryFilterKey, string>>({ year: '', series: '', paper: '', variant: '' })
  // Paper types depend on the board and are loaded on the server, so the inline
  // Paper row renders at full size; Year, Session and Variant are fixed lists.
  const paperTypes = useAsyncData(
    () => `directory-paper-types:${context.boardId}`,
    () => context.boardId
      ? useApiService.get<{ data: DirectoryFilterOption[] }>('/api/v1/types/list', { type: 'test_type', section_id: context.boardId }, { public: true })
          .then(response => response.data.filter(item => item.is_paper === true))
      : Promise.resolve([]),
  )
  const optionLists = computed<Record<DirectoryFilterKey, readonly { id: string | number, title: string }[]>>(() => ({
    year: DIRECTORY_YEAR_OPTIONS,
    series: getDirectorySessions(context.gradeId),
    paper: paperTypes.data.value ?? [],
    variant: PAPER_VARIANT_OPTIONS,
  }))
  const { fetchPapers } = useDirectoryPapersApi()

  const list = reactive(createDirectoryPaperList())
  const expandedYears = ref<number[]>([])
  const expandedSessions = reactive<Record<number, number[]>>({})

  const years = computed(() => groupDirectoryPapers(list.items, getDirectorySessions(context.gradeId)))

  const filterButtons = computed(() => DIRECTORY_FILTERS.map((filter) => {
    const key = filter.key as DirectoryFilterKey
    return {
      ...filter,
      selectedItem: optionLists.value[key].find(item => String(item.id) === filters[key]) || null,
      items: optionLists.value[key],
      disabled: !context.subjectId || (key === 'paper' && !context.boardId),
      loading: key === 'paper' && paperTypes.status.value === 'pending',
      error: key === 'paper' && paperTypes.error.value ? 'Unable to load options. Please try again.' : '',
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

  // Load the next (older) page ("Load older papers"). A response that arrives
  // after the subject or filters changed is ignored.
  let request = 0
  const loadMore = async () => {
    if (!context.subjectId || !list.hasMore) return
    const current = ++request
    list.loading = true
    list.error = false
    try {
      const response = await fetchPapers({
        ...query(), is_paper: true, directory: true, page: list.page + 1, perpage: DIRECTORY_PAGE_SIZE,
      })
      if (current === request) addPage(response)
    }
    catch {
      if (current === request) list.error = true
    }
    finally {
      if (current === request) list.loading = false
    }
  }

  // Start the list over for a new subject or filter set, then open its newest session.
  const reload = async () => {
    request++
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
  onScopeDispose(() => request++)

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
  await paperTypes

  return {
    filters, filterButtons, years, list, expandedYears, expandedSessions, openPapers,
    selectFilter, clearFilters, refreshPaperTypes: paperTypes.refresh, expandSessions, loadMore, reload,
  }
}

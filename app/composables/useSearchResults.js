import {
  buildSearchParams,
  getLegacySearchType,
  normalizeSearchService,
} from '@/utils/search-services'

export const useSearchResults = async ({
  activeService,
  beforeReplaceResults,
}) => {
  const route = useRoute()
  const router = useRouter()

  const querySearch = ref({
    ...route.query,
    type: normalizeSearchService(route.query.type),
    page: Number(route.query.page) || 1,
  })
  const isInitialDataLoading = ref(false)
  const isPaginationDataLoading = ref(false)
  const isPreviousLoading = ref(false)
  const data = ref([])
  const isAllDataLoaded = ref(false)
  const totalDataFind = ref(0)
  const serviceResultCounts = ref({})
  const perPage = 10
  const perPageServerSide = 5
  const firstLoadedPageNumber = ref(Number(route.query.page) || 1)
  const latestLoadedPageNumber = ref(Number(route.query.page) || 1)
  const lastRequestedService = ref(activeService.value)
  let serviceCountRequestId = 0

  const getDataList = async () => {
    if (isAllDataLoaded.value) return

    try {
      const typeRoute = getLegacySearchType(querySearch.value.type)
      let response = {}

      if (typeRoute == 'teacher') {
        const query = {
          'PagingDto.PageFilter.Size': perPage,
          'PagingDto.PageFilter.Skip': (querySearch.value.page - 1) * perPage,
          'PagingDto.PageFilter.ReturnTotalRecordsCount': true,
        }
        response = await useApiService.get('/api/v2/identities/profiles/list', query)
        totalDataFind.value = response.data.totalRecordsCount || 0
      }
      else {
        const params = buildSearchParams(querySearch.value, querySearch.value.page, perPage)
        response = await useApiService.get('/api/v1/search', params)
        totalDataFind.value = response.data.num || 0
      }

      if (response.data.list && response.data.list.length < perPage) {
        isAllDataLoaded.value = true
      }

      return response.data.list
    }
    catch (err) {
      console.error(err)
      return []
    }
    finally {
      isPaginationDataLoading.value = false
      isInitialDataLoading.value = false
      isPreviousLoading.value = false
    }
  }

  const loadNextPageData = async () => {
    latestLoadedPageNumber.value += 1
    querySearch.value.page = latestLoadedPageNumber.value
    const query = { ...route.query }

    query.page = querySearch.value.page
    router.replace({ query })
    isPaginationDataLoading.value = true
    const responseList = await getDataList()
    data.value = [...data.value, ...responseList]
  }

  const loadPreviousPageData = async () => {
    firstLoadedPageNumber.value -= 1
    querySearch.value.page = firstLoadedPageNumber.value
    const query = { ...route.query }

    query.page = querySearch.value.page
    router.replace({ query })
    isPreviousLoading.value = true
    const responseList = await getDataList()
    data.value = [...responseList, ...data.value]
  }

  const buildTypeStatsParams = (query, isPaper) => ({
    title: query.title,
    section: query.section,
    base: query.base,
    lesson: query.lesson,
    topic: query.topic,
    test_type: query.test_type,
    variant: query.variant,
    exam_type: query.exam_type,
    content_type: query.content_type,
    edu_year: query.edu_year,
    edu_month: query.edu_month,
    is_paper: isPaper,
  })

  const getTypesStatsData = result =>
    result.status === 'fulfilled'
      ? result.value?.data?.types_stats ?? result.value?.data
      : null

  const getStatsCount = (stats, ...keys) => {
    const value = keys
      .map(key => stats?.[key])
      .find(candidate => candidate !== undefined && candidate !== null)
    const count = Number.parseInt(value, 10)
    return Number.isFinite(count) ? count : 0
  }

  const refreshServiceResultCounts = async (query) => {
    const requestId = ++serviceCountRequestId
    const [paperResult, studyMaterialsResult] = await Promise.allSettled([
      useApiService.get(
        '/api/v1/search/typesstats',
        buildTypeStatsParams(query, 1),
        { public: true },
      ),
      useApiService.get(
        '/api/v1/search/typesstats',
        buildTypeStatsParams(query, 0),
        { public: true },
      ),
    ])

    if (requestId !== serviceCountRequestId) return

    const paperStats = getTypesStatsData(paperResult)
    const studyMaterialsStats = getTypesStatsData(studyMaterialsResult)
    const sharedStats = paperStats || studyMaterialsStats
    const counts = {}

    if (paperStats)
      counts.paper = getStatsCount(paperStats, 'papers')
    if (studyMaterialsStats)
      counts['study-materials'] = getStatsCount(studyMaterialsStats, 'papers')
    if (sharedStats) {
      counts.quizhub = getStatsCount(sharedStats, 'exams', 'azmoon')
      counts.tutorial = getStatsCount(sharedStats, 'tutorials', 'dars')
    }

    serviceResultCounts.value = {
      ...serviceResultCounts.value,
      ...counts,
    }
  }

  const reloadResultsForFilters = async (query) => {
    lastRequestedService.value = normalizeSearchService(query.type)
    isAllDataLoaded.value = false
    isInitialDataLoading.value = true
    firstLoadedPageNumber.value = 1
    latestLoadedPageNumber.value = 1
    querySearch.value = { ...query, page: 1 }
    const countsRequest = refreshServiceResultCounts(query)
    await beforeReplaceResults?.()
    const responseList = await getDataList()
    data.value = responseList
    await countsRequest
  }

  const initialDataRequest = useAsyncData(
    'dataSearchSSR',
    () => {
      const pageNumber = Number(route.query.page) || 1
      if (getLegacySearchType(route.query.type) == 'teacher') {
        const query = {
          'PagingDto.PageFilter.Size': perPageServerSide,
          'PagingDto.PageFilter.Skip': (pageNumber - 1) * perPageServerSide,
          'PagingDto.PageFilter.ReturnTotalRecordsCount': true,
        }
        return useApiService.get('/api/v2/identities/profiles/list', query)
      }

      const params = buildSearchParams(route.query, pageNumber, perPageServerSide)
      return useApiService.get('/api/v1/search', params, { public: true })
    },
  )
  const initialData = initialDataRequest.data

  watchEffect(() => {
    if (initialData.value) {
      data.value = initialData.value.data.list
    }
  })

  watch(activeService, async (service) => {
    if (service === lastRequestedService.value) return

    lastRequestedService.value = service
    isAllDataLoaded.value = false
    isInitialDataLoading.value = true
    firstLoadedPageNumber.value = 1
    latestLoadedPageNumber.value = 1
    querySearch.value = { ...route.query, type: service, page: 1 }
    await beforeReplaceResults?.()
    data.value = await getDataList()
  })

  onMounted(() => {
    refreshServiceResultCounts(route.query)
  })

  await initialDataRequest

  if (initialData.value) {
    data.value = initialData.value.data.list
    if (getLegacySearchType(route.query.type) == 'teacher') {
      totalDataFind.value = initialData.value.data.totalRecordsCount || 0
    }
    else {
      totalDataFind.value = initialData.value.data.num || 0
    }
    isInitialDataLoading.value = false
    isPaginationDataLoading.value = false
  }

  return {
    data,
    firstLoadedPageNumber,
    isAllDataLoaded,
    isInitialDataLoading,
    isPaginationDataLoading,
    isPreviousLoading,
    loadNextPageData,
    loadPreviousPageData,
    reloadResultsForFilters,
    serviceResultCounts,
    totalDataFind,
  }
}

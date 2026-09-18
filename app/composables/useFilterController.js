export const useFilterController = ({
  filterList,
  hasKeywordSearch,
  hasServicesNavigation,
  onChangeFilter,
}) => {
  const route = useRoute()
  const router = useRouter()

  const getActiveFilterCount = query => filters.value.filter(filter =>
    filter.queryKey
    && query[filter.queryKey] !== undefined
    && query[filter.queryKey] !== null
    && query[filter.queryKey] !== ''
    && !(hasServicesNavigation.value && filter.queryKey === 'type'),
  ).length

  const createFilterState = filterConfiguration =>
    filterConfiguration.map(filter => ({
      ...filter,
      initialDisabled: filter.disabled,
    }))

  const filters = ref(createFilterState(filterList.value))
  const countFilterSelect = ref(getActiveFilterCount(route.query))
  const textSearch = ref(route.query.title ? route.query.title : '')
  const hasExclusiveDisabledState = ref(false)
  const filterDataLoads = new WeakMap()
  const timer = ref(null)
  let pendingServiceChange = false
  let filterListSyncVersion = 0

  const setFilterRef = (filter, element) => {
    filter.refElement = element
  }

  const isCurrentFilterSync = syncVersion =>
    syncVersion === undefined || syncVersion === filterListSyncVersion

  const isExclusiveFilterSelected = (index) => {
    const filter = filters.value[index]

    return filter?.disableOtherFiltersOnSelectedIds?.includes(
      filter.selectedItem?.id,
    )
  }

  const restoreDisabledState = () => {
    filters.value.forEach((filter) => {
      filter.disabled = filter.initialDisabled
    })
  }

  const disableOtherFilters = (sourceIndex) => {
    hasExclusiveDisabledState.value = true

    filters.value.forEach((filter, index) => {
      if (index === sourceIndex) return

      filter.selectedItem = null
      filter.disabled = true
    })
  }

  const resetDescendants = (indexFilter) => {
    const filterParent = filters.value[indexFilter]

    if (filterParent.childrenForGetStaticData) {
      for (const childIndex of filterParent.childrenForGetStaticData) {
        const child = filters.value[childIndex]
        const readyForGetStatic
          = child.dependenciesForGetStaticData?.includes(indexFilter)

        if (readyForGetStatic && child.getStaticList) {
          const staticList = child.getStaticList('reset')
          child.refElement.setStaticItem(staticList)
          child.selectedItem = null
        }
      }
    }

    if (!filterParent.children || filterParent.children.length == 0) return

    for (const childIndex of filterParent.children) {
      const child = filters.value[childIndex]

      child.selectedItem = null
      child.disabled = true
      resetDescendants(childIndex)
    }
  }

  const getFilterDataLoadKey = (filter, parentId = '') => JSON.stringify({
    api: filter.api,
    parentId: filter.idInParams ? parentId : '',
    params: filter.extraApiParams || {},
  })

  const loadFilterItems = async (filter, parentId = '') => {
    if (!filter.api || filter.staticList?.length || !filter.refElement) return

    const loadKey = getFilterDataLoadKey(filter, parentId)
    const existingLoad = filterDataLoads.get(filter)
    if (existingLoad?.key === loadKey) {
      await existingLoad.promise
      return
    }

    const loadPromise = filter.refElement.getItems(filter.idInParams ? parentId : '')
    filterDataLoads.set(filter, { key: loadKey, promise: loadPromise })

    try {
      await loadPromise
    }
    catch (error) {
      if (filterDataLoads.get(filter)?.promise === loadPromise)
        filterDataLoads.delete(filter)
      throw error
    }
  }

  const enableReadyChildren = async (indexFilter, syncVersion) => {
    const filterParent = filters.value[indexFilter]

    if (filterParent.childrenForGetStaticData) {
      for (const childIndex of filterParent.childrenForGetStaticData) {
        const child = filters.value[childIndex]
        const readyForGetStatic
          = child.dependenciesForGetStaticData?.includes(indexFilter)

        if (
          readyForGetStatic
          && child.getStaticList
          && filterParent.selectedItem
          && filterParent.selectedItem.id
        ) {
          const staticList = child.getStaticList(filterParent.selectedItem.id)
          child.refElement.setStaticItem(staticList)
        }
      }
    }

    if (!filterParent.children || filterParent.children.length == 0) return

    for (const childIndex of filterParent.children) {
      const child = filters.value[childIndex]

      const ready = child.dependencies.every(
        dep => !!filters.value[dep.parent].selectedItem,
      )

      if (ready) {
        const disableValue = child.dependencies.some(dep =>
          dep.disableIds?.includes(filters.value[dep.parent].selectedItem.id),
        )

        if (disableValue) {
          child.disabled = true
          continue
        }

        if (
          child.queryMap
          && child.parentIndexChangeQueryKey
          && filters.value[child.parentIndexChangeQueryKey].selectedItem
        ) {
          const id
            = filters.value[child.parentIndexChangeQueryKey].selectedItem.id
          child.queryKey = child.queryMap[id] ?? child.queryKey
        }

        child.disabled = false
        if (child.api && !child.staticList?.length) {
          if (!child.idInParams) {
            child.dependencies.forEach((dep) => {
              const parentNode = filters.value[dep.parent]
              child.extraApiParams[dep.targetKey]
                = parentNode.selectedItem?.[dep.sourceKey] ?? null
            })
          }
          await loadFilterItems(child, filterParent.selectedItem.id)
          if (!isCurrentFilterSync(syncVersion)) return
        }

        await enableReadyChildren(childIndex, syncVersion)
        if (!isCurrentFilterSync(syncVersion)) return
      }
    }
  }

  const updateQueryFromFilters = async () => {
    const query = { ...route.query }
    const filterQuery = {}
    const titles = {}

    filters.value.forEach((filter) => {
      if (filter.queryKey) delete query[filter.queryKey]

      if (filter.queryKey && filter.selectedItem?.code) {
        filterQuery[filter.queryKey] = filter.selectedItem.code
        titles[filter.queryKey] = filter.selectedItem.title
      }
      else if (filter.queryKey && filter.selectedItem?.id) {
        filterQuery[filter.queryKey] = filter.selectedItem.id
        titles[filter.queryKey] = filter.selectedItem.title
      }
    })

    delete query.page
    Object.assign(query, filterQuery)

    countFilterSelect.value = getActiveFilterCount(filterQuery)
    router.replace({ query })
    onChangeFilter(query, titles, { serviceChange: pendingServiceChange })
  }

  const updateSelectedItem = async (itemSelected, index) => {
    filters.value[index].selectedItem = itemSelected

    const isExclusiveSelected = isExclusiveFilterSelected(index)
    if (hasExclusiveDisabledState.value && !isExclusiveSelected) {
      restoreDisabledState()
      hasExclusiveDisabledState.value = false
    }

    resetDescendants(index)

    if (isExclusiveSelected) {
      disableOtherFilters(index)
      updateQueryFromFilters()
    }
    else {
      await enableReadyChildren(index)
      updateQueryFromFilters()
    }
  }

  const selectService = (serviceId) => {
    const index = filters.value.findIndex(filter => filter.queryKey === 'type')
    const filter = filters.value[index]
    const service = filter?.staticList?.find(item => item.id === serviceId)
    if (!service || filter.selectedItem?.id === serviceId) return

    pendingServiceChange = true
    filter.selectedItem = service
    resetDescendants(index)

    try {
      return updateQueryFromFilters()
    }
    finally {
      pendingServiceChange = false
    }
  }

  const clearFilter = (index) => {
    filters.value[index].selectedItem = null

    if (hasExclusiveDisabledState.value) {
      restoreDisabledState()
      hasExclusiveDisabledState.value = false
    }

    resetDescendants(index)
    updateQueryFromFilters()
  }

  const fetchDataRequireFilter = async (syncVersion) => {
    for (let index = 0; index < filters.value.length; index++) {
      if (!isCurrentFilterSync(syncVersion)) return

      const filter = filters.value[index]
      if (!filter.dependencies?.length) {
        if (filter.api && !filter.staticList?.length) {
          await loadFilterItems(filter)
          if (!isCurrentFilterSync(syncVersion)) return
        }
      }
      if (filter.getStaticList) {
        const staticList = filter.getStaticList()
        filter.refElement.setStaticItem(staticList)
      }
    }
  }

  const fetchFilterAvailableInQuery = async (syncVersion) => {
    for (let index = 0; index < filters.value.length; index++) {
      if (!isCurrentFilterSync(syncVersion)) return

      const filter = filters.value[index]
      const queryValue = route.query[filter.queryKey]
      const filterKey = filter.queryKey == 'section' ? 'code' : 'id'

      if (!queryValue) {
        if (filter.defaultValue) {
          filters.value[index].selectedItem = filter.defaultValue
          await enableReadyChildren(index, syncVersion)
          if (!isCurrentFilterSync(syncVersion)) return

          const query = { ...route.query }
          query[filter.queryKey] = filter.defaultValue.id
          router.replace({ query })
        }
        else {
          filters.value[index].selectedItem = null
        }
        continue
      }

      const ready = filter.dependencies?.every(
        dependency => filters.value[dependency.parent].selectedItem,
      )

      if (!ready && filter.dependencies?.length) {
        filters.value[index].selectedItem = null
        continue
      }

      if (filter.staticList?.length) {
        const selected = filter.staticList.find(
          item => String(item[filterKey]) === String(queryValue),
        )
        filters.value[index].selectedItem = selected || null
        if (!selected) continue
        if (isExclusiveFilterSelected(index)) {
          disableOtherFilters(index)
          continue
        }
        await enableReadyChildren(index, syncVersion)
        if (!isCurrentFilterSync(syncVersion)) return
      }
      else {
        const selected = await filter.refElement?.getItemById(queryValue, filterKey)
        filters.value[index].selectedItem = selected || null
        if (!selected) continue
        if (isExclusiveFilterSelected(index)) {
          disableOtherFilters(index)
          continue
        }
        await enableReadyChildren(index, syncVersion)
        if (!isCurrentFilterSync(syncVersion)) return
      }
    }
  }

  const syncFiltersFromQuery = async () => {
    const syncVersion = ++filterListSyncVersion

    await nextTick()
    if (!isCurrentFilterSync(syncVersion)) return

    await fetchDataRequireFilter(syncVersion)
    if (!isCurrentFilterSync(syncVersion)) return

    await fetchFilterAvailableInQuery(syncVersion)
  }

  const getFilterIdentity = filter => `${filter.queryKey ?? ''}:${filter.title ?? ''}`

  const reconcileFilterConfiguration = (filterConfiguration) => {
    const existingFilters = new Map(
      filters.value.map(filter => [getFilterIdentity(filter), filter]),
    )

    return filterConfiguration.map((filterConfig) => {
      const existingFilter = existingFilters.get(getFilterIdentity(filterConfig))
      if (!existingFilter) return createFilterState([filterConfig])[0]

      const runtimeState = {
        selectedItem: existingFilter.selectedItem,
        disabled: existingFilter.disabled,
        refElement: existingFilter.refElement,
      }

      Object.assign(existingFilter, filterConfig, runtimeState, {
        initialDisabled: filterConfig.disabled,
      })

      return existingFilter
    })
  }

  const debouncedSearchText = () => {
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
    timer.value = setTimeout(() => {
      onChangeFilter(route.query)
    }, 800)
  }

  const changeTextSearch = () => {
    if (!hasKeywordSearch.value) return

    const query = { ...route.query }
    if (textSearch.value.length == 0) {
      delete query.title
    }
    else {
      query.title = textSearch.value
    }
    router.replace({ query })
    debouncedSearchText()
  }

  const clearAllFilter = async () => {
    for (let index = 0; index < filters.value.length; index++) {
      const filter = filters.value[index]
      if (filter.selectedItem && !filter.defaultValue) {
        filter.selectedItem = null
        resetDescendants(index)
      }
    }
    updateQueryFromFilters()
  }

  watch(
    filterList,
    async (filterConfiguration) => {
      filters.value = reconcileFilterConfiguration(filterConfiguration)
      hasExclusiveDisabledState.value = false
      await syncFiltersFromQuery()
    },
    { flush: 'post' },
  )

  watch(
    () => route.query,
    () => syncFiltersFromQuery(),
    { deep: true },
  )

  return {
    changeTextSearch,
    clearAllFilter,
    clearFilter,
    countFilterSelect,
    filters,
    getFilterIdentity,
    selectService,
    setFilterRef,
    syncFiltersFromQuery,
    textSearch,
    updateSelectedItem,
  }
}

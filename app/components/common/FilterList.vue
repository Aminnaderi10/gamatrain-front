<template>
  <div
    class="w-100 d-flex justify-center flex-wrap"
    :class="{
      'filter-list-sticky-host': stickyContent,
      'filter-list-sidebar-layout': desktopSidebarLayout,
    }"
  >
    <div
      v-if="desktopSidebarLayout"
      class="search-workspace-heading d-none d-md-flex"
    >
      <slot
        name="results-heading"
        :count="countDataFound"
        :loading="loading"
      />
    </div>
    <v-col
      v-if="!$slots['services-navigation']"
      :cols="hasKeywordSearch ? `4` : `12`"
      md="12"
      class="d-flex d-md-none justify-start"
    >
      <CommonFilterTrigger
        :count="countFilterSelect"
        @click="dialogFilterMobileModel = !dialogFilterMobileModel"
      />
    </v-col>
    <v-col
      v-if="hasKeywordSearch"
      v-show="!headerSearchActive"
      cols="8"
      md="12"
      class="d-none d-md-flex justify-end justify-md-center"
      :class="{ 'header-search-teleport-source': keywordSearchInHeader }"
    >
      <Teleport
        :to="headerSearchActive ? '#search-header-keyword' : null"
        :disabled="!headerSearchActive"
      >
      <v-text-field
        v-model="textSearch"
        label="Search anything...."
        variant="outlined"
        color="academicGold"
        max-width="330"
        density="compact"
        hide-details
        class="custom-search-text-field"
        :class="{ 'header-keyword-search': headerSearchActive }"
        @update:model-value="changeTextSearch"
      >
        <template #append>
          <v-btn
            icon
            varient="text"
            color="academicGold"
            width="50"
            class="rounded-ts rounded-te-xl rounded-be-xl rounded-bs h-100 ml-n2"
            flat
          >
            <v-icon
              size="x-large"
              icon="md:search"
              color="grey800"
            />
          </v-btn>
        </template>
      </v-text-field>
      </Teleport>
    </v-col>

    <div
      class="w-100 d-flex justify-center flex-wrap"
      :class="{ 'filter-list-sticky-content': stickyContent || desktopSidebarLayout }"
    >
      <slot
        name="services-navigation"
        :select-service="selectService"
      />
      <div
        v-if="$slots['services-navigation']"
        class="mobile-quick-filter-bar d-flex d-md-none"
      >
        <div class="mobile-quick-filter-bar__trigger">
          <CommonFilterTrigger
            :count="countFilterSelect"
            icon="md:filter_list"
            label="Filters"
            @click="dialogFilterMobileModel = true"
          />
        </div>

        <div
          ref="mobileQuickFilters"
          class="mobile-quick-filter-bar__scroller"
          aria-label="Quick filters"
        >
          <div
            v-for="entry in mobileQuickFilterEntries"
            :key="`quick-${getFilterIdentity(entry.filter)}`"
            class="mobile-quick-filter"
            :class="{
              'mobile-quick-filter--selected': entry.filter.selectedItem,
              'mobile-quick-filter--disabled': entry.filter.disabled,
            }"
          >
            <button
              type="button"
              class="mobile-quick-filter__control"
              :aria-label="getQuickFilterAriaLabel(entry.filter)"
              :aria-pressed="Boolean(entry.filter.selectedItem)"
              :aria-disabled="entry.filter.disabled"
              :disabled="entry.filter.disabled"
              @click="openMobileQuickFilter(entry.filter)"
            >
              <span
                v-if="hasFilterIcon(entry.filter)"
                class="mobile-quick-filter__icon"
                :style="!entry.filter.selectedItem && entry.filter.unselectedIconColor
                  ? { color: entry.filter.unselectedIconColor }
                  : undefined"
                aria-hidden="true"
              >
                <CommonFilterControlIcon
                  :selected-item="entry.filter.selectedItem"
                  :show-item-icon="entry.filter.showItemIcon"
                  :icon-src="entry.filter.iconSrc"
                  :fallback-icon="entry.filter.fallbackIcon"
                  :fallback-icon-src="entry.filter.fallbackIconSrc"
                  :empty-fallback-icon-src="entry.filter.emptyFallbackIconSrc"
                  :fallback-icon-padding="entry.filter.fallbackIconPadding"
                  :control-icon="entry.filter.controlIcon"
                  :control-icon-src="entry.filter.controlIconSrc"
                />
              </span>

              <span class="mobile-quick-filter__copy">
                <span class="mobile-quick-filter__label">{{ entry.filter.title }}</span>
                <span
                  v-if="entry.filter.selectedItem"
                  class="mobile-quick-filter__value"
                >{{ getQuickFilterValue(entry.filter) }}</span>
              </span>
            </button>

            <button
              v-if="entry.filter.selectedItem && entry.filter.closable"
              type="button"
              class="mobile-quick-filter__clear"
              :aria-label="`Clear ${entry.filter.title} filter`"
              @click.stop="clearFilter(entry.index)"
            >
              <v-icon size="18">md:cancel</v-icon>
            </button>
          </div>
        </div>
      </div>
      <div
        class="desktop-filter-controls-shell w-100 d-flex justify-center"
      >
        <div
          class="desktop-filter-controls w-100"
        >
          <div
            v-if="desktopSidebarLayout"
            class="desktop-filter-sidebar-header d-none d-md-flex align-center justify-space-between"
          >
            <span class="desktop-filter-sidebar-title d-flex align-center ga-2">
              <v-icon size="18">md:filter_list</v-icon>
              Filters
            </span>
            <v-btn
              variant="text"
              class="desktop-filter-clear"
              @click="clearAllFilter"
            >
              Clear
            </v-btn>
          </div>
          <div
            class="desktop-filter-controls-content w-100 d-flex justify-center flex-wrap"
          >
            <component
              :is="filterContainer || 'div'"
              :style="filterContainer ? undefined : { display: 'contents' }"
            >
            <div
              class="w-100 d-none d-md-flex justify-center align-center flex-wrap ga-4"
              :class="{ 'mt-2': !filterContainer }"
              :style="filterContainer ? { marginTop: '16px' } : undefined"
            >
              <div class="d-flex flex-wrap w-100 max-width-container justify-start ga-2">
                <div
                  v-for="(filter, index) in filters"
                  :key="filter.title || index"
                  :style="{ display: $slots['services-navigation'] && filter.queryKey === 'type' ? 'none' : 'contents' }"
                >
                  <CommonChipSelectFilter
                    v-if="!filter.inlineOptions"
                    :ref="(el) => setFilterRef(filter, el)"
                    :title="filter.title"
                    :api="filter.api"
                    :selected-item="filter.selectedItem"
                    :extra-api-params="filter.extraApiParams"
                    :static-list="filter.staticList"
                    :item-filter="filter.itemFilter"
                    :item-transform="filter.itemTransform"
                    :item-sort="filter.itemSort"
                    :list-transform="filter.listTransform"
                    :show-item-icon="filter.showItemIcon"
                    :icon-src="filter.iconSrc"
                    :fallback-icon="filter.fallbackIcon"
                    :fallback-icon-src="filter.fallbackIconSrc"
                    :empty-fallback-icon-src="filter.emptyFallbackIconSrc"
                    :fallback-icon-padding="filter.fallbackIconPadding"
                    :boxed="filter.boxed"
                    :show-clear="Boolean(filterContainer && filter.closable && !filter.defaultValue)"
                    :selected-variant="filter.selectedVariant"
                    :control-icon="filter.controlIcon"
                    :control-icon-src="filter.controlIconSrc"
                    :unselected-icon-color="filter.unselectedIconColor"
                    :control-icon-padding="filter.controlIconPadding"
                    :inline-options="filter.inlineOptions"
                    :inline-allow-clear="filter.inlineAllowClear"
                    :item-title="filter.itemTitle"
                    :disabled="filter.disabled"
                    :has-search="filter.hasSearch"
                    @update-selected-item="updateSelectedItem($event, index)"
                    @clear="clearFilter(index)"
                  />
                </div>
              </div>
              <div
                v-if="!filterContainer"
                class="justify-start d-flex w-100 max-width-container"
              >
                <div class="d-flex flex-wrap ga-2 px-2">
                  <template v-for="(filter, index) in filters">
                    <v-chip
                      v-if="filter.selectedItem && !filter.defaultValue && !filter.inlineOptions"
                      :key="filter.title"
                      variant="flat"
                      class="text-h5 pl-5 pr-5"
                      color="grey100"
                    >
                      <span class="text-grey500">{{ filter.selectedItem?.title }}</span>
                      <template #close>
                        <v-icon
                          v-if="filter.closable"
                          class="filter-clear-icon"
                          color="grey500"
                          @click="clearFilter(index)"
                        >
                          md:cancel
                        </v-icon>
                      </template>
                    </v-chip>
                  </template>
                </div>
              </div>
            </div>

            <div
              v-if="hasInlineFilters"
              class="inline-filter-group-wrapper"
            >
              <div class="inline-filter-group">
                <CommonChipSelectFilter
                  v-for="(entry, inlineIndex) in inlineFilterEntries"
                  :key="`inline-${entry.filter.title || entry.index}`"
                  :ref="(el) => setFilterRef(entry.filter, el)"
                  :title="entry.filter.title"
                  :api="entry.filter.api"
                  :selected-item="entry.filter.selectedItem"
                  :extra-api-params="entry.filter.extraApiParams"
                  :static-list="entry.filter.staticList"
                  :item-filter="entry.filter.itemFilter"
                  :inline-options="true"
                  :inline-allow-clear="entry.filter.inlineAllowClear"
                  :inline-grouped="true"
                  :inline-items-per-row="resolveInlineItemsPerRow(entry.filter)"
                  :inline-divider-after="inlineIndex === 0 && inlineFilterEntries.length > 1"
                  :inline-leading-option-slots="entry.filter.inlineLeadingOptionSlots"
                  :item-title="entry.filter.itemTitle"
                  :disabled="entry.filter.disabled"
                  @update-selected-item="updateSelectedItem($event, entry.index)"
                />
              </div>
            </div>
            </component>
          </div>
        </div>
      </div>

      <div
        v-if="!desktopSidebarLayout"
        class="persistent-search-content-shell w-100 d-flex justify-center"
      >
        <div
          class="persistent-search-content w-100 d-flex justify-center flex-wrap"
        >
          <slot name="after-inline-filters" />

          <v-col
            cols="12"
            class="d-flex align-end justify-end ga-2 mt-1 py-0 px-2 max-width-container"
          >
            <slot
              name="results-heading"
              :count="countDataFound"
              :loading="loading"
            >
              <span class="text-h5 text-grey400">Result</span>
              <v-skeleton-loader
                v-if="loading"
                width="100"
                height="20"
                class="rounded-lg"
              />
              <span
                v-else
                class="text-h4 text-grey700 font-weight-bold"
              >{{
                $numberFormat(countDataFound)
              }}</span>
            </slot>
          </v-col>
        </div>
      </div>

      <div class="search-results-scroll-region">
        <template v-if="desktopSidebarLayout">
          <slot name="after-inline-filters" />
        </template>

        <slot />
      </div>

      <v-dialog
        v-model="dialogFilterMobileModel"
        transition="dialog-bottom-transition"
        fullscreen
        scrim="white"
      >
      <div class="mobile-filter-modal w-100 h-100 d-flex flex-column overflow-y-auto position-relative">
        <v-container class="mobile-filter-modal__container flex-column">
          <section class="mobile-filter-panel">
            <div class="mobile-filter-panel__header d-flex align-center justify-space-between">
              <span class="mobile-filter-panel__title d-flex align-center ga-2">
                <v-icon size="18">md:filter_list</v-icon>
                Filters
              </span>
              <div class="d-flex align-center ga-1">
                <v-btn
                  variant="text"
                  class="mobile-filter-panel__clear"
                  @click="clearAllFilter"
                >
                  Clear
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  class="mobile-filter-panel__close"
                  aria-label="Close filters"
                  @click="dialogFilterMobileModel = false"
                >
                  <v-icon size="20">md:close</v-icon>
                </v-btn>
              </div>
            </div>

            <div class="mobile-filter-control-list">
              <template
                v-for="(filter, index) in filters"
                :key="`mobile-${filter.title || index}`"
              >
                <div
                  v-if="!filter.inlineOptions && !($slots['services-navigation'] && filter.queryKey === 'type')"
                  :ref="(element) => setMobileFilterSectionRef(filter, element)"
                  class="mobile-filter-control-wrapper"
                  @click.capture="handleMobileFilterControlClick($event, filter)"
                >
                  <CommonChipSelectFilter
                    :title="filter.title"
                    :api="filter.api"
                    :selected-item="filter.selectedItem"
                    :extra-api-params="filter.extraApiParams"
                    :static-list="filter.staticList"
                    :item-filter="filter.itemFilter"
                    :item-transform="filter.itemTransform"
                    :item-sort="filter.itemSort"
                    :list-transform="filter.listTransform"
                    :show-item-icon="filter.showItemIcon"
                    :icon-src="filter.iconSrc"
                    :fallback-icon="filter.fallbackIcon"
                    :fallback-icon-src="filter.fallbackIconSrc"
                    :empty-fallback-icon-src="filter.emptyFallbackIconSrc"
                    :fallback-icon-padding="filter.fallbackIconPadding"
                    :boxed="filter.boxed"
                    :show-clear="Boolean(filter.closable && !filter.defaultValue)"
                    :selected-variant="filter.selectedVariant"
                    :control-icon="filter.controlIcon"
                    :control-icon-src="filter.controlIconSrc"
                    :unselected-icon-color="filter.unselectedIconColor"
                    :control-icon-padding="filter.controlIconPadding"
                    :item-title="filter.itemTitle"
                    :disabled="filter.disabled"
                    :has-search="filter.hasSearch"
                    @clear="clearFilter(index)"
                  />
                </div>
              </template>
            </div>

            <div
              v-if="hasInlineFilters"
              class="mobile-inline-filter-group"
            >
              <div
                v-for="(entry, inlineIndex) in inlineFilterEntries"
                :key="`mobile-inline-${entry.filter.title || entry.index}-${getMobileFilterItemsSignature(entry.filter)}`"
                :ref="(element) => setMobileFilterSectionRef(entry.filter, element)"
                class="mobile-inline-filter-row-wrapper"
              >
                <CommonChipSelectFilter
                  class="mobile-inline-filter-row"
                  :title="entry.filter.title"
                  :api="null"
                  :selected-item="entry.filter.selectedItem"
                  :static-list="getMobileFilterItems(entry.filter)"
                  :inline-options="true"
                  :inline-allow-clear="entry.filter.inlineAllowClear"
                  :inline-grouped="true"
                  :inline-items-per-row="resolveInlineItemsPerRow(entry.filter)"
                  :inline-divider-after="inlineIndex === 0 && inlineFilterEntries.length > 1"
                  :inline-leading-option-slots="entry.filter.inlineLeadingOptionSlots"
                  :item-title="entry.filter.itemTitle"
                  :disabled="entry.filter.disabled"
                  @update-selected-item="updateSelectedItem($event, entry.index)"
                />
              </div>
            </div>
          </section>
        </v-container>
        <div
          class="mobile-filter-modal__footer w-100 d-flex align-center justify-center position-fixed bottom-0"
        >
          <v-btn
            color="academicGold"
            rounded="xl"
            height="40"
            class="mobile-filter-modal__show-results text-h5 text-grey800"
            :loading="loading"
            @click="dialogFilterMobileModel = false"
          >
            Show {{ $numberFormat(countDataFound) }} Results
          </v-btn>
        </div>
      </div>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const router = useRouter()
const route = useRoute()
const { mdAndUp } = useDisplay()
const searchHeaderReady = ref(false)

const props = defineProps({
  filterList: {
    type: Array,
    default: () => [],
  },
  filterContainer: {
    type: [Object, Function],
    default: null,
  },
  countDataFound: {
    type: [Number, String],
    default: () => 0,
  },
  hasKeywordSearch: {
    type: Boolean,
    default: false,
  },
  keywordSearchInHeader: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  stickyContent: {
    type: Boolean,
    default: false,
  },
  desktopSidebarLayout: {
    type: Boolean,
    default: false,
  },
})

const headerSearchActive = computed(() => props.keywordSearchInHeader && searchHeaderReady.value && mdAndUp.value)
const emits = defineEmits(['changeFilter'])
const slots = useSlots()

const getActiveFilterCount = query => Object.keys(query).filter(
  key => !(slots['services-navigation'] && key === 'type'),
).length

const createFilterState = filterList =>
  filterList.map(filter => ({
    ...filter,
    initialDisabled: filter.disabled,
  }))

const filters = ref(createFilterState(props.filterList))
const setFilterRef = (filter, element) => {
  filter.refElement = element
}
const mobileQuickFilters = ref(null)
const mobileFilterSectionElements = new Map()
const resolveInlineItemsPerRow = filter =>
  typeof filter.inlineItemsPerRow === 'function'
    ? filter.inlineItemsPerRow(filters.value)
    : filter.inlineItemsPerRow
const dialogFilterMobileModel = ref(false)
const countFilterSelect = ref(getActiveFilterCount(route.query))
const textSearch = ref(route.query.title ? route.query.title : '')
const timer = ref(null)
const hasExclusiveDisabledState = ref(false)
let pendingServiceChange = false
let filterListSyncVersion = 0

const isCurrentFilterSync = syncVersion =>
  syncVersion === undefined || syncVersion === filterListSyncVersion

watch(mdAndUp, (isDesktop) => {
  if (isDesktop) dialogFilterMobileModel.value = false
})

onMounted(async () => {
  searchHeaderReady.value = true
  await syncFiltersFromQuery()
})

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

      if (readyForGetStatic) {
        if (child.getStaticList) {
          const staticList = child.getStaticList('reset')
          child.refElement.setStaticItem(staticList)
          child.selectedItem = null
        }
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

const filterDataLoads = new WeakMap()

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

      if (readyForGetStatic) {
        if (
          child.getStaticList
          && filterParent.selectedItem
          && filterParent.selectedItem.id
        ) {
          const staticList = child.getStaticList(filterParent.selectedItem.id)
          child.refElement.setStaticItem(staticList)
        }
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

const clearFilter = (index) => {
  filters.value[index].selectedItem = null

  if (hasExclusiveDisabledState.value) {
    restoreDisabledState()
    hasExclusiveDisabledState.value = false
  }

  resetDescendants(index)

  updateQueryFromFilters()
}

const updateQueryFromFilters = async () => {
  const query = {}
  const titles = {}

  filters.value.forEach((f) => {
    // Due to the update to version 2 of the backend for the board, this f.title != 'Board' has been placed.
    // if (f.queryKey && f.selectedItem?.code && f.title != 'Board') {
    if (f.queryKey && f.selectedItem?.code) {
      query[f.queryKey] = f.selectedItem.code
      titles[f.queryKey] = f.selectedItem.title
    }
    else if (f.queryKey && f.selectedItem?.id) {
      query[f.queryKey] = f.selectedItem.id
      titles[f.queryKey] = f.selectedItem.title
    }
  })

  countFilterSelect.value = getActiveFilterCount(query)
  router.replace({ query })
  emits('changeFilter', query, titles, { serviceChange: pendingServiceChange })
}

const fetchDataRequireFilter = async (syncVersion) => {
  for (let i = 0; i < filters.value.length; i++) {
    if (!isCurrentFilterSync(syncVersion)) return

    const filter = filters.value[i]
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
    const qVal = route.query[filter.queryKey]
    // Due to the update to version 2 of the backend for the board, change filter key to id.
    // old code
    const filterKey = filter.queryKey == 'section' ? 'code' : 'id'
    // const filterKey = 'id'

    if (!qVal) {
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
      dep => filters.value[dep.parent].selectedItem,
    )

    if (!ready && filter.dependencies?.length) {
      filters.value[index].selectedItem = null
      continue
    }

    if (filter.staticList?.length) {
      const selected = filter.staticList.find(
        x => String(x[filterKey]) === String(qVal),
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
      const selected = await filter.refElement?.getItemById(qVal, filterKey)
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

const reconcileFilterConfiguration = (filterList) => {
  const existingFilters = new Map(
    filters.value.map(filter => [getFilterIdentity(filter), filter]),
  )

  return filterList.map((filterConfig) => {
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

watch(
  () => props.filterList,
  async (filterList) => {
    filters.value = reconcileFilterConfiguration(filterList)
    hasExclusiveDisabledState.value = false
    await syncFiltersFromQuery()
  },
  { flush: 'post' },
)

const openFilterSelectModal = (filter) => {
  if (filter.disabled) return

  filter.refElement.openSelectModal()
}

const setMobileFilterSectionRef = (filter, element) => {
  const identity = getFilterIdentity(filter)
  if (element) {
    mobileFilterSectionElements.set(identity, element)
  }
  else {
    mobileFilterSectionElements.delete(identity)
  }
}

const hasFilterIcon = filter => Boolean(
  filter.showItemIcon
  || filter.controlIcon
  || filter.controlIconSrc,
)

const getQuickFilterValue = (filter) => {
  if (!filter.selectedItem) return ''

  return filter.itemTitle?.(filter.selectedItem) || filter.selectedItem.title || ''
}

const getQuickFilterAriaLabel = (filter) => {
  const value = getQuickFilterValue(filter)
  return value ? `${filter.title}: ${value}` : filter.title
}

const openMobileQuickFilter = (filter) => {
  if (filter.inlineOptions) {
    filter.refElement.openInlineOptionsModal()
    return
  }

  openFilterSelectModal(filter)
}

const handleMobileFilterControlClick = (event, filter) => {
  const target = event.target
  if (target instanceof Element && target.closest('.search-filter-clear-icon')) return

  event.preventDefault()
  event.stopPropagation()
  openFilterSelectModal(filter)
}

const getMobileFilterItems = (filter) => {
  const loadedItems = filter.refElement?.getCurrentItems?.()
  return Array.isArray(loadedItems) ? loadedItems : (filter.staticList || [])
}

const getMobileFilterItemsSignature = filter => JSON.stringify(
  getMobileFilterItems(filter).map(item => [item.id, item.title]),
)

watch(
  () => route.query,
  () => syncFiltersFromQuery(),
  { deep: true },
)
const inlineFilterEntries = computed(() =>
  filters.value
    .map((filter, index) => ({ filter, index }))
    .filter(entry => entry.filter.inlineOptions),
)
const hasInlineFilters = computed(() => inlineFilterEntries.value.length > 0)
const mobileQuickFilterEntries = computed(() =>
  filters.value
    .map((filter, index) => ({ filter, index }))
    .filter(entry => entry.filter.queryKey !== 'type'),
)
const activeFilterService = computed(() =>
  filters.value.find(filter => filter.queryKey === 'type')?.selectedItem?.id,
)

watch(activeFilterService, async (service, previousService) => {
  if (!previousService || service === previousService) return

  await nextTick()
  if (mobileQuickFilters.value) mobileQuickFilters.value.scrollLeft = 0
})

const changeTextSearch = () => {
  if (props.hasKeywordSearch) {
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
}

const debouncedSearchText = () => {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
  timer.value = setTimeout(() => {
    emits('changeFilter', route.query)
  }, 800)
}

const clearAllFilter = async () => {
  for (let i = 0; i < filters.value.length; i++) {
    const filter = filters.value[i]
    if (
      filter.selectedItem
      && !filter.defaultValue
    ) {
      filter.selectedItem = null
      resetDescendants(i)
    }
  }
  updateQueryFromFilters()
}
</script>

<style scoped>
.header-keyword-search {
  width: 100%;
  min-width: 0;
}

.header-keyword-search :deep(.v-field) {
  color: rgb(var(--v-theme-brandNavy));
  background: rgb(var(--v-theme-grey25));
  border-radius: 12px;
}

.header-keyword-search :deep(.v-field__outline) {
  color: rgb(var(--v-theme-borderSubtle));
}

.header-keyword-search :deep(.v-field--focused .v-field__outline) {
  color: rgb(var(--v-theme-academicGold));
}

@media (min-width: 960px) {
  .header-search-teleport-source {
    display: none !important;
  }
}

.filter-clear-icon {
  color: rgb(var(--v-theme-grey500)) !important;
}

.filter-clear-icon:hover {
  color: rgb(var(--v-theme-errorStrong)) !important;
}

:deep(.height-badge .v-badge__wrapper .v-badge__badge) {
  height: 20px !important;
}

:deep(.custom-search-text-field .v-field__outline__start) {
  border-radius: 24px 0 0 24px !important;
  flex: 0 0 30px !important;
}
:deep(.custom-search-text-field .v-field__outline__end) {
  border-radius: 0 4px 4px 0 !important;
}
.max-width-container {
  max-width: 1200px;
}
.filter-list-sticky-content {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-grey25));
}
.filter-list-sticky-host {
  display: contents !important;
}
.desktop-filter-controls,
.persistent-search-content {
  background: rgb(var(--v-theme-grey25));
}
.inline-filter-group-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  justify-content: flex-start;
}
.inline-filter-group {
  display: flex;
  width: fit-content;
  max-width: 1200px;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px 24px 0 0;
  margin-right: auto;
  margin-top: 16px;
  background: rgb(var(--v-theme-grey25));
  border: 1px solid rgb(var(--v-theme-borderSubtle));
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(var(--v-theme-brandNavy), 0.07);
}

.search-results-scroll-region {
  display: contents;
}

.desktop-filter-sidebar-header {
  padding: 16px;
  border-bottom: 1px solid rgb(var(--v-theme-borderSubtle));
}

.desktop-filter-sidebar-title {
  color: rgb(var(--v-theme-brandNavy));
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}

.desktop-filter-clear {
  min-width: 0;
  height: 32px !important;
  padding: 0 8px !important;
  color: rgb(var(--v-theme-errorStrong));
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0;
  text-transform: none;
}

@media (min-width: 960px) {
  .filter-list-sidebar-layout {
    box-sizing: border-box;
    display: grid !important;
    width: 100%;
    max-width: 1232px;
    height: auto;
    min-height: 100%;
    grid-template-rows: 48px auto;
    align-content: start;
    margin: 0 auto;
    overflow: visible;
    background: rgb(var(--v-theme-grey25));
  }

  .search-workspace-heading {
    width: 100%;
    min-width: 0;
    min-height: 48px;
    align-items: center;
    padding: 0 4px;
    background: transparent;
  }

  .filter-list-sidebar-layout > .filter-list-sticky-content {
    display: grid !important;
    position: relative;
    top: auto;
    min-width: 0;
    min-height: 100%;
    grid-template-columns: 240px minmax(0, 980px);
    grid-template-rows: auto auto;
    column-gap: 12px;
    row-gap: 0;
    align-items: start;
    justify-content: stretch !important;
    overflow: visible;
    background: rgb(var(--v-theme-grey25));
  }

  .filter-list-sidebar-layout :deep(.services-navigation) {
    position: sticky;
    z-index: 4;
    top: 8px;
    grid-column: 2;
    grid-row: 1;
    max-width: none;
    background: rgb(var(--v-theme-grey25));
    box-shadow: 0 -8px 0 rgb(var(--v-theme-white));
  }

  .filter-list-sidebar-layout :deep(.services-navigation__items) {
    width: 100%;
    max-width: none;
  }

  .filter-list-sidebar-layout .desktop-filter-controls-shell {
    position: sticky;
    z-index: 5;
    top: 8px;
    grid-column: 1;
    grid-row: 1 / span 2;
    min-width: 0;
    min-height: 0;
    max-height: calc(100dvh - 16px);
    align-items: stretch;
    align-self: start;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-color: rgb(var(--v-theme-borderSubtle)) transparent;
    scrollbar-width: thin;
    background: rgb(var(--v-theme-grey25));
    border: 1px solid rgb(var(--v-theme-borderSubtle));
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(var(--v-theme-brandNavy), 0.07);
  }

  .filter-list-sidebar-layout .desktop-filter-controls-shell::-webkit-scrollbar {
    width: 6px;
  }

  .filter-list-sidebar-layout .desktop-filter-controls-shell::-webkit-scrollbar-thumb {
    background: rgb(var(--v-theme-borderSubtle));
    border-radius: 999px;
  }

  .filter-list-sidebar-layout .desktop-filter-controls-shell::-webkit-scrollbar-track {
    background: transparent;
  }

  .filter-list-sidebar-layout .desktop-filter-controls {
    min-width: 0;
    background: rgb(var(--v-theme-grey25));
  }

  .filter-list-sidebar-layout .desktop-filter-controls-content {
    display: block !important;
    min-width: 0;
    padding-bottom: 0;
    background: rgb(var(--v-theme-grey25));
  }

  .filter-list-sidebar-layout :deep(.services-filter-container) {
    display: block;
    max-width: none;
    padding: 0;
    background: rgb(var(--v-theme-grey25));
  }

  .filter-list-sidebar-layout :deep(.services-filter-container > div:first-child) {
    display: block !important;
    margin-top: 0 !important;
  }

  .filter-list-sidebar-layout :deep(.services-filter-container .max-width-container) {
    display: flex !important;
    max-width: none;
    flex-direction: column;
    flex-wrap: nowrap !important;
    gap: 0 !important;
  }

  .filter-list-sidebar-layout :deep(.search-filter-control) {
    width: 100%;
    min-width: 0;
    height: 56px !important;
    justify-content: stretch !important;
    padding-inline: 16px;
    direction: ltr;
    text-align: left;
    background: transparent;
    border: 0 !important;
    border-bottom: 1px solid rgb(var(--v-theme-surfaceTertiary)) !important;
    border-radius: 0 !important;
    box-shadow: none;
  }

  .filter-list-sidebar-layout :deep(.search-filter-control:not(.search-filter-has-icon)) {
    padding-left: 52px;
  }

  .filter-list-sidebar-layout :deep(.search-filter-control .v-btn__content) {
    justify-content: flex-start !important;
  }

  .filter-list-sidebar-layout :deep(.search-filter-copy) {
    width: 0;
    flex: 1 1 auto;
    align-items: flex-start;
    overflow: hidden;
    text-align: left;
  }

  .filter-list-sidebar-layout :deep(.search-filter-control:hover) {
    background: rgb(var(--v-theme-surfaceSecondary));
  }

  .filter-list-sidebar-layout :deep(.search-filter-control.open-style-btn) {
    background: rgb(var(--v-theme-grey25));
  }

  .filter-list-sidebar-layout :deep(.search-filter-control.open-style-btn:not(.search-filter-empty)) {
    background: rgb(var(--v-theme-borderSubtle));
  }

  .filter-list-sidebar-layout :deep(.search-filter-control.dependent-selected-btn) {
    background: rgb(var(--v-theme-borderSubtle));
  }

  .filter-list-sidebar-layout :deep(.search-filter-value) {
    width: 100%;
    max-width: 100%;
  }

  .filter-list-sidebar-layout .inline-filter-group-wrapper {
    display: block;
    max-width: none;
  }

  .filter-list-sidebar-layout :deep(.inline-filter-group) {
    display: flex;
    width: 100%;
    max-width: none;
    flex-direction: column !important;
    gap: 0 !important;
    padding: 0 16px !important;
    margin: 0 !important;
    background: rgb(var(--v-theme-grey25));
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none;
  }

  .filter-list-sidebar-layout :deep(.inline-filter-group > .inline-filter-grouped-row) {
    width: 100%;
    max-width: 100%;
    min-height: 0;
    padding: 12px 0;
  }

  .filter-list-sidebar-layout :deep(.inline-filter-group > .inline-filter-grouped-row + .inline-filter-grouped-row) {
    position: relative;
    padding-top: 12px;
    padding-left: 0;
    margin-top: 0;
    border-left: 0;
  }

  .filter-list-sidebar-layout :deep(.inline-filter-group > .inline-filter-grouped-row + .inline-filter-grouped-row::before) {
    position: absolute;
    top: 0;
    right: -16px;
    left: -16px;
    border-top: 1px solid rgb(var(--v-theme-surfaceTertiary));
    content: '';
    pointer-events: none;
  }

  .filter-list-sidebar-layout :deep(.inline-filter-grouped-row .inline-filter-row-content) {
    display: block;
    height: auto;
  }

  .filter-list-sidebar-layout :deep(.inline-filter-label) {
    display: block;
    margin: 0 0 8px 36px;
    color: rgb(var(--v-theme-brandNavy));
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  .filter-list-sidebar-layout :deep(.inline-filter-options) {
    display: grid;
    width: calc(100% - 36px);
    grid-template-columns: max-content repeat(3, max-content);
    gap: 6px;
    align-items: center;
    justify-content: start;
    margin-left: 36px;
  }

  .filter-list-sidebar-layout :deep(.inline-filter-option) {
    min-height: 28px;
    padding: 3px 8px !important;
    border-radius: 8px !important;
    font-size: 12px;
    line-height: 18px;
  }

  .filter-list-sidebar-layout :deep(.inline-filter-option.inline-filter-option-multi-digit) {
    padding-inline: 4px !important;
  }

  .filter-list-sidebar-layout .search-results-scroll-region {
    display: block;
    grid-column: 2;
    grid-row: 2;
    min-width: 0;
    min-height: 100vh;
    padding: 12px;
    overflow: visible;
    background: transparent;
    border: 1px solid rgb(var(--v-theme-borderSubtle));
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(var(--v-theme-brandNavy), 0.07);
  }

  .filter-list-sidebar-layout :deep(.subject-directory-container) {
    max-width: none;
    padding-top: 0;
    padding-bottom: 12px;
  }

  .filter-list-sidebar-layout :deep(.search-results-list) {
    gap: 12px !important;
    margin-top: 0 !important;
  }
}

@media (max-width: 959px) {
  .mobile-quick-filter-bar {
    position: sticky;
    z-index: 10;
    top: 0;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    height: 64px;
    align-items: center;
    gap: 0;
    padding: 6px 12px;
    overflow: hidden;
    background: rgb(var(--v-theme-grey25));
    border-bottom: 1px solid rgb(var(--v-theme-borderSubtle));
  }

  .mobile-quick-filter-bar__trigger {
    position: relative;
    z-index: 1;
    display: flex;
    width: 108px;
    min-width: 108px;
    height: 52px;
    flex: 0 0 108px;
    align-items: stretch;
    justify-content: flex-start;
    box-shadow: 4px 0 8px -4px rgba(var(--v-theme-brandNavy), 0.18);
    transition: background-color 160ms ease;
  }

  .mobile-quick-filter-bar__trigger:hover {
    background: rgb(var(--v-theme-surfaceSecondary));
  }

  .mobile-quick-filter-bar__trigger :deep(.height-badge) {
    width: 100%;
    height: 100%;
  }

  .mobile-quick-filter-bar__trigger :deep(.filter-trigger) {
    width: 100%;
    height: 100% !important;
    min-width: 0;
    justify-content: flex-start;
    padding-inline: 12px;
    background: rgb(var(--v-theme-grey25));
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none;
  }

  .mobile-quick-filter-bar__trigger :deep(.filter-trigger:hover) {
    background: transparent !important;
  }

  .mobile-quick-filter-bar__trigger :deep(.filter-trigger .v-btn__overlay) {
    opacity: 0 !important;
  }

  .mobile-quick-filter-bar__scroller {
    display: flex;
    min-width: 0;
    height: 52px;
    flex: 1 1 auto;
    align-items: stretch;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-inline: contain;
    scrollbar-width: none;
    touch-action: pan-x pan-y;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .mobile-quick-filter-bar__scroller::-webkit-scrollbar {
    display: none;
  }

  .mobile-quick-filter {
    position: relative;
    display: flex;
    width: 112px;
    min-width: 104px;
    height: 52px;
    flex: 0 0 auto;
    align-items: stretch;
    overflow: hidden;
    color: rgb(var(--v-theme-brandNavy));
    background: rgb(var(--v-theme-grey25));
    border-left: 1px solid rgb(var(--v-theme-surfaceTertiary));
    transition: background-color 160ms ease;
  }

  .mobile-quick-filter:first-child {
    border-left: 0;
  }

  .mobile-quick-filter--selected {
    box-sizing: border-box;
    width: 148px;
    max-width: 160px;
    height: 100%;
    padding-right: 12px;
    background: transparent;
    border-radius: 0;
  }

  .mobile-quick-filter--disabled {
    color: rgba(var(--v-theme-brandNavy), 0.38);
  }

  .mobile-quick-filter--disabled .mobile-quick-filter__control {
    cursor: default;
  }

  .mobile-quick-filter--disabled .mobile-quick-filter__icon,
  .mobile-quick-filter--disabled .mobile-quick-filter__copy {
    opacity: 0.38;
  }

  .mobile-quick-filter--disabled .mobile-quick-filter__control:hover,
  .mobile-quick-filter--disabled .mobile-quick-filter__control:active {
    background: transparent;
  }

  .mobile-quick-filter__control {
    display: flex;
    min-width: 0;
    min-height: 44px;
    flex: 1 1 auto;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    overflow: hidden;
    color: inherit;
    font: inherit;
    text-align: left;
    background: transparent;
    border: 0;
    border-radius: inherit;
    cursor: pointer;
  }

  .mobile-quick-filter--selected .mobile-quick-filter__control {
    height: 100%;
    padding-right: 4px;
    border-radius: 0;
  }

  .mobile-quick-filter__control:hover {
    background: rgb(var(--v-theme-surfaceSecondary));
  }

  .mobile-quick-filter--selected .mobile-quick-filter__control:hover {
    background: transparent;
  }

  .mobile-quick-filter__control:active {
    background: rgb(var(--v-theme-surfaceTertiary));
  }

  .mobile-quick-filter__control:focus-visible,
  .mobile-quick-filter__clear:focus-visible {
    z-index: 1;
    outline: 3px solid rgba(var(--v-theme-academicGold), 0.28);
    outline-offset: -3px;
  }

  .mobile-quick-filter__icon {
    box-sizing: border-box;
    display: inline-flex;
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    align-items: center;
    justify-content: center;
    color: rgb(var(--v-theme-brandNavy));
  }

  .mobile-quick-filter__icon :deep(.v-img) {
    width: 100%;
    height: 100%;
  }

  .mobile-quick-filter__icon :deep(.v-icon),
  .mobile-quick-filter__icon :deep(.search-filter-content-icon) {
    width: 20px;
    height: 20px;
    min-width: 20px;
    font-size: 20px !important;
    line-height: 20px;
  }

  .mobile-quick-filter__icon :deep(.search-filter-fallback-image) {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .mobile-quick-filter__copy {
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    line-height: 1.2;
  }

  .mobile-quick-filter__label,
  .mobile-quick-filter__value {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-quick-filter__label {
    color: rgb(var(--v-theme-brandNavy));
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
  }

  .mobile-quick-filter--selected .mobile-quick-filter__label {
    color: rgba(var(--v-theme-brandNavy), 0.68);
    font-size: 11px;
    font-weight: 500;
    line-height: 14px;
  }

  .mobile-quick-filter__value {
    color: rgb(var(--v-theme-brandNavy));
    font-size: 14px;
    font-weight: 650;
    line-height: 18px;
  }

  .mobile-quick-filter__clear {
    display: inline-flex;
    width: 18px;
    min-width: 18px;
    min-height: 44px;
    flex: 0 0 18px;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: rgb(var(--v-theme-grey500));
    background: transparent;
    border: 0;
    border-radius: 0;
    cursor: pointer;
  }

  .mobile-quick-filter__clear:hover {
    color: rgb(var(--v-theme-errorStrong));
  }

  .desktop-filter-controls-shell .inline-filter-group-wrapper {
    display: none;
  }

  .mobile-filter-modal {
    height: 100dvh !important;
    overflow: hidden !important;
    color: rgb(var(--v-theme-brandNavy));
    background: rgb(var(--v-theme-surfaceSecondary));
  }

  .mobile-filter-modal__container {
    display: block;
    width: 100%;
    max-width: none;
    height: 100%;
    min-height: 0;
    flex: 1 1 auto;
    padding: 0 0 calc(88px + env(safe-area-inset-bottom));
    margin: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .mobile-filter-panel {
    width: 100%;
    min-height: calc(100dvh - 88px);
    overflow: visible;
    background: rgb(var(--v-theme-grey25));
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .mobile-filter-panel__header {
    min-height: 64px;
    padding: 16px;
    border-bottom: 1px solid rgb(var(--v-theme-borderSubtle));
  }

  .mobile-filter-panel__title {
    color: rgb(var(--v-theme-brandNavy));
    font-size: 16px;
    font-weight: 700;
    line-height: 24px;
  }

  .mobile-filter-panel__clear {
    min-width: 0;
    height: 32px !important;
    padding: 0 8px !important;
    color: rgb(var(--v-theme-errorStrong));
    font-size: 12px;
    font-weight: 650;
    letter-spacing: 0;
    text-transform: none;
  }

  .mobile-filter-panel__close {
    width: 32px !important;
    height: 32px !important;
    color: rgb(var(--v-theme-grey500));
  }

  .mobile-filter-control-wrapper {
    width: 100%;
  }

  .mobile-filter-control-list :deep(.search-filter-control) {
    width: 100%;
    min-width: 0;
    height: 56px !important;
    justify-content: stretch !important;
    padding-inline: 16px;
    direction: ltr;
    color: rgb(var(--v-theme-brandNavy));
    text-align: left;
    background: rgb(var(--v-theme-grey25));
    border: 0 !important;
    border-bottom: 1px solid rgb(var(--v-theme-surfaceTertiary)) !important;
    border-radius: 0 !important;
    box-shadow: none;
  }

  .mobile-filter-control-list :deep(.search-filter-control:not(.search-filter-has-icon)) {
    padding-left: 52px;
  }

  .mobile-filter-control-list :deep(.search-filter-control .v-btn__content) {
    justify-content: flex-start !important;
  }

  .mobile-filter-control-list :deep(.search-filter-copy) {
    align-items: flex-start;
    text-align: left;
  }

  .mobile-filter-control-list :deep(.search-filter-control:hover) {
    background: rgb(var(--v-theme-surfaceSecondary));
  }

  .mobile-filter-control-list :deep(.search-filter-control.open-style-btn:not(.search-filter-empty)),
  .mobile-filter-control-list :deep(.search-filter-control.dependent-selected-btn) {
    background: rgb(var(--v-theme-borderSubtle));
    border-color: transparent !important;
  }

  .mobile-filter-control-list :deep(.search-filter-value) {
    max-width: min(190px, 48vw);
  }

  .mobile-inline-filter-group {
    width: 100%;
    padding: 0 16px;
    background: rgb(var(--v-theme-grey25));
  }

  .mobile-inline-filter-row-wrapper {
    width: 100%;
  }

  .mobile-inline-filter-group :deep(.inline-filter-selector) {
    display: flex;
    width: 100%;
    max-width: 100%;
    min-height: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 12px 0;
    margin: 0;
    background: rgb(var(--v-theme-grey25));
    border: 0;
    border-radius: 0;
  }

  .mobile-inline-filter-group :deep(.inline-filter-row-content) {
    display: block;
    height: auto;
  }

  .mobile-inline-filter-group :deep(.inline-filter-label) {
    display: block;
    margin: 0 0 8px 36px;
    color: rgb(var(--v-theme-brandNavy));
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  .mobile-inline-filter-group :deep(.inline-filter-options) {
    display: grid;
    width: calc(100% - 36px);
    gap: 6px;
    align-items: center;
    justify-content: start;
    margin-left: 36px;
  }

  .mobile-inline-filter-group :deep(.inline-filter-option) {
    min-height: 28px;
    padding: 3px 8px !important;
    border-color: rgb(var(--v-theme-borderSubtle)) !important;
    border-radius: 8px !important;
    font-size: 12px;
    line-height: 18px;
  }

  .mobile-inline-filter-group :deep(.inline-filter-option.inline-filter-option-multi-digit) {
    padding-inline: 4px !important;
  }

  .mobile-inline-filter-group :deep(.inline-filter-divider) {
    display: block;
    width: calc(100% + 32px);
    margin: 12px -16px 0;
    border-top: 1px solid rgb(var(--v-theme-surfaceTertiary));
  }

  .mobile-filter-modal__footer {
    z-index: 2;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    background: rgb(var(--v-theme-grey25));
    border-top: 1px solid rgb(var(--v-theme-borderSubtle));
  }

  .mobile-filter-modal__show-results {
    width: 100%;
    max-width: 448px;
  }

  .filter-list-sidebar-layout > .filter-list-sticky-content {
    display: contents !important;
  }

  .filter-list-sidebar-layout :deep(.services-navigation) {
    order: -1;
  }
}
</style>

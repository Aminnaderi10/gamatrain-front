<template>
  <v-container class="flex-column margin-top-handle">
    <v-row class="justify-center">
      <div class="w-100 d-flex justify-center flex-wrap top-info-div">
        <CommonFilterList
          :filter-list="filters"
          :filter-container="ServicesFilterContainer"
          :style="{ '--search-service-color': activeServiceColor }"
          :count-data-found="totalDataFind"
          :loading="isInitialDataLoading"
          has-keyword-search
          keyword-search-in-header
          keyword-search-target="#search-workspace-keyword"
          desktop-sidebar-layout
          @change-filter="changeFilter"
        >
          <template #services-navigation="{ selectService }">
            <SearchServicesTabs
              :active-service="activeService"
              :service-counts="serviceResultCounts"
              @change="selectService"
            />
          </template>
          <template #after-inline-filters>
            <div class="subject-directory-container w-100 d-flex align-start justify-start max-width-container">
              <CommonDetailSubjectDirectoryNav :content-data="data[0]" />
            </div>
          </template>
          <template #results-heading>
            <div class="search-results-heading w-100 d-flex align-end justify-space-between ga-4">
              <h1 class="search-results-title">
                {{ metadata.title }}
              </h1>
              <div
                id="search-workspace-keyword"
                class="search-workspace-keyword d-none d-md-flex"
              />
            </div>
          </template>
          <search-list
            v-if="data && data.length > 0"
            :data-list="data"
            :is-initial-loading="isInitialDataLoading"
            :is-pagination-loading="isPaginationDataLoading"
            :is-all-data-loaded="isAllDataLoaded"
            :is-previous-loading="isPreviousLoading"
            :first-loaded-page-number="firstLoadedPageNumber"
            :is-profile-mode="route.query.type == 'teacher'"
            @load-next-page="loadNextPageData"
            @load-previous-page="loadPreviousPageData"
          />

          <div
            v-else
            class="search-empty-state w-100 d-flex flex-column align-center justify-center ga-4"
          >
            <span class="text-h4 font-weight-bold">Be the first to add content to this category.</span>
            <v-btn
              class="text-h5 font-weight-bold"
              width="250"
              color="academicGold"
              rounded="pill"
              flat
              variant="tonal"
              @click="createLinkAddConent()"
            >
              <v-icon color="brandNavy">
                md:add
              </v-icon>
              Publish
            </v-btn>
          </div>
        </CommonFilterList>
      </div>
    </v-row>
  </v-container>
</template>

<script setup>
import ServicesFilterContainer from '~/components/search/ServicesFilterContainer.vue'
import { useRoute } from 'vue-router'

definePageMeta({
  searchExperience: true,
})

const route = useRoute()
const router = useRouter()

const getEquivalentNewType = (type) => {
  switch (type) {
    case 'test':
      return 'paper'
    case 'learnfiles':
      return 'multimedia'
    case 'azmoon':
      return 'quizhub'
    case 'question':
      return 'forum'
    case 'dars':
      return 'tutorial'
    case 'paper':
      return 'paper'
    case 'study-materials':
      return 'study-materials'
    case 'multimedia':
      return 'multimedia'
    case 'quizhub':
      return 'quizhub'
    case 'forum':
      return 'forum'
    case 'tutorial':
      return 'tutorial'
    case 'teacher':
      return 'teacher'
    default:
      return 'paper'
  }
}
const getEquivalentOldType = (type) => {
  switch (type) {
    case 'paper':
      return 'test'
    case 'study-materials':
      return 'test'
    case 'multimedia':
      return 'learnfiles'
    case 'quizhub':
      return 'azmoon'
    case 'forum':
      return 'question'
    case 'tutorial':
      return 'dars'
    case 'test':
      return 'test'
    case 'learnfiles':
      return 'learnfiles'
    case 'azmoon':
      return 'azmoon'
    case 'question':
      return 'question'
    case 'dars':
      return 'dars'
    case 'teacher':
      return 'teacher'
    default:
      return 'test'
  }
}

const activeService = computed(() => getEquivalentNewType(route.query.type))

const buildSearchParams = (query, page, perpage) => {
  const frontendType = getEquivalentNewType(query.type)
  const params = {
    page,
    perpage,
    noTypesStats: 1,
    title: query.title,
    section: query.section,
    base: query.base,
    lesson: query.lesson,
    type: getEquivalentOldType(frontendType),
  }

  if (frontendType === 'paper') {
    params.is_paper = true
    params.test_type = query.test_type
    params.variant = query.variant
    params.edu_year = query.edu_year
    params.edu_month = query.edu_month
  }
  else if (frontendType === 'study-materials') {
    params.is_paper = false
    params.test_type = query.test_type
    params.topic = query.topic
  }
  else if (frontendType === 'quizhub') {
    params.exam_type = query.exam_type
    params.topic = query.topic
    params.edu_year = query.edu_year
    params.edu_month = query.edu_month
  }
  else if (frontendType === 'tutorial') {
    params.topic = query.topic
  }
  else if (frontendType === 'multimedia') {
    params.content_type = query.content_type
  }
  else {
    params.topic = query.topic
    params.test_type = query.test_type
    params.content_type = query.content_type
    params.edu_year = query.edu_year
    params.edu_month = query.edu_month
  }

  return params
}

const serviceOptions = [
  { title: 'Past Papers', id: 'paper', contentIcon: 'stat-icon icon-paper', color: 'rgb(var(--v-theme-brandNavy))' },
  { title: 'Study Materials', id: 'study-materials', icon: '/images/study-materials.svg', iconPadding: 3, color: 'rgb(var(--v-theme-brandNavy))' },
  { title: 'Exam Hub', id: 'quizhub', contentIcon: 'stat-icon icon-exam', color: 'rgb(var(--v-theme-brandNavy))' },
  { title: 'Tutorial', id: 'tutorial', contentIcon: 'stat-icon icon-tutorial', color: 'rgb(var(--v-theme-brandNavy))' },
]

const defaultService = serviceOptions[0]
const activeServiceColor = computed(() =>
  (serviceOptions.find(service => service.id === activeService.value) || defaultService).color,
)

const filters = useSearchFilters({
  activeService,
  defaultService,
  serviceOptions,
})

const scrollToPageTop = async () => {
  if (!import.meta.client) return

  await nextTick()
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })
  await new Promise(resolve => requestAnimationFrame(resolve))
}

const {
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
} = await useSearchResults({
  activeService,
  buildSearchParams,
  getEquivalentNewType,
  getEquivalentOldType,
  beforeReplaceResults: scrollToPageTop,
})

const { metadata, setAppliedFilterTitles } = useSearchMetadata({
  activeService,
  data,
  getEquivalentOldType,
})

const changeFilter = async (query, titles) => {
  if (titles !== undefined) {
    setAppliedFilterTitles(query, titles)
  }

  await reloadResultsForFilters(query)
}

const createLinkAddConent = () => {
  const auth = useAuth()
  const router = useRouter()
  if (!auth.isAuthenticated.value)

    router.push({ query: { auth_form: 'login' } })
  else {
    const type = getEquivalentOldType(route.query.type)
    let link = ''
    switch (type) {
      case 'test':
        link = '/user/paper/create'
        break
      case 'learnfiles':
        link = '/user/multimedia/create'
        break
      case 'azmoon':
        link = '/test-maker/create'
        break
      case 'question':
        link = '/user/question/create'
        break
      case 'dars':
        link = '/user/paper/create'
        break

      default:
        link = '/user/paper/create'
        break
    }
    navigateTo(link)
  }
}

onMounted(() => {
  const oldType = ['test', 'learnfiles', 'azmoon', 'question', 'dars']
  const normalizedType = getEquivalentNewType(route.query.type)
  if (!route.query.type || oldType.includes(route.query.type)) {
    router.replace({
      query: {
        ...route.query,
        type: normalizedType,
      },
    })
  }
})
</script>

<style scoped>
.subject-directory-container {
  padding-top: 16px;
}
.top-info-div {
  display: contents !important;
}
.margin-top-handle {
  min-height: 100vh;
  color: rgb(var(--v-theme-brandNavy));
  background: rgb(var(--v-theme-grey25));
}

.search-empty-state {
  min-height: 280px;
}

:deep(.inline-filter-group) {
  border: 1px solid rgb(var(--v-theme-borderSubtle));
  margin-top: 12px;
  padding: 12px 16px;
  max-width: 100%;
  flex-direction: row;
  align-items: stretch;
  gap: 24px;
  border-radius: 12px;
  background: rgb(var(--v-theme-grey25));
  box-shadow: 0 1px 2px rgba(var(--v-theme-brandNavy), 0.07);
}

:deep(.inline-filter-group > .inline-filter-grouped-row) {
  width: auto;
  min-width: 0;
  flex: 0 1 auto;
  padding: 0;
}

:deep(.inline-filter-group > .inline-filter-grouped-row + .inline-filter-grouped-row) {
  padding-left: 24px;
  border-left: 1px solid rgb(var(--v-theme-borderSubtle));
}

:deep(.inline-filter-grouped-row .inline-filter-row-content) {
  height: 100%;
  grid-template-columns: max-content minmax(0, 1fr);
  column-gap: 16px;
}

:deep(.inline-filter-group .inline-filter-divider) {
  display: none;
}

:deep(.inline-filter-group .inline-filter-option:not(.inline-filter-option-selected):not(:disabled):hover) {
  --v-hover-opacity: 0;
  border-color: rgb(var(--v-theme-brandNavy)) !important;
  background-color: rgb(var(--v-theme-surfaceSecondary)) !important;
}

@media (max-width: 959px) {
  :deep(.inline-filter-group) {
    flex-direction: column;
    gap: 16px;
  }

  :deep(.inline-filter-group > .inline-filter-grouped-row + .inline-filter-grouped-row) {
    padding-top: 16px;
    padding-left: 0;
    border-top: 1px solid rgb(var(--v-theme-borderSubtle));
    border-left: 0;
  }
}

:deep(.custom-search-text-field .v-field__outline__start) {
  border-radius: 24px 0 0 24px !important;
  flex: 0 0 30px !important;
}
:deep(.custom-search-text-field .v-field__outline__end) {
  border-radius: 0 4px 4px 0 !important;
}

:deep(.height-badge .v-badge__wrapper .v-badge__badge) {
  height: 20px !important;
}
.max-width-container {
  max-width: 1200px;
}
.search-results-heading {
  min-width: 0;
  padding: 12px 0 8px;
  margin: 0;
}
.search-workspace-keyword {
  width: 330px;
  min-width: 330px;
  align-self: stretch;
  align-items: center;
}
.search-workspace-keyword :deep(.v-field:not(.v-field--focused) .v-field__outline) {
  color: rgb(var(--v-theme-grey400));
}
.search-results-title {
  min-width: 0;
  padding-bottom: 6px;
  margin: 0;
  color: rgb(var(--v-theme-brandNavy));
  font-size: 22px;
  font-weight: 700;
  line-height: 30px;
  text-align: left;
}
@media (max-width: 959px) {
  .subject-directory-container {
    padding-top: 0;
  }

  .search-results-title {
    font-size: 16px;
  }
}
@media (min-width: 960px) {
  .margin-top-handle {
    width: 100%;
    max-width: none !important;
    height: auto;
    min-height: calc(100dvh - 64px);
    padding: 8px 24px;
    overflow: visible;
  }

  .margin-top-handle > .v-row {
    height: auto;
    margin: 0;
    align-content: flex-start;
  }

  .top-info-div {
    height: auto;
  }

  .search-results-heading {
    min-height: 64px;
    padding: 0 0 6px;
    align-items: flex-end !important;
  }
}

</style>

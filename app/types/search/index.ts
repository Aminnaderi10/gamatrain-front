import type { Ref } from 'vue'
import type { LocationQueryRaw } from 'vue-router'
import type { SearchParameters } from '@/composables/useApiService'
import type { ProfileListItemDTO } from '@/types/profile'

export interface SearchRequestOptions {
  public?: boolean
}

export interface SearchListDTO {
  num: number | string
  list: SearchResourceItem[]
}

export interface SearchTypesStatsDTO {
  papers?: number | string
  exams?: number | string
  azmoon?: number | string
  tutorials?: number | string
  dars?: number | string
}

export type SearchCountService = 'paper' | 'study-materials' | 'quizhub' | 'tutorial'

export type SearchServiceCounts = Partial<Record<SearchCountService, number>>

export interface SearchCardAnswerFields {
  is_paper?: boolean | null
  answer_type?: string | number | null
  answers_at_end_of_files?: boolean | null
  a_file?: boolean | null
  files?: {
    answer?: {
      exist?: boolean | null
    } | null
  } | null
}
export type SearchServiceId = 'paper' | 'study-materials' | 'quizhub' | 'tutorial' | 'teacher' | 'multimedia' | 'forum'
export type LegacySearchType = 'test' | 'azmoon' | 'dars' | 'teacher' | 'learnfiles' | 'question'
export type SearchTypeAlias = SearchServiceId | LegacySearchType
export type SearchQuery = LocationQueryRaw
export type SearchQueryValue = SearchQuery[string]

export interface SearchRequestParams extends SearchParameters {
  page: number
  perpage: number
  noTypesStats: number
  type: LegacySearchType
  is_paper?: boolean
  title?: SearchQueryValue
  section?: SearchQueryValue
  base?: SearchQueryValue
  lesson?: SearchQueryValue
  test_type?: SearchQueryValue
  variant?: SearchQueryValue
  edu_year?: SearchQueryValue
  edu_month?: SearchQueryValue
  topic?: SearchQueryValue
  exam_type?: SearchQueryValue
  content_type?: SearchQueryValue
}

export interface SearchServiceOption {
  id: SearchServiceId
  legacyApiType: LegacySearchType
  title: string
  shortTitle: string
  icon: string
  isPaper: boolean | null
}

interface GeneralSearchCategoryBase {
  title: string
  value: string
  api: string
  apiParams?: SearchParameters
  keywordSearch: string
  iconName: string
  colorClass: string
  activeColorClass: string
}

// Detail routes and search service IDs have different names for exams.
export type GeneralSearchCategory = GeneralSearchCategoryBase & (
  | { type: 'paper', isOldApi: true, typePaper: 'paper', searchType?: 'paper' | 'study-materials' }
  | { type: 'paper', isOldApi: true, typePaper: 'exam', searchType: 'quizhub' }
  | { type: 'paper', isOldApi: true, typePaper: 'tutorial', searchType?: 'tutorial' }
  | { type: 'school' | 'blog', isOldApi: false }
)

export interface SearchMetadataFields {
  section_title?: string | null
  base_title?: string | null
  lesson_title?: string | null
  test_type_title?: string | null
  azmoon_type_title?: string | null
  is_paper?: boolean | null
}

export interface SearchResourceItem extends SearchMetadataFields {
  [key: string]: unknown
}

export type SearchResultItem = SearchResourceItem | (ProfileListItemDTO & SearchMetadataFields)

export interface SearchServiceOptions {
  activeService: Readonly<Ref<SearchServiceId>>
}

export interface SearchResultsOptions extends SearchServiceOptions {
  beforeReplaceResults?: () => void | Promise<void>
}

export interface SearchMetadataOptions extends SearchServiceOptions {
  data: Readonly<Ref<SearchResultItem[]>>
}

export type FilterId = string | number
export type FilterTitles = Record<string, string>

export interface FilterItem {
  id: FilterId
  title: string
  code?: FilterId | null
  idClassification?: FilterId | null
  icon?: string | null
  apiIcon?: string | null
  is_paper?: boolean
  list_order?: string | number
}

export interface FilterControlHandle {
  getItems: (parentId?: FilterId) => Promise<void>
  getItemById: (id: SearchQueryValue, key: 'id' | 'code') => FilterItem | null
  setStaticItem: (items: FilterItem[]) => void
  getCurrentItems: () => FilterItem[]
  openSelectModal: () => void
  openInlineOptionsModal: () => void
}

export interface FilterDependency {
  parent: number
  targetKey: string
  sourceKey: 'id' | 'code' | 'idClassification'
  disableIds?: FilterId[]
}

export interface FilterConfiguration {
  title: string
  queryKey: string
  selectedItem: FilterItem | null
  disabled: boolean
  hasSearch: boolean
  refElement: FilterControlHandle | null
  api: string | null
  idInParams: boolean
  extraApiParams?: SearchParameters
  dependencies?: FilterDependency[]
  children?: number[]
  childrenForGetStaticData?: number[]
  dependenciesForGetStaticData?: number[]
  disableOtherFiltersOnSelectedIds?: FilterId[]
  parentIndexChangeQueryKey?: number
  queryMap?: Record<string, string>
  staticList?: FilterItem[]
  getStaticList?: (id?: SearchQueryValue) => FilterItem[]
  defaultValue?: FilterItem
  closable: boolean
  boxed?: boolean
  showItemIcon?: boolean
  iconSrc?: (item: FilterItem) => string | null | undefined
  fallbackIcon?: string
  fallbackIconPadding?: number
  controlIcon?: string
  controlIconPadded?: boolean
  inlineOptions?: boolean
  inlineAllowClear?: boolean
  inlineItemsPerRow?: number | ((filters: FilterConfiguration[]) => number)
  itemTitle?: (item: FilterItem) => string
  itemTransform?: (item: FilterItem) => FilterItem
  listTransform?: (items: FilterItem[]) => Promise<FilterItem[]>
  itemSort?: (a: FilterItem, b: FilterItem) => number
  itemFilter?: (item: FilterItem) => boolean
}

export interface FilterState extends FilterConfiguration {
  initialDisabled: boolean
  dependencies: FilterDependency[]
  extraApiParams: SearchParameters
}

export interface FilterControllerOptions {
  filterList: Readonly<Ref<FilterConfiguration[]>>
  hasKeywordSearch: Readonly<Ref<boolean>>
  hasServicesNavigation: Readonly<Ref<boolean>>
  onChangeFilter: (query: SearchQuery, titles?: FilterTitles, context?: { serviceChange: boolean }) => void | Promise<void>
}

export type SearchConditionalFilter = 'year' | 'session' | 'paper' | 'variant' | 'material' | 'topic' | 'exam-type'

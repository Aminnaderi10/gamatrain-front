import {
  ALL_SEARCH_MONTHS,
  EDEXCEL_BOARD_CODE,
  SEARCH_BOARD_ICON_BY_TITLE,
  SEARCH_MONTHS_BY_LEVEL,
} from '@/constants'

export const useSearchFilters = ({
  activeService,
  defaultService,
  serviceOptions,
}) => {
  const route = useRoute()

  const makeFilter = overrides => ({
    selectedItem: null,
    disabled: false,
    hasSearch: true,
    refElement: null,
    api: null,
    idInParams: false,
    extraApiParams: {},
    dependencies: [],
    children: [],
    closable: true,
    boxed: true,
    ...overrides,
  })

  const enrichBoardsWithIcons = async (boards) => {
    try {
      const response = await useApiService.get('/api/v2/boards', undefined, { public: true })
      const boardByCode = new Map(
        (response.data || []).map(board => [String(board.code), board]),
      )

      return boards.map((board) => {
        const v2Board = boardByCode.get(String(board.code))
        return {
          ...board,
          apiIcon: v2Board?.icon || null,
          icon: SEARCH_BOARD_ICON_BY_TITLE[v2Board?.title || board.title] || null,
        }
      })
    }
    catch {
      return boards.map(board => ({
        ...board,
        icon: SEARCH_BOARD_ICON_BY_TITLE[board.title] || null,
      }))
    }
  }

  return computed(() => {
    const service = activeService.value
    const conditionalFilters = {
      paper: ['year', 'session', 'paper', 'variant'],
      'study-materials': ['material', 'topic'],
      quizhub: ['topic', 'year', 'session', 'exam-type'],
      tutorial: ['topic'],
    }[service] || []

    const index = {
      board: 0,
      level: 1,
      subject: 2,
      service: 3,
    }
    conditionalFilters.forEach((name, offset) => {
      index[name] = offset + 4
    })

    const boardChildren = [index.level]
    if (index.paper !== undefined) boardChildren.push(index.paper)
    if (index.material !== undefined) boardChildren.push(index.material)
    const subjectChildren = index.topic === undefined ? [] : [index.topic]
    const serviceChildren = conditionalFilters.map(name => index[name])

    const result = [
      makeFilter({
        title: 'Board',
        api: '/api/v1/types/list',
        extraApiParams: { type: 'section' },
        itemTransform: item => ({ ...item, code: item.id }),
        listTransform: enrichBoardsWithIcons,
        itemSort: (a, b) => Number(a.list_order) - Number(b.list_order),
        showItemIcon: true,
        iconSrc: item => `/images/boards/${item.icon}.svg`,
        fallbackIcon: 'md:school_outlined',
        fallbackIconPadding: 4,
        unselectedIconColor: 'rgb(var(--v-theme-brandNavy))',
        queryKey: 'section',
        children: boardChildren,
      }),
      makeFilter({
        title: 'Level',
        disabled: true,
        api: '/api/v1/types/list',
        extraApiParams: { type: 'base' },
        dependencies: [{ parent: index.board, targetKey: 'section_id', sourceKey: 'code' }],
        queryKey: 'base',
        children: [index.subject],
        childrenForGetStaticData: index.session === undefined ? [] : [index.session],
      }),
      makeFilter({
        title: 'Subject',
        disabled: true,
        api: '/api/v1/types/list',
        extraApiParams: { type: 'lesson' },
        dependencies: [{ parent: index.level, targetKey: 'base_id', sourceKey: 'id' }],
        queryKey: 'lesson',
        children: subjectChildren,
      }),
      makeFilter({
        title: 'Services',
        hasSearch: false,
        staticList: serviceOptions,
        queryKey: 'type',
        children: serviceChildren,
        closable: false,
        defaultValue: defaultService,
        showItemIcon: true,
        iconSrc: item => item.icon,
        fallbackIcon: 'md:category',
      }),
    ]

    const factories = {
      topic: () => makeFilter({
        title: 'Topic',
        disabled: true,
        api: '/api/v1/types/list',
        extraApiParams: { type: 'topic' },
        dependencies: [{ parent: index.subject, targetKey: 'lesson_id', sourceKey: 'id' }],
        queryKey: 'topic',
        selectedVariant: 'dependent-green',
        controlIcon: 'md:sell_outlined',
        unselectedIconColor: 'rgb(var(--v-theme-brandNavy))',
        controlIconPadding: 4,
      }),
      year: () => makeFilter({
        title: 'Year',
        dependencies: [{ parent: index.service, targetKey: 'type', sourceKey: 'id' }],
        staticList: Array.from({ length: 14 }, (_, index) => 2013 + index)
          .reverse()
          .map(year => ({ title: `${year}`, id: year })),
        queryKey: 'edu_year',
        selectedVariant: 'dependent-green',
        controlIcon: 'md:calendar_today_outlined',
        unselectedIconColor: 'rgb(var(--v-theme-brandNavy))',
        controlIconPadding: 4,
      }),
      session: () => makeFilter({
        title: 'Session',
        dependencies: [{ parent: index.service, targetKey: 'type', sourceKey: 'id' }],
        staticList: [],
        dependenciesForGetStaticData: [index.level],
        getStaticList: (id = route.query.base) => {
          const levelId = id === 'reset' ? route.query.base : (id || route.query.base)
          return levelId && SEARCH_MONTHS_BY_LEVEL[levelId]
            ? SEARCH_MONTHS_BY_LEVEL[levelId]
            : ALL_SEARCH_MONTHS
        },
        queryKey: 'edu_month',
        selectedVariant: 'dependent-green',
      }),
      paper: () => makeFilter({
        title: 'Paper',
        disabled: true,
        api: '/api/v1/types/list',
        extraApiParams: { type: 'test_type' },
        dependencies: [{ parent: index.board, targetKey: 'section_id', sourceKey: 'code' }],
        itemFilter: item => item.is_paper === true,
        queryKey: 'test_type',
        inlineOptions: true,
        inlineAllowClear: true,
        inlineItemsPerRow: filterState =>
          Number(filterState[index.board]?.selectedItem?.code) === EDEXCEL_BOARD_CODE
            ? 2
            : 4,
        itemTitle: (item) => {
          const match = item.title?.match(/^\s*paper\s+(\d+)\s*$/i)
          return match ? match[1] : item.title
        },
      }),
      variant: () => makeFilter({
        title: 'Variant',
        staticList: [
          { id: '7814', title: '1' },
          { id: '7815', title: '2' },
          { id: '7816', title: '3' },
        ],
        queryKey: 'variant',
        inlineOptions: true,
        inlineAllowClear: true,
      }),
      material: () => makeFilter({
        title: 'Material Type',
        disabled: true,
        api: '/api/v1/types/list',
        extraApiParams: { type: 'test_type' },
        dependencies: [{ parent: index.board, targetKey: 'section_id', sourceKey: 'code' }],
        itemFilter: item => item.is_paper === false,
        queryKey: 'test_type',
        selectedVariant: 'dependent-green',
      }),
      'exam-type': () => makeFilter({
        title: 'Exam Type',
        api: '/api/v1/types/list',
        extraApiParams: { type: 'exam_type' },
        queryKey: 'exam_type',
        selectedVariant: 'dependent-green',
      }),
    }

    conditionalFilters.forEach(name => result.push(factories[name]()))
    return result
  })
}

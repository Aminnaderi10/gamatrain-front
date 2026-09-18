const SEARCH_SERVICE_BY_TYPE = {
  test: 'paper',
  learnfiles: 'multimedia',
  azmoon: 'quizhub',
  question: 'forum',
  dars: 'tutorial',
  paper: 'paper',
  'study-materials': 'study-materials',
  multimedia: 'multimedia',
  quizhub: 'quizhub',
  forum: 'forum',
  tutorial: 'tutorial',
  teacher: 'teacher',
}

const LEGACY_TYPE_BY_SEARCH_SERVICE = {
  paper: 'test',
  'study-materials': 'test',
  multimedia: 'learnfiles',
  quizhub: 'azmoon',
  forum: 'question',
  tutorial: 'dars',
  test: 'test',
  learnfiles: 'learnfiles',
  azmoon: 'azmoon',
  question: 'question',
  dars: 'dars',
  teacher: 'teacher',
}

export const normalizeSearchService = type => SEARCH_SERVICE_BY_TYPE[type] || 'paper'

export const getLegacySearchType = type => LEGACY_TYPE_BY_SEARCH_SERVICE[type] || 'test'

export const buildSearchParams = (query, page, perpage) => {
  const frontendType = normalizeSearchService(query.type)
  const params = {
    page,
    perpage,
    noTypesStats: 1,
    title: query.title,
    section: query.section,
    base: query.base,
    lesson: query.lesson,
    type: getLegacySearchType(frontendType),
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

import { contentPath } from './contentPath'
import type { DirectoryPaper } from '../types/subject-directory/paperFiles'
import type {
  DirectoryFilterOption,
  DirectoryPaperList,
  DirectoryPaperResponse,
  DirectoryYearGroup,
} from '../types/subject-directory/papers'

// Keep the classification/variant rule used by the original directory table.
export const getDirectoryPaperTitle = (paper: DirectoryPaper): string =>
  paper.variant && String(paper.variant) !== '0'
    ? `${paper.test_type_title || ''}${paper.variant_title === 'nv' ? '' : paper.variant_title || ''}`
    : paper.test_type_title || paper.title || 'Past paper'

export const getDirectoryPaperCode = (paper: DirectoryPaper, subjectTitle = ''): string => {
  // The same syllabus-code convention used by useCambridgeSeo. Do not invent a
  // code for boards whose payload/title does not provide one.
  const code = (paper.lesson_title || subjectTitle).match(/\((\d{4})\)\s*$/)?.[1]
  const number = getDirectoryPaperTitle(paper).match(/^Paper\s+(\w+)$/)?.[1]
  const paperCode = code && number ? `${code}/${number}` : paper.title?.match(/\b\d{4}\/\w+\b/)?.[0] || ''
  const variantTitle = String(paper.variant_title || '').trim().toLowerCase()
  const hasVariant = paper.variant && String(paper.variant) !== '0' && variantTitle && variantTitle !== 'nv'
  return hasVariant ? paperCode : paperCode.replace(/\/(\d)$/, '/0$1')
}

export const getDirectoryPaperLink = (paper: DirectoryPaper): string => contentPath('paper', paper.id, paper.title_url)

// The API returns no exam slug, so the link is the id path; contentPath adds the
// slug once the API provides one.
export const getDirectoryExamLink = (examId: string): string => contentPath('exam', examId)

export const getDirectoryExamIds = (value: DirectoryPaper['exam_id']): string[] => {
  try {
    const ids: unknown = Array.isArray(value) ? value : JSON.parse(value || '[]')
    return Array.isArray(ids)
      ? [...new Set(ids.map(String).filter(id => /^[1-9]\d*$/.test(id)))]
      : []
  }
  catch {
    return []
  }
}

const DIRECTORY_VARIANTS = new Set(['1', '2', '3'])

export const getDirectoryVariantOptions = (items: DirectoryFilterOption[]): DirectoryFilterOption[] => items
  .filter(item => DIRECTORY_VARIANTS.has(String(item.title).trim()))
  .map(item => ({ ...item, title: String(item.title).trim() }))
  .sort((first, second) => Number(first.title) - Number(second.title))

export const createDirectoryPaperList = (): DirectoryPaperList => ({
  items: [], page: 0, total: null, hasMore: true, loaded: false, loading: false, error: false,
})

// Add one API page to the list, skipping papers already shown and stopping at the total.
export const appendDirectoryPapers = (list: DirectoryPaperList, response: DirectoryPaperResponse, pageSize: number) => {
  if (Number(response?.status) !== 1 || !Array.isArray(response?.data?.list)) {
    throw new Error('Invalid directory response')
  }
  const page = response.data.list
  const known = new Set(list.items.map(item => String(item.id)))
  list.items.push(...page.filter(item => !known.has(String(item.id))))
  list.page++
  const total = Number(response.data.num)
  list.total = response.data.num != null && Number.isFinite(total) ? total : null
  list.loaded = true
  list.hasMore = page.length > 0 && (list.total === null ? page.length === pageSize : list.items.length < list.total)
}

const monthName = (month: number) => new Date(2000, month - 1, 1).toLocaleString('en', { month: 'long' })

// Group papers (already newest first from the API) into years and sessions.
// Session titles come from the grade's session list, e.g. Cambridge's February/March.
export const groupDirectoryPapers = (
  papers: DirectoryPaper[],
  sessions: readonly { id: number, title: string }[],
): DirectoryYearGroup[] => {
  const sessionTitles = new Map(sessions.map(session => [session.id, session.title]))
  const years = new Map<number, Map<number, DirectoryPaper[]>>()
  for (const paper of papers) {
    const year = Number(paper.edu_year)
    const month = Number(paper.edu_month)
    if (!year || !month) continue
    const months = years.get(year) ?? years.set(year, new Map()).get(year)!
    const group = months.get(month) ?? months.set(month, []).get(month)!
    group.push(paper)
  }
  return [...years.entries()]
    .sort(([first], [second]) => second - first)
    .map(([year, months]) => ({
      id: year,
      title: String(year),
      sessions: [...months.entries()]
        .sort(([first], [second]) => second - first)
        .map(([month, group]) => ({ id: month, title: sessionTitles.get(month) || monthName(month), papers: group })),
    }))
}

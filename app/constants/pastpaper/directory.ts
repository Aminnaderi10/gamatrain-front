import { ALL_SEARCH_MONTHS, SEARCH_MONTHS_BY_LEVEL } from '../search'
import { YEAR_LIST } from './index'

export const DIRECTORY_DEFAULT_BOARD_CODE = 6659

export const DIRECTORY_YEAR_OPTIONS = YEAR_LIST.map(id => ({ id, title: String(id) }))

// The grade's exam sessions, as on Search, newest first.
export const getDirectorySessions = (gradeId: string | number) =>
  [...(SEARCH_MONTHS_BY_LEVEL[Number(gradeId)] ?? ALL_SEARCH_MONTHS)].sort((first, second) => second.id - first.id)

// Papers per request; the API caps a page at 50.
export const DIRECTORY_PAGE_SIZE = 50

export const DIRECTORY_FILTERS = [
  { key: 'year', title: 'Year', icon: 'md:calendar_today_outlined' },
  { key: 'series', title: 'Session' },
  { key: 'paper', title: 'Paper', inline: true },
  { key: 'variant', title: 'Variant', inline: true },
]

export const getDirectoryFilterOptionTitle = (key: string, item: { title: string }) => key === 'paper'
  ? String(item.title).replace(/^\s*paper\s+(\d+)\s*$/i, '$1')
  : item.title

export const getDirectoryFilterColumns = (key: string, boardId: string | number) => key === 'paper'
  ? Number(boardId) === 6657 ? 2 : 4
  : 3

export const DIRECTORY_BOARD_ORDER = [
  'Cambridge',
  'Edexcel',
  'AQA',
  'OCR',
  'GAMA',
  'CXC',
  'Nigerian',
  'Olympiad',
]

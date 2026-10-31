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

// Design labels and icons for the Resources sidebar, by collection title.
export const DIRECTORY_RESOURCE_PRESENTATION: Record<string, { label: string, title?: string, icon: string }> = {
  'predicted papers': { label: 'Predicted Papers', icon: 'md:auto_awesome_outlined' },
  'workbooks': { label: 'Workbooks', icon: 'md:edit_note_outlined' },
  'study and revision guides': { label: 'Study & Revision', title: 'Study & Revision Guides', icon: 'md:menu_book_outlined' },
  'coursebooks': { label: 'Coursebooks', icon: 'md:import_contacts_outlined' },
  'topical questions': { label: 'Topical Questions', icon: 'md:checklist_outlined' },
  'topical': { label: 'Topical Questions', icon: 'md:checklist_outlined' },
  'solution manuals': { label: 'Solution Manuals', icon: 'md:verified_outlined' },
}

import type { DirectoryPaper } from './paperFiles'

// Filters for the directory's paper search. Year and Session are sent as
// edu_year/edu_month; Paper and Variant as test_type/variant.
export interface DirectoryPaperQuery {
  lesson: string | number
  edu_year?: string
  edu_month?: string
  test_type?: string
  variant?: string
}

export interface DirectoryPaperResponse {
  status: number | string
  data: { list: DirectoryPaper[], num?: number | string | null }
}

export type DirectoryFetchPapers = (params: DirectoryPaperQuery & {
  is_paper: boolean
  directory: boolean
  page: number
  perpage: number
}, signal?: AbortSignal) => Promise<DirectoryPaperResponse>

// The papers loaded so far for the current subject and filters, newest first.
export interface DirectoryPaperList {
  items: DirectoryPaper[]
  page: number
  total: number | null
  hasMore: boolean
  loaded: boolean
  loading: boolean
  error: boolean
}

export interface DirectorySessionGroup {
  id: number
  title: string
  papers: DirectoryPaper[]
}

export interface DirectoryYearGroup {
  id: number
  title: string
  sessions: DirectorySessionGroup[]
}

export interface DirectoryFilterOption {
  id: string | number
  title: string
  is_paper?: boolean | number | string
}

export type DirectoryFilterKey = 'year' | 'series' | 'paper' | 'variant'

// The subject the paper table shows; component props satisfy it directly.
export interface DirectoryPaperContext {
  subjectId: string | number
  gradeId: string | number
  boardId: string | number
}

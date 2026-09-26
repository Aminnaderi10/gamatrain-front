export interface SearchRequestOptions {
  public?: boolean
}

export interface SearchListDTO {
  num: number | string
  // Search returns different card fields for each service.
  list: Record<string, unknown>[]
}

export interface SearchTypesStatsDTO {
  papers?: number | string
  exams?: number | string
  azmoon?: number | string
  tutorials?: number | string
  dars?: number | string
}

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

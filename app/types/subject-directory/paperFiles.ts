export interface DirectoryFileInfo {
  exist?: boolean
  price?: number | string | null
}

export interface DirectoryExtraFile extends DirectoryFileInfo {
  id: string | number
  type?: string | number | null
  type_title?: string | null
}

export interface DirectoryPaperFileSource {
  files?: {
    pdf?: DirectoryFileInfo
    answer?: DirectoryFileInfo
    extra?: DirectoryExtraFile[] | null
  } | null
}

export interface DirectoryPaper extends DirectoryPaperFileSource {
  id: string | number
  title?: string
  title_url?: string
  test_type_title?: string
  lesson_title?: string
  variant?: string | number | null
  variant_title?: string | null
  exam_id?: string | (string | number)[] | null
  edu_year?: string | number
  edu_month?: string | number
}

export interface DirectoryPaperDownload {
  type: string
  title: string
  shortTitle: string
  icon: string
  style: 'question' | 'answer' | 'extra'
  price: number | null
  extraId?: string
}

export interface DirectoryDownloadParams {
  type: 'pdf' | 'answer' | 'extra'
  extraId?: string
}

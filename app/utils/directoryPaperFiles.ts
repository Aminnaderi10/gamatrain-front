import type {
  DirectoryDownloadParams,
  DirectoryPaperDownload,
  DirectoryPaperFileSource,
} from '../types/subject-directory/paperFiles'

// Design labels and icons for the extra file types, by API type id.
const extraFileIcons: Record<string, string> = {
  6351: 'md:attach_file',
  6705: 'md:volume_up_outlined',
  8043: 'md:import_contacts_outlined',
}

const extraFileShortTitles: Record<string, string> = {
  6351: 'IN',
  6705: 'SF',
  8043: 'Solved',
  10517: 'CI',
  10519: 'QR',
  10520: 'TN',
  10560: 'I2',
  10561: 'PM',
}

// Design order after Question Paper and Mark Scheme.
const extraFileOrder: Record<string, number> = {
  6351: 0, // Insert
  10517: 1, // Confidential Instructions
  6705: 2, // Audio File
  10519: 3, // Transcript
  8043: 4, // Solved Paper
  10518: 5, // Supporting File
  10520: 6, // Teacher Notes
  10560: 7, // Map File
  10561: 8, // Pre Released Material
}

const toPrice = (value: number | string | null | undefined): number | null =>
  value == null || value === '' ? null : Number(value)

export const getDirectoryPaperDownloads = (paper: DirectoryPaperFileSource): DirectoryPaperDownload[] => {
  const { pdf, answer, extra } = paper.files ?? {}
  const downloads: DirectoryPaperDownload[] = []
  if (pdf?.exist) {
    downloads.push({ type: 'pdf', title: 'Question Paper', shortTitle: 'Paper', icon: 'md:download', style: 'question', price: toPrice(pdf.price) })
  }
  if (answer?.exist) {
    downloads.push({ type: 'answer', title: 'Mark Scheme', shortTitle: 'MS', icon: 'md:check_box_outlined', style: 'answer', price: toPrice(answer.price) })
  }
  const extras = [...(extra ?? [])].sort((first, second) =>
    (extraFileOrder[String(first.type)] ?? Number.MAX_SAFE_INTEGER) - (extraFileOrder[String(second.type)] ?? Number.MAX_SAFE_INTEGER))
  for (const file of extras) {
    const title = file.type_title || 'Extra File'
    downloads.push({
      type: `extra:${file.id}`,
      extraId: String(file.id),
      title,
      shortTitle: extraFileShortTitles[String(file.type)] || title,
      icon: extraFileIcons[String(file.type)] || 'md:draft_outlined',
      style: 'extra',
      price: toPrice(file.price),
    })
  }
  return downloads
}

export const getDirectoryFileDownloadParams = (file: DirectoryPaperDownload | undefined): DirectoryDownloadParams | undefined => {
  if (!file) return undefined
  if (file.extraId) return { type: 'extra', extraId: file.extraId }
  if (file.type === 'pdf' || file.type === 'answer') return { type: file.type }
}

export const getDirectoryDownloadParams = (type: string, paper: DirectoryPaperFileSource): DirectoryDownloadParams | undefined =>
  getDirectoryFileDownloadParams(getDirectoryPaperDownloads(paper).find(file => file.type === type))

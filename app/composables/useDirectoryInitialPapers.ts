import { useAsyncData } from '#app'
import { useDirectoryPapersApi } from '~/composables/api/subject-directory/useDirectoryPapers.api'
import { DIRECTORY_PAGE_SIZE } from '~/constants/pastpaper/directory'

export const getDirectoryInitialPapersKey = (subjectId: string | number) => `directory-papers:${subjectId}`

// The subject's newest page of papers, rendered on the server. The page starts it
// alongside Resources; useDirectoryPapers reads the same payload.
export const useDirectoryInitialPapers = ({ subjectId }: { subjectId: string | number }) => {
  const { fetchPapers } = useDirectoryPapersApi()
  return useAsyncData(getDirectoryInitialPapersKey(subjectId), () => subjectId
    ? fetchPapers({ lesson: subjectId, is_paper: true, directory: true, page: 1, perpage: DIRECTORY_PAGE_SIZE })
    : Promise.resolve(null))
}

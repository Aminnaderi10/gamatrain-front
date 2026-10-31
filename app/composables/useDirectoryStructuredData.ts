import { computed } from 'vue'
import type { Ref } from 'vue'
import type { DirectorySelection } from '~/types/subject-directory/cascader'
import type { DirectoryStructuredDataPaper } from '~/types/subject-directory/structuredData'
import { getDirectoryStructuredData, serializeDirectoryStructuredData } from '~/utils/directoryStructuredData'

// CollectionPage + breadcrumb JSON-LD, listing the papers in open sessions.
export const useDirectoryStructuredData = (
  selection: () => DirectorySelection | null,
  papers: Ref<DirectoryStructuredDataPaper[]>,
) => {
  const siteConfig = useSiteConfig()
  const schema = computed(() => getDirectoryStructuredData(selection(), papers.value, siteConfig.url))

  useHead(() => ({
    script: schema.value
      ? [{
          key: 'directory-structured-data',
          type: 'application/ld+json',
          innerHTML: serializeDirectoryStructuredData(schema.value),
        }]
      : [],
  }))
}

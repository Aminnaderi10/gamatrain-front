import { createDirectoryPaperLoader } from './directoryPaperLoader'
import { createDirectorySessionAvailability } from './directorySessionAvailability'
import { createDirectoryLatestSessionExpansion } from './directoryPaperExpansion'
import type { DirectoryInitialPapers, DirectoryInitialPapersOptions, DirectoryPaperQuery } from '~/types/subject-directory/initialPapers'

// Resolve the initial open session before rendering, then serialize both caches
// so hydration can restore the same rows and accordion state without refetching.
export const loadDirectoryInitialPapers = async (options: DirectoryInitialPapersOptions): Promise<DirectoryInitialPapers> => {
  const result: DirectoryInitialPapers = { selected: null, sessions: [] }
  const firstYear = options.years[0]
  const firstSession = options.sessions[0]
  if (!options.subjectId || !firstYear || !firstSession) return result

  const loader = createDirectoryPaperLoader(options.fetchPapers)
  const availability = createDirectorySessionAvailability(options.fetchPapers)
  const queries: DirectoryPaperQuery[] = []
  const queryFor = (year: number, month: number): DirectoryPaperQuery => ({
    lesson: options.subjectId, edu_year: year, edu_month: month,
  })
  const expansion = createDirectoryLatestSessionExpansion({
    years: () => options.years,
    sessions: () => options.sessions,
    checkYear: async (year) => {
      await Promise.all(options.sessions.map(async (session) => {
        const query = queryFor(year, session.id)
        queries.push(query)
        const state = loader.getState(query)
        if (state.loaded) availability.seed(query, state.total > 0 || state.items.length > 0)
        else await availability.check(query)
      }))
    },
    status: (year, month) => availability.getState(queryFor(year, month)).status,
    open: (year, month) => { result.selected = { year, month } },
  })

  try {
    // Fetch the most likely first page directly, avoiding a separate count
    // request for it. Empty newer sessions still lead to the latest real papers.
    await loader.load(queryFor(firstYear.id, firstSession.id))
    await expansion.openLatest()
    if (result.selected) {
      const query = queryFor(result.selected.year, result.selected.month)
      if (!loader.getState(query).loaded) await loader.load(query)
    }
    result.sessions = queries.map(query => ({
      query,
      availability: availability.getState(query).status,
      papers: { ...loader.getState(query) },
    }))
    return result
  }
  finally {
    loader.clear()
    availability.clear()
  }
}

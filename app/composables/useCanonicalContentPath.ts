import type { SlugContentType } from '@/utils/contentPath'

// Canonical path and absolute URL of a detail page, plus a 301 to it when the page was reached by any other
// path: a missing or renamed slug, a trailing slash, or a zero-padded id. Every such variant otherwise answers
// 200 and shows up in Search Console as an "Alternate page with proper canonical tag"; a permanent redirect
// folds it, and its link signals, into the one URL instead.
// Call it after the page's data is awaited and the not-found case has been thrown, with the API's own slug.
export const useCanonicalContentPath = async (type: SlugContentType, id: string | number, slug?: string | null) => {
  const route = useRoute()
  const path = contentPath(type, id, slug)
  const url = `https://${useRequestURL().host}${path}`

  // Compared on the decoded route params rather than route.path, so a slug with characters the router
  // percent-encodes (`|`, `(`, non-Latin letters) can't make the comparison fail and loop the redirect.
  const routeSlug = typeof route.params.slug === 'string' ? route.params.slug : ''
  const isCanonical = String(route.params.id) === String(id)
    && routeSlug === (slug ?? '')
    && !route.path.endsWith('/')
  // A slug holding a URL delimiter can't survive the round trip as one path segment (`?` would start a query,
  // `/` another segment), so it would never compare equal and would redirect forever. Serve those as they are.
  const isRedirectable = !slug || !/[/?#%]/.test(slug)

  if (!isCanonical && isRedirectable) {
    await navigateTo({ path, query: route.query, hash: route.hash }, { redirectCode: 301, replace: true })
  }

  return { path, url }
}

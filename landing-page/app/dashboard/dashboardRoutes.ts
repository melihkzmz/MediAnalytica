import { isSection, Section } from './sections'

/** URL path for a dashboard section (home = `/dashboard`). */
export function sectionToPath(section: Section): string {
  if (section === 'dashboard') return '/dashboard'
  return `/dashboard/${section}`
}

/** Resolves `[...segment]` from the optional catch-all route. */
export function pathSegmentsToSection(segment: string[] | undefined): Section {
  if (!segment?.length) return 'dashboard'
  const first = segment[0]
  if (first && isSection(first)) return first
  return 'dashboard'
}

/** Derives active section from `usePathname()` (no hash). */
export function pathnameToSection(pathname: string): Section {
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'dashboard'
  const m = /^\/dashboard\/([^/?#]+)/.exec(pathname)
  if (m?.[1] && isSection(m[1])) return m[1]
  return 'dashboard'
}

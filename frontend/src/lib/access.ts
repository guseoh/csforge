/** Only canonical reading routes are available without the owner's session. */
export function isPublicPage(path: string) {
  return path === '/' || path === '/login' || path === '/learning' || path === '/compare' || path === '/search'
    || /^\/learning\/[^/]+\/?$/.test(path) || /^\/concepts\/\d+\/?$/.test(path)
}

import { routes, type VercelConfig } from '@vercel/config/v1'

const backendOrigin =
  process.env.CSFORGE_BACKEND_ORIGIN ?? 'http://localhost:8080'

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite('/api/:path*', `${backendOrigin}/api/:path*`),
    routes.rewrite('/oauth2/:path*', `${backendOrigin}/oauth2/:path*`),
    routes.rewrite(
      '/login/oauth2/:path*',
      `${backendOrigin}/login/oauth2/:path*`,
    ),
    routes.rewrite('/(.*)', '/index.html'),
  ],
}

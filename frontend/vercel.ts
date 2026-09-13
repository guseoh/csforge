const backendOrigin = process.env.CSFORGE_BACKEND_ORIGIN ?? 'http://localhost:8080'

export default {
  rewrites: [
    { source: '/api/:path*', destination: `${backendOrigin}/api/:path*` },
    { source: '/oauth2/:path*', destination: `${backendOrigin}/oauth2/:path*` },
    { source: '/login/oauth2/:path*', destination: `${backendOrigin}/login/oauth2/:path*` },
    { source: '/(.*)', destination: '/index.html' },
  ],
}

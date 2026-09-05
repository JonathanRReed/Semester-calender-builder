/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  reactStrictMode: true,

  // React Compiler: automatic memoization, no manual useMemo/useCallback needed.
  reactCompiler: true,

  // Strip console.log from production bundles, keep error/warn.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  productionBrowserSourceMaps: false,

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs'],
  },
}

export default nextConfig

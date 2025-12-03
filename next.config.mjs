/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  
  // Production optimizations
  reactStrictMode: true,
  
  // Optimize production bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  
  // Optimize fonts and external resources
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', 'date-fns'],
  },
  
  // Compress output
  compress: true,
  
  // Modern JavaScript output (reduce polyfills)
  transpilePackages: [],
}

export default nextConfig
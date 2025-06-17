/** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'export',
// }
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

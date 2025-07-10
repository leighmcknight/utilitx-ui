/** @type {import('next').NextConfig} */
// const nextConfig = {
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
	output: "export",
};

export default nextConfig;

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	experimental: {
		appDir: true,
	},
	images: {
		domains: ['localhost', 'your-domain.com'],
		formats: ['image/webp', 'image/avif'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
	},
	// Enable compression
	compress: true,
	// Enable SWC minify
	swcMinify: true,
	// Output standalone for Docker
	output: 'standalone',
	// Optimize bundles
	experimental: {
		optimizePackageImports: [
			'lucide-react',
			'recharts',
			'@radix-ui/react-dialog',
			'@radix-ui/react-select',
		],
	},
	// Bundle analyzer
	...(process.env.ANALYZE === 'true'
		? {
				webpack: (config) => {
					config.plugins.push(
						new (require('@next/bundle-analyzer'))({
							enabled: true,
							openAnalyzer: true,
						}),
					)
					return config
				},
		  }
		: {}),
}

export default nextConfig

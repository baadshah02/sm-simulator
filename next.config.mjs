/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    // Trailing slash for static hosting compatibility
    trailingSlash: true,
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  // output: 'export',
  reactStrictMode: false,
  images: {
    domains: ['localhost', 'flagcdn.com'],
    remotePatterns: [
      {
        hostname: '**.cyber-scale.me',
      },
    ],
  },
  i18n,
};

module.exports = nextConfig;

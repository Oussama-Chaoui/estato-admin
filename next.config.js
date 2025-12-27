/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: false,
  basePath: '/admin',
  trailingSlash: true,
  images: {
    domains: ['localhost', 'flagcdn.com'],
  },
  i18n,
};

module.exports = nextConfig;

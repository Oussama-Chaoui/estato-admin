/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['localhost', 'flagcdn.com', 'api.yakout-immo.com'],
  },
  i18n,
};

module.exports = nextConfig;

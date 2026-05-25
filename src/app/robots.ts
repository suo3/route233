import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/profile', '/quotes', '/login', '/signup', '/complete-profile'],
    },
    sitemap: 'https://233logistics.com/sitemap.xml',
  };
}

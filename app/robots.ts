import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/url'

export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl('/sitemap.xml')

  const robotsConfig: MetadataRoute.Robots = {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
  }

  if (sitemap)
    robotsConfig.sitemap = sitemap

  return robotsConfig
}

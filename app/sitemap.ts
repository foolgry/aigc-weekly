import type { MetadataRoute } from 'next'
import { requireBaseUrl } from '@/lib/url'
import { getAllWeeklySitemapItems } from '@/lib/weekly/data'

export const revalidate = 604800 // 1 week

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const weeks = await getAllWeeklySitemapItems()
  const baseUrl = requireBaseUrl()

  const weeklyUrls = weeks.map(week => ({
    url: `${baseUrl}/weekly/${week.slug}`,
    lastModified: new Date(week.publishDate),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...weeklyUrls,
  ]
}

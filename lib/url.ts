import { siteConfig } from '@/lib/config'

export function getBaseUrl() {
  return siteConfig.metadataBase?.toString().replace(/\/$/, '')
}

export function requireBaseUrl() {
  const baseUrl = getBaseUrl()
  if (!baseUrl)
    throw new Error('NEXT_PUBLIC_BASE_URL is required to generate absolute URLs')

  return baseUrl
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path))
    return path

  const baseUrl = getBaseUrl()
  if (!baseUrl)
    return undefined

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

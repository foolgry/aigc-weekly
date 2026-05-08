import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { TerminalLayout } from '@/components/theme/TerminalLayout'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ThemeScript } from '@/components/theme/ThemeScript'
import { siteConfig } from '@/lib/config'
import { getBaseUrl } from '@/lib/url'
import './global.css'

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: siteConfig.openGraph,
  twitter: siteConfig.twitter,
  icons: siteConfig.icons,
  metadataBase: siteConfig.metadataBase,
  alternates: siteConfig.alternates,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a170f',
}

export default async function RootLayout(props: { children: ReactNode }) {
  const { children } = props
  const websiteJsonLd = getWebsiteJsonLd()

  return (
    <html lang="zh-Hans" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c') }}
        />
        <ThemeScript />
        <ThemeProvider>
          <TerminalLayout>{children}</TerminalLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}

function getWebsiteJsonLd() {
  const baseUrl = getBaseUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': siteConfig.title,
    'description': siteConfig.description,
    'url': baseUrl,
    'inLanguage': 'zh-Hans',
    'publisher': {
      '@type': 'Person',
      'name': siteConfig.creator,
      'url': baseUrl,
    },
  }
}

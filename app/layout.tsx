import type { Metadata, Viewport } from 'next'
import './globals.css'
import { FONT_ASSETS, LOGO_ASSETS, SOCIAL_LINKS } from '@/lib/assets'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'

const FONT_PRELOADS = [
  FONT_ASSETS.book,
  FONT_ASSETS.bold,
] as const

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf4ed' },
    { media: '(prefers-color-scheme: dark)', color: '#191724' },
  ],
}

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://semesterbuild.jonathanrreed.com/#website',
  name: 'Semester Calendar Builder',
  description: 'Plan classes, study blocks, exams, and academic deadlines in a private browser-based semester calendar.',
  url: 'https://semesterbuild.jonathanrreed.com/',
  inLanguage: 'en-US',
  creator: {
    '@type': 'Person',
    name: 'Jonathan Reed',
    alternateName: 'Jonathan R Reed',
    url: 'https://jonathanrreed.com',
  },
}

export const metadata: Metadata = {
  title: 'Semester Calendar Builder by Jonathan R Reed',
  description: 'Semester Calendar Builder by Jonathan R Reed helps students lay out classes, time blocks and deadlines in a clean visual calendar.',
  keywords: ['semester calendar', 'class schedule builder', 'student planner', 'academic calendar', 'course scheduler', 'study planner', 'college schedule', 'university timetable', 'semester planner', 'course schedule builder'],
  authors: [{ name: 'Jonathan Reed' }],
  creator: 'Jonathan Reed',
  publisher: 'Jonathan Reed',
  generator: 'Next.js',
  metadataBase: new URL('https://semesterbuild.jonathanrreed.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon-180x180.png',
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Semester Calendar Builder | Course planning app by Jonathan R Reed',
    description: 'Semester Calendar Builder by Jonathan R Reed helps students lay out classes, time blocks and deadlines in a clean visual calendar.',
    siteName: 'Semester Calendar Builder',
    images: [
      {
        url: LOGO_ASSETS.full,
        width: 1200,
        height: 630,
        alt: 'Semester Calendar Builder - Visual calendar interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Semester Calendar Builder | Course planning app by Jonathan R Reed',
    description: 'Semester Calendar Builder by Jonathan R Reed helps students lay out classes, time blocks and deadlines in a clean visual calendar.',
    images: [LOGO_ASSETS.full],
    creator: '@jonathanreed',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {FONT_PRELOADS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" fetchPriority="high" />
        ))}
        <link rel="me" href={SOCIAL_LINKS.bluesky} />
        <link rel="me" href={SOCIAL_LINKS.linkedin} />
        <link rel="me" href={SOCIAL_LINKS.github} />
        <link rel="me" href={SOCIAL_LINKS.website} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema).replace(/</g, '\\u003c') }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

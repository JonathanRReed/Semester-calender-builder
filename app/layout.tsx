import type { Metadata, Viewport } from 'next'
import './globals.css'
import { FONT_ASSETS, LOGO_ASSETS, SOCIAL_LINKS } from '@/lib/assets'

const FAVICON_PATH = '/Icon.webp'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'

const FONT_SANS = "'Nebula Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const FONT_MONO = "'ui-monospace', 'SFMono-Regular', 'SFMono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace"
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

export const metadata: Metadata = {
  title: 'Semester Calendar Builder - Plan Your Perfect Academic Schedule',
  description: 'Build and organize your semester schedule with ease. Add courses, study blocks, and important dates. Export to PDF, PNG, or JSON. Free online calendar tool for students.',
  keywords: ['semester calendar', 'class schedule builder', 'student planner', 'academic calendar', 'course scheduler', 'study planner', 'college schedule', 'university timetable'],
  authors: [{ name: 'Jonathan Reed' }],
  creator: 'Jonathan Reed',
  publisher: 'Jonathan Reed',
  generator: 'Next.js',
  metadataBase: new URL('https://semesterbuild.jonathanrreed.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: FAVICON_PATH,
    shortcut: FAVICON_PATH,
    apple: FAVICON_PATH,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Semester Calendar Builder - Plan Your Perfect Academic Schedule',
    description: 'Build and organize your semester schedule with ease. Add courses, study blocks, and important dates. Export to PDF, PNG, or JSON. Free online calendar tool for students.',
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
    title: 'Semester Calendar Builder - Plan Your Perfect Academic Schedule',
    description: 'Build and organize your semester schedule with ease. Add courses, study blocks, and important dates. Free online calendar tool for students.',
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
        <link rel="dns-prefetch" href="https://fonts.helloworldfirm.com" />
        <link rel="preconnect" href="https://fonts.helloworldfirm.com" crossOrigin="anonymous" />
        {FONT_PRELOADS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" fetchPriority="high" />
        ))}
        <link rel="icon" href={FAVICON_PATH} type="image/webp" />
        <link rel="apple-touch-icon" href={FAVICON_PATH} />
        <link rel="me" href={SOCIAL_LINKS.bluesky} />
        <link rel="me" href={SOCIAL_LINKS.linkedin} />
        <link rel="me" href={SOCIAL_LINKS.github} />
        <link rel="me" href={SOCIAL_LINKS.website} />
        <style>{`
:root {
  --font-sans: ${FONT_SANS};
  --font-mono: ${FONT_MONO};
}
html {
  font-family: var(--font-sans);
}
        `}</style>
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

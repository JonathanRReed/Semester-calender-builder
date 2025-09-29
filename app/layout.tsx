import type { Metadata } from 'next'
import './globals.css'
import { FONT_ASSETS, LOGO_ASSETS, SOCIAL_LINKS } from '@/lib/assets'

const FAVICON_PATH = '/Icon.webp'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'

const FONT_SANS = "'Nebula Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const FONT_MONO = "'ui-monospace', 'SFMono-Regular', 'SFMono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace"
const FONT_PRELOADS = [
  FONT_ASSETS.light,
  FONT_ASSETS.lightItalic,
  FONT_ASSETS.book,
  FONT_ASSETS.bold,
  FONT_ASSETS.boldItalic,
] as const

export const metadata: Metadata = {
  title: 'Semester Calendar Builder',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: FAVICON_PATH,
    shortcut: FAVICON_PATH,
    apple: FAVICON_PATH,
  },
  openGraph: {
    images: [
      {
        url: LOGO_ASSETS.full,
        width: 1200,
        height: 630,
        alt: 'Semester Calendar Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [LOGO_ASSETS.full],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.helloworldfirm.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.helloworldfirm.com" crossOrigin="anonymous" />
        {FONT_PRELOADS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
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
          defaultTheme="dark"
          enableSystem={false}
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

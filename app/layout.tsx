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

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Semester Calendar Builder',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: 0,
    priceCurrency: 'USD',
  },
  review: {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'Jonathan Reed',
      alternateName: 'Jonathan R Reed',
      url: 'https://jonathanrreed.com',
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: 'A free private semester planning app for arranging classes, study blocks, exams, deadlines, exports, and advisor-ready schedule reviews in a browser.',
  },
  author: {
    '@type': 'Person',
    name: 'Jonathan Reed',
    alternateName: 'Jonathan R Reed',
    url: 'https://jonathanrreed.com',
  },
  description: 'Plan classes, study blocks, exams, and academic deadlines in a private browser-based semester calendar.',
  url: 'https://semesterbuild.jonathanrreed.com',
  featureList: [
    'Visual weekly calendar',
    'In-person and online class support',
    'Study block scheduling',
    'ICS, CSV, PNG, and JSON export',
    'Important date tracking',
    'Dark mode support',
  ],
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
    icon: FAVICON_PATH,
    shortcut: FAVICON_PATH,
    apple: FAVICON_PATH,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema).replace(/</g, '\\u003c') }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  if (typeof window === "undefined") return;

  const ascii = \`
    ___  ________  ________     
   |\\\\  \\\\|\\\\   __  \\\\|\\\\   __  \\\\    
   \\\\ \\\\  \\\\ \\\\  \\\\|\\\\  \\\\ \\\\  \\\\|\\\\  \\\\   
 __ \\\\ \\\\  \\\\ \\\\   _  _\\\\ \\\\   _  _\\\\  
|\\\\  \\\\\\\\_\\\\  \\\\ \\\\  \\\\\\\\  \\\\\\\\ \\\\  \\\\\\\\  \\\\|
\\\\ \\\\________\\\\ \\\\__\\\\\\\\ _\\\\\\\\ \\\\__\\\\\\\\ _\\\\
 \\\\|________|\\\\|__|\\\\|__|\\\\|__|\\\\|__|
                                
                                
                                
  \`;

  console.log(ascii);
  console.log("Hey there. Interested in code?");
  console.log("Check out my GitHub: https://github.com/JonathanRReed");
  console.log("Most of my sites repos are open source.");
})();
            `,
          }}
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

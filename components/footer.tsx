import { SOCIAL_LINKS, LOGO_ASSETS } from '@/lib/assets'
import Image from 'next/image'
import Link from 'next/link'

const FOOTER_LINKS = [
    { href: '/about/', label: 'About' },
    { href: '/contact/', label: 'Contact' },
    { href: '/privacy/', label: 'Privacy' },
    { href: SOCIAL_LINKS.website, label: 'Jonathan Reed' },
    { href: 'https://helloworldfirm.com', label: 'Hello.World Consulting' },
    { href: 'https://5whys.jonathanrreed.com', label: 'Career Studio' },
    { href: 'https://dev-tools.helloworldfirm.com', label: 'Simple Dev Tools' },
] as const

export function Footer() {
    return (
        <footer className="glass-card mt-8 p-4 text-center text-xs text-muted-foreground space-y-4">
            <Link href="/" className="inline-block">
                <Image
                    src={LOGO_ASSETS.footer}
                    alt="Semester Calendar Builder"
                    width={200}
                    height={67}
                    className="mx-auto h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
            </Link>
            <p>
                <a
                    href="https://jonathanrreed.com/projects/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                    Jonathan Reed AI and developer portfolio
                </a>
            </p>
            <nav aria-label="Related projects">
                <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                    {FOOTER_LINKS.map(({ href, label }, index) => (
                        <li key={href} className="flex items-center gap-4">
                            <a
                                href={href}
                                {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
                            >
                                {label}
                            </a>
                            {index < FOOTER_LINKS.length - 1 && (
                                <span className="hidden sm:inline text-muted-foreground/50" aria-hidden="true">·</span>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </footer>
    )
}

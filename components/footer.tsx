import { SOCIAL_LINKS } from '@/lib/assets'

const FOOTER_LINKS = [
    { href: SOCIAL_LINKS.website, label: 'Jonathan Reed' },
    { href: 'https://helloworldfirm.com', label: 'Hello.World Consulting' },
    { href: 'https://5whys.jonathanrreed.com', label: 'Career Studio' },
    { href: 'https://dev-tools.helloworldfirm.com', label: 'Simple Dev Tools' },
] as const

export function Footer() {
    return (
        <footer className="glass-card mt-8 p-4 text-center text-xs text-muted-foreground">
            <nav aria-label="Related projects">
                <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                    {FOOTER_LINKS.map(({ href, label }, index) => (
                        <li key={href} className="flex items-center gap-4">
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
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

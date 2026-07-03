'use client';

import * as React from 'react';
import { Moon, Sun, Github, BookOpen, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/causal/Logo';

const NAV_LINKS = [
  { label: 'Methodology', href: '#methodology' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Samples', href: '#upload' },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [activeSection, setActiveSection] = React.useState<string>('');

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
      setScrolled(scrollTop > 8);

      // Track active section for nav highlight
      const sections = ['methodology', 'how-it-works', 'upload'];
      const current = sections.find((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 120 && rect.bottom >= 120;
      });
      setActiveSection(current ?? '');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'glass-strong border-b border-border/60 shadow-sm shadow-foreground/5'
          : 'border-b border-border/30'
      }`}
    >
      {/* Scroll progress bar */}
      <div
        className="absolute left-0 top-0 h-px bg-gradient-to-r from-primary via-chart-3 to-chart-5 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
        aria-hidden
      />

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6 lg:px-8">
        {/* Brand — flex-shrink: 0 */}
        <a
          href="#top"
          className="group flex flex-shrink-0 items-center transition-opacity hover:opacity-90"
          aria-label="Causal Impact — Counterfactual Engine"
        >
          <Logo size="lg" />
        </a>

        {/* Center nav — flex: 1, justify-center, fills available space */}
        <nav
          className="hidden h-[48px] flex-1 items-center justify-center gap-1 rounded-full border border-border/50 bg-card/40 px-2 backdrop-blur md:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => {
            const sectionId = link.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative inline-flex h-9 items-center rounded-full px-5 text-[13px] font-semibold tracking-tight transition-colors ${
                  isActive
                    ? 'bg-primary/12 text-primary'
                    : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Actions — flex-shrink: 0 */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <a
            href="https://google.github.io/CausalImpact/"
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground lg:inline-flex"
          >
            <BookOpen className="h-5 w-5" strokeWidth={1.75} />
            Paper
          </a>
          <a
            href="https://github.com/jamalsenouci/causalimpact"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <Github className="h-5 w-5" strokeWidth={1.75} />
          </a>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="size-5" strokeWidth={1.75} />
              ) : (
                <Moon className="size-5" strokeWidth={1.75} />
              )}
            </Button>
          )}
          <a
            href="#upload"
            className="ml-2 hidden h-9 items-center gap-1 rounded-md bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-sm hover:shadow-primary/30 sm:inline-flex"
          >
            Try it
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
          </a>
        </div>
      </div>
    </header>
  );
}

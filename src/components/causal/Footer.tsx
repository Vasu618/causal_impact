'use client';

import * as React from 'react';
import { Github, BookOpen, FlaskConical, FileText, ExternalLink } from 'lucide-react';
import { Logo } from '@/components/causal/Logo';

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border/60 bg-card/30">
      {/* Subtle gradient glow at top of footer */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[60rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Logo size="lg" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              An open-source dashboard for proving campaign causation, not just correlation.
              Built on Google&rsquo;s CausalImpact methodology and pycausalimpact.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com/jamalsenouci/causalimpact"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-card/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://google.github.io/CausalImpact/"
                target="_blank"
                rel="noreferrer"
                aria-label="CausalImpact paper"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-card/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <BookOpen className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform column */}
          <FooterColumn
            title="Platform"
            links={[
              { label: 'Upload data', href: '#upload' },
              { label: 'Methodology', href: '#methodology' },
              { label: 'How it works', href: '#how-it-works' },
              { label: 'Sample datasets', href: '#upload' },
            ]}
          />

          {/* Resources column */}
          <FooterColumn
            title="Resources"
            links={[
              {
                label: 'CausalImpact paper',
                href: 'https://google.github.io/CausalImpact/',
                external: true,
                icon: FileText,
              },
              {
                label: 'pycausalimpact',
                href: 'https://github.com/jamalsenouci/causalimpact',
                external: true,
                icon: FlaskConical,
              },
              {
                label: 'Bayesian BSTS primer',
                href: 'https://en.wikipedia.org/wiki/Bayesian_structural_time_series',
                external: true,
              },
              {
                label: 'Next.js docs',
                href: 'https://nextjs.org/docs',
                external: true,
              },
            ]}
          />

          {/* Legal column */}
          <FooterColumn
            title="Tech stack"
            links={[
              { label: 'Next.js 16', href: '#', external: false },
              { label: 'TypeScript', href: '#', external: false },
              { label: 'Tailwind CSS 4', href: '#', external: false },
              { label: 'Recharts · shadcn/ui', href: '#', external: false },
              { label: 'Python · statsmodels', href: '#', external: false },
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div>
            &copy; {new Date().getFullYear()} Causal Impact Platform · Open-source reference implementation.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-2" />
              All systems operational
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">No tracking · No cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean; icon?: React.ElementType }[];
}) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.icon && <link.icon className="h-3.5 w-3.5 text-muted-foreground/70 transition-colors group-hover:text-primary" />}
              {link.label}
              {link.external && (
                <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

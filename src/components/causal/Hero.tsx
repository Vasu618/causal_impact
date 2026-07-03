'use client';

import * as React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Upload,
  LineChart,
  GitBranch,
  Target,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface HeroProps {
  onJumpToUpload: () => void;
}

export function Hero({ onJumpToUpload }: HeroProps) {
  const reduce = useReducedMotion();
  const heroRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(heroRef, { once: true, margin: '-80px' });

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: reduce ? 0 : 0.1 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section id="top" ref={heroRef} className="relative overflow-hidden border-b border-border/40">
      {/* Soft, static background glows — positioned behind the headline (left)
          and the hero card (right). Very low opacity, large blur, fade
          smoothly into white. No animation, no decorative shapes. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {/* Behind the headline — soft chartreuse glow */}
        <div
          className="absolute left-[5%] top-[15%] h-[32rem] w-[32rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, oklch(0.85 0.2 130 / 0.10) 0%, transparent 65%)',
          }}
        />
        {/* Behind the hero card — softer, slightly warmer glow */}
        <div
          className="absolute right-[8%] top-[25%] h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, oklch(0.85 0.2 130 / 0.07) 0%, transparent 65%)',
          }}
        />
        {/* Wide, very faint base wash to tie the two together */}
        <div
          className="absolute left-1/2 top-1/2 h-[40rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse, oklch(0.85 0.2 130 / 0.035) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
        >
          {/* Left: Copy */}
          <div className="flex flex-col justify-center">
            <motion.h1
              variants={item}
              className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Did your campaign{' '}
              <span className="text-gradient-primary">actually cause</span>{' '}
              the lift?
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Most dashboards tell you <em className="text-foreground/90">what</em> happened.
              This one tells you <strong className="font-semibold text-foreground">why</strong>.
              Upload a time series, mark the intervention date, and Bayesian Structural
              Time-Series will reconstruct the counterfactual — the world where the campaign
              never ran — and quantify the true incremental lift.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onJumpToUpload}
                className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_30px_-4px_var(--primary)]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Upload className="h-4 w-4" />
                Upload your data
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#methodology"
                className="inline-flex h-12 items-center gap-2 rounded-md border border-border/60 bg-card/40 px-5 text-sm font-medium text-foreground/90 backdrop-blur transition-all hover:border-primary/40 hover:bg-card/60"
              >
                <LineChart className="h-4 w-4 text-primary" />
                See methodology
              </a>
            </motion.div>

            <motion.div variants={item} className="mt-10 grid grid-cols-3 gap-4">
              <StatCounter
                icon={<Target className="h-3.5 w-3.5" />}
                label="Counterfactual"
                value="Bayesian"
              />
              <StatCounter
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                label="Significance"
                value="p-value"
              />
              <StatCounter
                icon={<GitBranch className="h-3.5 w-3.5" />}
                label="Engine"
                value="pycausalimpact"
              />
            </motion.div>
          </div>

          {/* Right: Animated chart mockup */}
          <motion.div variants={item} className="relative flex items-center justify-center">
            <ChartMockup />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StatCounter({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border/40 bg-card/30 p-3.5 backdrop-blur transition-all hover:border-primary/40 hover:bg-card/50">
      <div className="absolute inset-0 -translate-y-full bg-gradient-to-b from-primary/5 to-transparent transition-transform duration-500 group-hover:translate-y-0" />
      <div className="relative flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="relative mt-1.5 text-sm font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function ChartMockup() {
  const reduce = useReducedMotion();
  // Build a synthetic "actual vs predicted" mock curve
  const W = 460;
  const H = 280;
  const N = 40;
  const interventionIdx = 26;
  const pad = 24;

  const points = React.useMemo(() => {
    const arr: { x: number; yActual: number; yPredicted: number }[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const x = pad + t * (W - 2 * pad);
      // Pre-intervention: similar values
      const baseY = 0.6 + 0.04 * Math.sin(t * 12);
      // Post-intervention: actual diverges upward
      const lift = i > interventionIdx ? (i - interventionIdx) * 0.018 : 0;
      const yActual = Math.max(0.08, Math.min(0.92, baseY - 0.05 + lift));
      const yPredicted = Math.max(0.08, Math.min(0.92, baseY - 0.05));
      arr.push({
        x,
        yActual: H - pad - yActual * (H - 2 * pad),
        yPredicted: H - pad - yPredicted * (H - 2 * pad),
      });
    }
    return arr;
  }, []);

  const actualPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yActual.toFixed(1)}`)
    .join(' ');
  const predictedPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yPredicted.toFixed(1)}`)
    .join(' ');

  // CI band (only post-intervention)
  const ciBand = (() => {
    const post = points.slice(interventionIdx);
    const upper = post.map((p) => ({ x: p.x, y: p.yActual - 18 }));
    const lower = post.map((p) => ({ x: p.x, y: p.yActual + 18 }));
    const path = [...upper, ...lower.reverse()]
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
    return path;
  })();

  return (
    <Card className="card-gradient glass relative w-full max-w-md overflow-hidden border-border/50">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <div className="text-xs font-semibold">Sales · True Success</div>
              <div className="text-[10px] text-muted-foreground">Daily · 1000 obs</div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-chart-2/15 px-2 py-0.5 text-[10px] font-semibold text-chart-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            p &lt; 0.001
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ciFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.04} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1={pad}
              x2={W - pad}
              y1={pad + g * (H - 2 * pad)}
              y2={pad + g * (H - 2 * pad)}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          ))}

          {/* Intervention marker */}
          <line
            x1={points[interventionIdx].x}
            x2={points[interventionIdx].x}
            y1={pad}
            y2={H - pad}
            stroke="var(--chart-5)"
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
          <text
            x={points[interventionIdx].x + 4}
            y={pad + 10}
            fill="var(--chart-5)"
            fontSize={9}
            fontWeight={600}
          >
            intervention
          </text>

          {/* CI band */}
          <motion.path
            d={ciBand}
            fill="url(#ciFill)"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />

          {/* Predicted (counterfactual) — dashed */}
          <motion.path
            d={predictedPath}
            fill="none"
            stroke="var(--chart-5)"
            strokeWidth={1.8}
            strokeDasharray="5 4"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />

          {/* Actual — solid, animated reveal */}
          <motion.path
            d={actualPath}
            fill="none"
            stroke="var(--chart-1)"
            strokeWidth={2.4}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
          />
        </svg>

        <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-3">
          <Legend color="var(--chart-1)" label="Actual" />
          <Legend color="var(--chart-5)" label="Predicted (counterfactual)" dashed />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg lift</div>
            <div className="text-sm font-bold text-chart-1">+$883/day</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="14" height="6" className="overflow-visible">
        <line
          x1="0"
          y1="3"
          x2="14"
          y2="3"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? '4 3' : undefined}
        />
      </svg>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

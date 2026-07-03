'use client';

import * as React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  Database,
  Cpu,
  GitCompare,
  FlaskConical,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const STEPS = [
  {
    num: '01',
    icon: Database,
    title: 'Upload your time series',
    desc: 'A CSV with a date column, the target metric (Y), and optional control covariates (X). The model learns the relationship between Y and X in the pre-period.',
  },
  {
    num: '02',
    icon: Cpu,
    title: 'Fit a Bayesian state-space model',
    desc: 'pycausalimpact fits a structural time-series model on the pre-intervention period — capturing trend, seasonality, and regression on covariates with Bayesian posterior uncertainty.',
  },
  {
    num: '03',
    icon: GitCompare,
    title: 'Project the counterfactual forward',
    desc: 'The fitted model is rolled forward into the post-period to predict what Y would have been without the intervention. The gap between actual and predicted is the causal effect.',
  },
  {
    num: '04',
    icon: FlaskConical,
    title: 'Quantify significance',
    desc: 'A Bayesian p-value is computed from the posterior tail-area probability, telling you whether the observed lift is real signal or could plausibly be noise.',
  },
];

export function Methodology() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const reduce = useReducedMotion();

  return (
    <section
      id="methodology"
      ref={ref}
      className="relative border-b border-border/40 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Methodology
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            The counterfactual, made rigorous
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Instead of comparing "before" vs "after" — which conflates every concurrent
            trend with your campaign — the platform asks one question:{' '}
            <em className="text-foreground">what would have happened without the intervention?</em>{' '}
            Bayesian Structural Time-Series answers it with full posterior uncertainty.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: reduce ? 0 : i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Card className="card-gradient group relative h-full overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30 transition-all group-hover:bg-primary/25 group-hover:ring-primary/50">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-mono text-xs font-bold text-muted-foreground/60">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold tracking-tight">{step.title}</h3>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                    {i < STEPS.length - 1 && (
                      <ArrowRight className="mt-4 h-3.5 w-3.5 text-muted-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-primary/60" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Scenario comparison */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <div className="mb-5 text-center">
            <h3 className="text-xl font-semibold tracking-tight">
              The same algorithm, two very different verdicts
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Both datasets have an intervention at day 700. Only one has a real causal effect.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ScenarioCard
              kind="fake"
              title="Fake Success"
              tagline="Seasonal trend, no marketing impact"
              icon={<TrendingUp className="h-4 w-4" />}
              actual="$189/day"
              relative="+11.4%"
              verdict="Most of the 'lift' was already baked into the seasonal trend"
              verdictTone="muted"
            />
            <ScenarioCard
              kind="true"
              title="True Success"
              tagline="Flat baseline, real campaign lift"
              icon={<TrendingUp className="h-4 w-4" />}
              actual="$883/day"
              relative="+88.1%"
              verdict="The spike breaks historical patterns — campaign caused the lift"
              verdictTone="positive"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ScenarioCard({
  kind,
  title,
  tagline,
  icon,
  actual,
  relative,
  verdict,
  verdictTone,
}: {
  kind: 'fake' | 'true';
  title: string;
  tagline: string;
  icon: React.ReactNode;
  actual: string;
  relative: string;
  verdict: string;
  verdictTone: 'positive' | 'muted';
}) {
  const accent = kind === 'true' ? 'text-chart-1' : 'text-muted-foreground';
  const ringClass = kind === 'true' ? 'ring-1 ring-chart-1/30' : '';
  return (
    <Card
      className={`card-gradient overflow-hidden border-border/50 ${ringClass}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={accent}>{icon}</span>
              <h4 className="text-base font-semibold">{title}</h4>
            </div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {tagline}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Avg daily effect
            </div>
            <div className={`mt-1 text-2xl font-bold tracking-tight tabular-nums ${accent}`}>
              {actual}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Relative lift
            </div>
            <div className={`mt-1 text-2xl font-bold tracking-tight tabular-nums ${accent}`}>
              {relative}
            </div>
          </div>
        </div>

        <div
          className={`mt-5 rounded-lg border p-3 text-xs leading-relaxed ${
            verdictTone === 'positive'
              ? 'border-chart-1/30 bg-chart-1/5 text-foreground/90'
              : 'border-border/60 bg-muted/20 text-muted-foreground'
          }`}
        >
          {verdict}
        </div>
      </CardContent>
    </Card>
  );
}

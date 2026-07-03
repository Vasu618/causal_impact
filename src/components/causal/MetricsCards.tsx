'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Sigma, CalendarRange, Percent, FlaskConical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { AnalysisMetrics } from '@/lib/causal-types';

interface MetricsCardsProps {
  metrics: AnalysisMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const isSignificant = metrics.p_value < 0.05;
  const isPositiveEffect = metrics.average_effect > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Average Effect"
        value={formatCurrency(metrics.average_effect)}
        sub={`per day, post-intervention`}
        icon={isPositiveEffect ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        accent={isPositiveEffect ? 'positive' : 'negative'}
      />
      <MetricCard
        label="Cumulative Effect"
        value={formatCurrency(metrics.cumulative_effect)}
        sub={`total incremental lift`}
        icon={<Sigma className="h-4 w-4" />}
        accent={metrics.cumulative_effect > 0 ? 'positive' : 'negative'}
      />
      <MetricCard
        label="P-Value"
        value={metrics.p_value.toFixed(4)}
        sub={isSignificant ? 'statistically significant' : 'not significant'}
        icon={<FlaskConical className="h-4 w-4" />}
        accent={isSignificant ? 'significant' : 'insignificant'}
        highlight={isSignificant ? 'green' : 'red'}
      />
      <MetricCard
        label="Relative Effect"
        value={`${metrics.relative_effect > 0 ? '+' : ''}${(metrics.relative_effect * 100).toFixed(2)}%`}
        sub={`vs. counterfactual baseline`}
        icon={<Percent className="h-4 w-4" />}
        accent={metrics.relative_effect > 0 ? 'positive' : 'negative'}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: 'positive' | 'negative' | 'significant' | 'insignificant';
  highlight?: 'green' | 'red';
}) {
  const accentMap = {
    positive: 'text-chart-2',
    negative: 'text-chart-5',
    significant: 'text-chart-2',
    insignificant: 'text-chart-5',
  };

  const iconBgMap = {
    positive: 'bg-chart-2/15 ring-chart-2/30',
    negative: 'bg-chart-5/15 ring-chart-5/30',
    significant: 'bg-chart-2/15 ring-chart-2/30',
    insignificant: 'bg-chart-5/15 ring-chart-5/30',
  };

  return (
    <Card
      className={`relative overflow-hidden border-border/60 transition-shadow hover:shadow-lg ${
        highlight === 'green'
          ? 'ring-1 ring-chart-2/40'
          : highlight === 'red'
          ? 'ring-1 ring-chart-5/40'
          : ''
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${iconBgMap[accent]} ${accentMap[accent]}`}
          >
            {icon}
          </div>
        </div>
        <div className={`mt-3 text-2xl font-bold tracking-tight tabular-nums ${accentMap[accent]}`}>
          {value}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>

        {highlight && (
          <div
            className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              highlight === 'green'
                ? 'bg-chart-2/15 text-chart-2'
                : 'bg-chart-5/15 text-chart-5'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {highlight === 'green' ? 'p < 0.05' : 'p ≥ 0.05'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatCurrency(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1000).toFixed(1)}K`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

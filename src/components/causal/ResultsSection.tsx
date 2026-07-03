'use client';

import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { AnalysisResponse } from '@/lib/causal-types';
import { MetricsCards } from './MetricsCards';
import { CausalImpactChart } from './CausalImpactChart';
import { PointEffectChart } from './PointEffectChart';
import { ReportPanel } from './ReportPanel';
import { ExportButtons } from './ExportButtons';

interface ResultsSectionProps {
  result: AnalysisResponse;
  durationMs: number | null;
}

export function ResultsSection({ result, durationMs }: ResultsSectionProps) {
  const isSignificant = result.metrics.p_value < 0.05;
  const verdict = isSignificant
    ? result.metrics.average_effect > 0
      ? 'The intervention caused a statistically significant positive lift.'
      : 'The intervention caused a statistically significant negative impact.'
    : 'No statistically significant causal effect detected.';

  return (
    <section className="space-y-6">
      {/* Verdict banner */}
      <div
        className={`flex flex-col gap-2 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
          isSignificant
            ? result.metrics.average_effect > 0
              ? 'border-chart-2/40 bg-chart-2/10'
              : 'border-chart-5/40 bg-chart-5/10'
            : 'border-border/60 bg-muted/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
              isSignificant
                ? result.metrics.average_effect > 0
                  ? 'text-chart-2'
                  : 'text-chart-5'
                : 'text-muted-foreground'
            }`}
          />
          <div>
            <div className="text-sm font-semibold leading-tight">{verdict}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Bayesian Structural Time-Series · {result.results.length.toLocaleString()} daily observations analyzed
              {durationMs !== null && (
                <> · completed in {(durationMs / 1000).toFixed(2)}s</>
              )}
            </div>
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="font-mono text-sm font-bold">
            {result.metrics.p_value < 0.001 ? 'p < 0.001' : `p = ${result.metrics.p_value.toFixed(4)}`}
          </div>
          <div className="text-muted-foreground">{isSignificant ? 'significant' : 'not significant'}</div>
        </div>
      </div>

      {/* Metric cards */}
      <MetricsCards metrics={result.metrics} />

      {/* Main chart */}
      <CausalImpactChart result={result} />

      {/* Point effects */}
      <PointEffectChart result={result} />

      {/* Export + report side by side on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ReportPanel result={result} />
        <ExportButtons result={result} />
      </div>
    </section>
  );
}

'use client';

import * as React from 'react';
import { Header } from '@/components/causal/Header';
import { Hero } from '@/components/causal/Hero';
import { Methodology } from '@/components/causal/Methodology';
import { Footer } from '@/components/causal/Footer';
import { UploadPanel } from '@/components/causal/UploadPanel';
import { DataPreview } from '@/components/causal/DataPreview';
import { ConfigPanel } from '@/components/causal/ConfigPanel';
import { ResultsSection } from '@/components/causal/ResultsSection';
import { toast } from 'sonner';
import type { ParsedCsv, AnalysisResponse, AnalysisState } from '@/lib/causal-types';
import { Toaster } from '@/components/ui/sonner';

export default function Page() {
  const [parsed, setParsed] = React.useState<ParsedCsv | null>(null);
  const [analysis, setAnalysis] = React.useState<AnalysisState>({
    status: 'idle',
    result: null,
    error: null,
    startedAt: null,
    durationMs: null,
  });

  const uploadRef = React.useRef<HTMLDivElement | null>(null);
  const configRef = React.useRef<HTMLDivElement | null>(null);
  const resultsRef = React.useRef<HTMLDivElement | null>(null);

  const handleParsed = (p: ParsedCsv) => {
    setParsed(p);
    setAnalysis({
      status: 'idle',
      result: null,
      error: null,
      startedAt: null,
      durationMs: null,
    });
    // Scroll to config panel
    setTimeout(() => {
      configRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleClear = () => {
    setParsed(null);
    setAnalysis({
      status: 'idle',
      result: null,
      error: null,
      startedAt: null,
      durationMs: null,
    });
  };

  const handleRun = async (config: {
    dateCol: string;
    targetCol: string;
    covariateCols: string[];
    interventionDate: string;
  }) => {
    if (!parsed) return;
    const startedAt = Date.now();
    setAnalysis({
      status: 'analyzing',
      result: null,
      error: null,
      startedAt,
      durationMs: null,
    });

    try {
      // Build payload — send raw string rows so Python re-parses
      const rows = parsed.rawRows.map((r) => {
        const out: Record<string, string | number> = {};
        for (const c of parsed.columns) {
          const v = r[c];
          out[c] = v ?? '';
        }
        return out;
      });

      const payload = {
        rows,
        intervention_date: config.interventionDate,
        target_col: config.targetCol,
        date_col: config.dateCol,
        covariate_cols: config.covariateCols,
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        const errMsg = data.error || `HTTP ${res.status}`;
        const detail = data.detail ? `\n${data.detail}` : '';
        setAnalysis({
          status: 'error',
          result: null,
          error: errMsg + detail,
          startedAt,
          durationMs: Date.now() - startedAt,
        });
        toast.error('Analysis failed', { description: errMsg });
        return;
      }

      const result = data as AnalysisResponse;
      setAnalysis({
        status: 'success',
        result,
        error: null,
        startedAt,
        durationMs: Date.now() - startedAt,
      });
      toast.success('Analysis complete', {
        description: `p = ${result.metrics.p_value.toFixed(4)} · avg effect $${result.metrics.average_effect.toFixed(2)}`,
      });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setAnalysis({
        status: 'error',
        result: null,
        error: msg,
        startedAt,
        durationMs: Date.now() - startedAt,
      });
      toast.error('Network error', { description: msg });
    }
  };

  const jumpToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster richColors position="top-right" />
      <Header />

      <main className="flex-1">
        {/* Hero — only show when no data loaded */}
        {!parsed && (
          <>
            <Hero onJumpToUpload={jumpToUpload} />
            <Methodology />
          </>
        )}

        {/* Upload section */}
        <section
          id="upload"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        >
          <div ref={uploadRef} className="space-y-6 scroll-mt-20">
            {!parsed && (
              <div id="how-it-works" className="scroll-mt-20">
                <SectionHeading
                  eyebrow="Step 01"
                  title="Bring your data"
                  description="Upload a CSV with a date column, a target metric, and optional covariates. Or load one of the two pre-built samples to see the platform in action."
                />
              </div>
            )}
            <UploadPanel
              onParsed={handleParsed}
              currentFile={parsed}
              onClear={handleClear}
              uploadRef={uploadRef}
            />

            {parsed && (
              <>
                <DataPreview parsed={parsed} />
                <div ref={configRef} className="scroll-mt-20">
                  <SectionHeading
                    eyebrow="Step 02"
                    title="Configure the analysis"
                    description="Map your columns and pick the day your intervention started. The model learns from everything before that moment."
                    compact
                  />
                  <ConfigPanel
                    parsed={parsed}
                    onRun={handleRun}
                    isAnalyzing={analysis.status === 'analyzing'}
                    error={analysis.status === 'error' ? analysis.error : null}
                  />
                </div>
              </>
            )}
          </div>

          {/* Results section */}
          {analysis.status === 'success' && analysis.result && (
            <div ref={resultsRef} className="mt-12 scroll-mt-20">
              <SectionHeading
                eyebrow="Step 03"
                title="Read the verdict"
                description="The Bayesian model has reconstructed the counterfactual. The gap between actual and predicted in the post-period is your causal effect."
                compact
              />
              <ResultsSection result={analysis.result} durationMs={analysis.durationMs} />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  compact,
}: {
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'mb-5' : 'mb-8'}>
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {eyebrow}
      </div>
      <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
}

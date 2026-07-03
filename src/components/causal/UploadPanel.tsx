'use client';

import * as React from 'react';
import { UploadCloud, FileText, FlaskConical, TrendingUp, X, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { ParsedCsv } from '@/lib/causal-types';
import { parseCsvText } from '@/lib/csv-utils';

interface UploadPanelProps {
  onParsed: (parsed: ParsedCsv) => void;
  currentFile: ParsedCsv | null;
  onClear: () => void;
  uploadRef: React.RefObject<HTMLDivElement | null>;
}

export function UploadPanel({ onParsed, currentFile, onClear, uploadRef }: UploadPanelProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [loadingSample, setLoadingSample] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = React.useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
        toast.error('Please upload a CSV file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large (max 5MB).');
        return;
      }
      try {
        const text = await file.text();
        const parsed = parseCsvText(text, file.name);
        if (parsed.columns.length === 0 || parsed.rowCount === 0) {
          toast.error('CSV appears to be empty or malformed.');
          return;
        }
        onParsed(parsed);
        toast.success(`Loaded ${parsed.rowCount.toLocaleString()} rows from ${file.name}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        toast.error(`Failed to parse CSV: ${msg}`);
      }
    },
    [onParsed]
  );

  const handleSample = React.useCallback(
    async (which: 'fake' | 'true') => {
      setLoadingSample(which);
      try {
        const url = which === 'fake' ? '/samples/fake_success.csv' : '/samples/true_success.csv';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const parsed = parseCsvText(text, `${which}_success.csv`);
        onParsed(parsed);
        toast.success(
          `Loaded ${which === 'fake' ? 'Fake Success' : 'True Success'} sample (${parsed.rowCount} rows)`
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        toast.error(`Failed to load sample: ${msg}`);
      } finally {
        setLoadingSample(null);
      }
    },
    [onParsed]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Card ref={uploadRef as React.RefObject<HTMLDivElement>} className="card-gradient scroll-mt-20 border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <UploadCloud className="h-4 w-4 text-primary" />
              Data Input
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Upload a CSV file or load a pre-built sample to see the platform in action.
            </CardDescription>
          </div>
          {currentFile && (
            <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5 text-xs">
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all ${
            isDragging
              ? 'border-primary bg-primary/10 shadow-[0_0_40px_-8px_var(--primary)]'
              : 'border-border/70 hover:border-primary/60 hover:bg-muted/30'
          }`}
        >
          {/* Subtle hover glow background */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-1 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:from-primary/5 group-hover:to-chart-5/5 group-hover:opacity-100"
          />
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30 transition-transform group-hover:scale-105">
            <UploadCloud className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-4 text-sm font-medium">
            {isDragging ? 'Drop your CSV here' : 'Drag & drop CSV or click to browse'}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Max 5MB · must include a date column and at least one numeric column
          </div>
        </div>

        {/* Current file indicator */}
        {currentFile && (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs">
            <CheckCircle2 className="h-4 w-4 text-chart-2" />
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{currentFile.fileName}</span>
            <span className="text-muted-foreground">
              · {currentFile.rowCount.toLocaleString()} rows · {currentFile.columns.length} columns
            </span>
          </div>
        )}

        {/* Sample datasets */}
        <div className="grid gap-3 sm:grid-cols-2">
          <SampleCard
            kind="fake"
            title="Fake Success"
            tagline="Seasonal trend · zero marketing impact"
            icon={<FlaskConical className="h-4 w-4" />}
            description="Sales naturally rise from $1,000 → $2,000 over 1,000 days. Marketing spend jumps at day 700 but has zero effect. The model should detect near-zero causal lift."
            expected="Expected: small / insignificant effect"
            loading={loadingSample === 'fake'}
            onClick={() => handleSample('fake')}
          />
          <SampleCard
            kind="true"
            title="True Success"
            tagline="Flat baseline · real campaign lift"
            icon={<TrendingUp className="h-4 w-4" />}
            description="Flat ~$1,000/day baseline. At intervention day 700, sales spike $2,000/day (decaying $1,200 + sustained $800 lift). The model should detect massive significant lift."
            expected="Expected: large / highly significant effect"
            loading={loadingSample === 'true'}
            onClick={() => handleSample('true')}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SampleCard({
  kind,
  title,
  tagline,
  icon,
  description,
  expected,
  loading,
  onClick,
}: {
  kind: 'fake' | 'true';
  title: string;
  tagline: string;
  icon: React.ReactNode;
  description: string;
  expected: string;
  loading: boolean;
  onClick: () => void;
}) {
  const accent = kind === 'fake' ? 'text-chart-5' : 'text-chart-2';
  const ringGlow = kind === 'true' ? 'hover:shadow-[0_0_30px_-10px_var(--chart-1)]' : 'hover:shadow-[0_0_30px_-10px_var(--chart-5)]';
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`group relative flex flex-col gap-2 overflow-hidden rounded-lg border border-border/60 bg-card/40 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${ringGlow}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`transition-transform group-hover:scale-110 ${accent}`}>{icon}</span>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
          {loading ? 'loading…' : 'load →'}
        </span>
      </div>
      <div className="relative text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {tagline}
      </div>
      <p className="relative text-xs leading-relaxed text-muted-foreground">{description}</p>
      <div className={`relative mt-1 text-[11px] font-medium ${accent}`}>{expected}</div>
    </button>
  );
}

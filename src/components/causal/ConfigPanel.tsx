'use client';

import * as React from 'react';
import { Settings2, Calendar, Hash, Target, Layers, Play, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { ParsedCsv } from '@/lib/causal-types';
import {
  detectDateColumn,
  detectNumericColumns,
  detectTargetColumn,
  getAllDateValues,
} from '@/lib/csv-utils';

interface ConfigPanelProps {
  parsed: ParsedCsv;
  onRun: (config: {
    dateCol: string;
    targetCol: string;
    covariateCols: string[];
    interventionDate: string;
  }) => void;
  isAnalyzing: boolean;
  error: string | null;
}

export function ConfigPanel({ parsed, onRun, isAnalyzing, error }: ConfigPanelProps) {
  const numericCols = React.useMemo(() => detectNumericColumns(parsed), [parsed]);
  const allCols = parsed.columns;

  const defaultDateCol = React.useMemo(() => detectDateColumn(parsed), [parsed]);
  const defaultTarget = React.useMemo(
    () => detectTargetColumn(parsed, numericCols),
    [parsed, numericCols]
  );

  const [dateCol, setDateCol] = React.useState<string>(defaultDateCol ?? '');
  const [targetCol, setTargetCol] = React.useState<string>(defaultTarget ?? '');
  const [covariateCols, setCovariateCols] = React.useState<string[]>([]);
  const [interventionDate, setInterventionDate] = React.useState<string>('');

  // Initialize defaults when parsed data changes
  React.useEffect(() => {
    const dCol = detectDateColumn(parsed);
    const numCols = detectNumericColumns(parsed);
    const tCol = detectTargetColumn(parsed, numCols);
    setDateCol(dCol ?? '');
    setTargetCol(tCol ?? '');
    setCovariateCols([]);
    // Suggest intervention date: ~70% of the way through the data
    if (dCol) {
      const range = getAllDateValues(parsed, dCol);
      if (range) {
        const values = range.values;
        const idx = Math.floor(values.length * 0.7);
        setInterventionDate(values[idx]);
      }
    } else {
      setInterventionDate('');
    }
  }, [parsed]);

  // Re-sync intervention date when dateCol changes
  React.useEffect(() => {
    if (!dateCol) return;
    const range = getAllDateValues(parsed, dateCol);
    if (range) {
      const values = range.values;
      const idx = Math.floor(values.length * 0.7);
      const suggested = values[idx];
      // Only overwrite if not set or out of range
      if (!interventionDate || interventionDate < range.min || interventionDate > range.max) {
        setInterventionDate(suggested);
      }
    }
  }, [dateCol, parsed, interventionDate]);

  const dateRange = React.useMemo(
    () => (dateCol ? getAllDateValues(parsed, dateCol) : null),
    [parsed, dateCol]
  );

  const toggleCovariate = (col: string) => {
    setCovariateCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const canRun =
    !!dateCol &&
    !!targetCol &&
    !!interventionDate &&
    dateCol !== targetCol &&
    !isAnalyzing &&
    (!!dateRange
      ? interventionDate >= dateRange.min && interventionDate <= dateRange.max
      : true);

  const handleRun = () => {
    if (!canRun) return;
    onRun({ dateCol, targetCol, covariateCols, interventionDate });
  };

  return (
    <Card className="card-gradient border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4 text-primary" />
          Analysis Configuration
        </CardTitle>
        <CardDescription className="text-sm">
          Map your columns and pick the day your intervention started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Date column */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
            <Calendar className="h-3 w-3" />
            Date Column
          </Label>
          <Select value={dateCol} onValueChange={setDateCol}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pick a date column" />
            </SelectTrigger>
            <SelectContent>
              {allCols.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target column */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
            <Target className="h-3 w-3" />
            Target Variable (Y)
          </Label>
          <Select value={targetCol} onValueChange={setTargetCol}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pick the metric to analyze" />
            </SelectTrigger>
            <SelectContent>
              {numericCols.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Covariates (multi-select via toggle chips) */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
            <Layers className="h-3 w-3" />
            Covariates / Controls (optional)
          </Label>
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-2.5 min-h-[44px]">
            {numericCols.filter((c) => c !== targetCol).length === 0 && (
              <span className="text-xs text-muted-foreground p-1">No other numeric columns available</span>
            )}
            {numericCols
              .filter((c) => c !== targetCol)
              .map((c) => {
                const selected = covariateCols.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCovariate(c)}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {selected && <Hash className="h-3 w-3" />}
                    {c}
                  </button>
                );
              })}
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Covariates should be control series unaffected by the intervention (e.g., a peer product's sales, weather).{' '}
            <strong className="text-foreground/80">Do not</strong> include the treatment variable itself (e.g., marketing_spend if that is your intervention).
          </p>
        </div>

        {/* Intervention date */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
            <Calendar className="h-3 w-3" />
            Intervention Date
          </Label>
          <Input
            type="date"
            value={interventionDate}
            min={dateRange?.min}
            max={dateRange?.max}
            onChange={(e) => setInterventionDate(e.target.value)}
            className="w-full"
          />
          {dateRange && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Range: {dateRange.min} → {dateRange.max}</span>
              {interventionDate && (
                <span>
                  Pre-period: {dateRange.min} →{' '}
                  {new Date(new Date(interventionDate).getTime() - 86400000)
                    .toISOString()
                    .split('T')[0]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            <div className="flex-1">
              <div className="font-medium text-destructive">Analysis failed</div>
              <pre className="mt-1 whitespace-pre-wrap text-[11px] leading-relaxed text-destructive/80">
                {error}
              </pre>
            </div>
          </div>
        )}

        {/* Run button */}
        <Button
          onClick={handleRun}
          disabled={!canRun}
          className="w-full gap-2"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running Bayesian analysis…
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Causal Analysis
            </>
          )}
        </Button>

        {!canRun && !isAnalyzing && (
          <p className="text-center text-[11px] text-muted-foreground">
            {!dateCol || !targetCol
              ? 'Select a date column and target variable to continue.'
              : !interventionDate
              ? 'Pick an intervention date within your data range.'
              : dateCol === targetCol
              ? 'Date column and target must be different.'
              : 'Intervention date must be within your data range.'}
          </p>
        )}

        {isAnalyzing && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">Building counterfactual…</div>
            The Bayesian Structural Time-Series model is fitting a state-space model on your pre-intervention data, then projecting forward. This typically takes 2–10 seconds.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

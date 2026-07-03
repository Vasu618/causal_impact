'use client';

import * as React from 'react';
import { Download, FileText, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import type { AnalysisResponse } from '@/lib/causal-types';

interface ExportButtonsProps {
  result: AnalysisResponse;
}

export function ExportButtons({ result }: ExportButtonsProps) {
  const downloadTxt = () => {
    const lines: string[] = [];
    lines.push('CAUSAL IMPACT ANALYSIS — FULL REPORT');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Intervention Date : ${result.intervention_date}`);
    lines.push(`Pre-Period        : ${result.pre_period[0]} → ${result.pre_period[1]}`);
    lines.push(`Post-Period       : ${result.post_period[0]} → ${result.post_period[1]}`);
    lines.push('');
    lines.push('KEY METRICS');
    lines.push('-'.repeat(60));
    lines.push(`Average Effect   : ${result.metrics.average_effect.toFixed(4)}`);
    lines.push(`Cumulative Effect: ${result.metrics.cumulative_effect.toFixed(4)}`);
    lines.push(`P-Value          : ${result.metrics.p_value.toFixed(6)}`);
    lines.push(`Relative Effect  : ${(result.metrics.relative_effect * 100).toFixed(4)}%`);
    lines.push('');
    lines.push('EXECUTIVE SUMMARY');
    lines.push('-'.repeat(60));
    lines.push(result.summary_text);
    lines.push('');
    lines.push('DETAILED REPORT');
    lines.push('-'.repeat(60));
    lines.push(result.report_text);
    lines.push('');
    lines.push('DAILY RESULTS (first 10 rows shown, full data in CSV export)');
    lines.push('-'.repeat(60));
    lines.push('date,actual,predicted,point_effect,lower_effect,upper_effect');
    for (const r of result.results.slice(0, 10)) {
      lines.push(
        [
          r.date,
          r.actual ?? '',
          r.predicted ?? '',
          r.point_effect ?? '',
          r.lower_effect ?? '',
          r.upper_effect ?? '',
        ].join(',')
      );
    }
    lines.push('...');
    lines.push('');
    lines.push(`Generated at: ${new Date().toISOString()}`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `causal_report_${result.intervention_date}.txt`);
    toast.success('Report exported as .txt');
  };

  const downloadCsv = () => {
    const header = 'date,actual,predicted,point_effect,lower_effect,upper_effect';
    const rows = result.results.map((r) =>
      [
        r.date,
        r.actual ?? '',
        r.predicted ?? '',
        r.point_effect ?? '',
        r.lower_effect ?? '',
        r.upper_effect ?? '',
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, `causal_predictions_${result.intervention_date}.csv`);
    toast.success('Predictions exported as .csv');
  };

  return (
    <Card className="card-gradient border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="h-4 w-4 text-primary" />
          Export
        </CardTitle>
        <CardDescription className="text-sm">
          Download the full textual report or the per-day predictions and effects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={downloadTxt}
            variant="outline"
            className="h-auto justify-start gap-3 py-3"
          >
            <FileText className="h-5 w-5 flex-shrink-0 text-primary" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Download Report</span>
              <span className="text-[11px] text-muted-foreground">Full text summary (.txt)</span>
            </div>
          </Button>
          <Button
            onClick={downloadCsv}
            variant="outline"
            className="h-auto justify-start gap-3 py-3"
          >
            <Table2 className="h-5 w-5 flex-shrink-0 text-primary" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Download Predictions</span>
              <span className="text-[11px] text-muted-foreground">Daily data &amp; effects (.csv)</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

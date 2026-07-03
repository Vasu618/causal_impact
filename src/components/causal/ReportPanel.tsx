'use client';

import * as React from 'react';
import { FileText, ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AnalysisResponse } from '@/lib/causal-types';

interface ReportPanelProps {
  result: AnalysisResponse;
}

export function ReportPanel({ result }: ReportPanelProps) {
  return (
    <Card className="card-gradient border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-primary" />
          Summary Report
        </CardTitle>
        <CardDescription className="text-sm">
          Auto-generated executive summary and detailed statistical report from the Bayesian model.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="summary" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Executive Summary
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-1.5 text-xs">
              <ScrollText className="h-3.5 w-3.5" />
              Detailed Report
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="mt-4">
            <pre className="text-mono whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/30 p-4 text-xs leading-relaxed text-foreground/90 scroll-thin max-h-[360px] overflow-y-auto">
              {result.summary_text}
            </pre>
          </TabsContent>
          <TabsContent value="report" className="mt-4">
            <pre className="text-mono whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/30 p-4 text-xs leading-relaxed text-foreground/90 scroll-thin max-h-[480px] overflow-y-auto">
              {result.report_text}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

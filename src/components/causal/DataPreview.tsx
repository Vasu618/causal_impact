'use client';

import * as React from 'react';
import { Table2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ParsedCsv } from '@/lib/causal-types';

interface DataPreviewProps {
  parsed: ParsedCsv;
}

export function DataPreview({ parsed }: DataPreviewProps) {
  const previewRows = React.useMemo(() => parsed.rows.slice(0, 5), [parsed.rows]);

  return (
    <Card className="card-gradient border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Table2 className="h-4 w-4 text-primary" />
          Data Preview
        </CardTitle>
        <CardDescription className="text-sm">
          First 5 rows of <span className="font-medium text-foreground">{parsed.fileName}</span> ·{' '}
          {parsed.rowCount.toLocaleString()} total rows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border/60 scroll-thin">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {parsed.columns.map((col) => (
                  <th
                    key={col}
                    className="border-b border-border/60 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/30">
                  {parsed.columns.map((col) => {
                    const v = row[col];
                    const isNum = typeof v === 'number';
                    return (
                      <td
                        key={col}
                        className={`px-3 py-2 text-xs ${
                          isNum ? 'text-mono text-right tabular-nums' : 'text-left'
                        }`}
                      >
                        {v === null || v === undefined ? (
                          <span className="text-muted-foreground/50">—</span>
                        ) : isNum ? (
                          v.toLocaleString()
                        ) : (
                          String(v)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-medium uppercase tracking-wider">Columns:</span>
          {parsed.columns.map((c) => {
            const isNumeric = typeof parsed.rows[0]?.[c] === 'number';
            return (
              <Badge
                key={c}
                variant="outline"
                className={`text-[10px] font-normal ${
                  isNumeric ? 'border-chart-2/40 text-chart-2' : 'border-chart-4/40 text-chart-4'
                }`}
              >
                {c} · {isNumeric ? 'numeric' : 'text'}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

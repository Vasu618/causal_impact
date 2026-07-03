'use client';

import * as React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AnalysisResponse } from '@/lib/causal-types';

interface CausalImpactChartProps {
  result: AnalysisResponse;
}

export function CausalImpactChart({ result }: CausalImpactChartProps) {
  const { results, intervention_date, pre_period, post_period } = result;

  // Build chart data — we use predicted + CI bands for the post period only
  const chartData = React.useMemo(() => {
    return results.map((r) => {
      // Reconstruct predicted upper/lower for visualization
      // point_effect = actual - predicted, so predicted = actual - point_effect
      // effect bounds: lower_effect, upper_effect are bounds ON the effect
      // predicted_lower = predicted + lower_effect; predicted_upper = predicted + upper_effect
      const predicted = r.predicted;
      const lower = r.lower_effect !== null && predicted !== null
        ? predicted + r.lower_effect
        : null;
      const upper = r.upper_effect !== null && predicted !== null
        ? predicted + r.upper_effect
        : null;
      return {
        date: r.date,
        actual: r.actual,
        predicted,
        lower,
        upper,
      };
    });
  }, [results]);

  // For showing only post-period CI, we'd need to track which rows are post
  // But for visual clarity we just plot CI as a band where available
  const interventionTs = intervention_date;
  const dateAxisTickFormatter = (val: string) => {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const tooltipFormatter = (value: unknown, name: string): [string, string] => {
    if (value === undefined || value === null || typeof value === 'number' && Number.isNaN(value)) return ['—', name];
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return [String(value), name];
    return [`$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, name];
  };

  return (
    <Card className="card-gradient border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LineChartIcon className="h-4 w-4 text-primary" />
          Causal Impact — Actual vs Counterfactual
        </CardTitle>
        <CardDescription className="text-sm">
          The dashed line is what the model predicts would have happened without the intervention. The gap between actual (solid) and predicted (dashed) in the post-period is your causal effect.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="ciBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                tickFormatter={dateAxisTickFormatter}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                minTickGap={50}
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={70}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--popover-foreground)',
                }}
                labelStyle={{ color: 'var(--muted-foreground)', fontSize: 11 }}
                formatter={tooltipFormatter}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return Number.isNaN(d.getTime())
                    ? label
                    : d.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      });
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="line"
              />
              <ReferenceLine
                x={interventionTs}
                stroke="var(--chart-5)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: 'Intervention',
                  position: 'insideTopRight',
                  fill: 'var(--chart-5)',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              {/* CI band (post-period) */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="url(#ciBand)"
                fillOpacity={1}
                name="95% CI (upper)"
                legendType="none"
                connectNulls={false}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="var(--background)"
                fillOpacity={1}
                name="95% CI (lower)"
                legendType="none"
                connectNulls={false}
                isAnimationActive={false}
              />
              {/* Predicted (counterfactual) line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="var(--chart-5)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                name="Predicted (counterfactual)"
                isAnimationActive={true}
                animationDuration={600}
              />
              {/* Actual line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--chart-1)"
                strokeWidth={2.2}
                dot={false}
                name="Actual"
                isAnimationActive={true}
                animationDuration={600}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
          <span>
            Pre-period: <span className="text-mono text-foreground">{pre_period[0]}</span> →{' '}
            <span className="text-mono text-foreground">{pre_period[1]}</span>
          </span>
          <span>
            Post-period: <span className="text-mono text-foreground">{post_period[0]}</span> →{' '}
            <span className="text-mono text-foreground">{post_period[1]}</span>
          </span>
          <span>
            Intervention: <span className="text-mono text-chart-5">{intervention_date}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

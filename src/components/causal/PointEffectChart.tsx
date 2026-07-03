'use client';

import * as React from 'react';
import {
  ComposedChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AnalysisResponse } from '@/lib/causal-types';

interface PointEffectChartProps {
  result: AnalysisResponse;
}

export function PointEffectChart({ result }: PointEffectChartProps) {
  const { results, post_period } = result;

  // Filter to post-period only
  const postData = React.useMemo(() => {
    return results
      .filter((r) => r.date >= post_period[0])
      .map((r) => ({
        date: r.date,
        effect: r.point_effect,
        lower: r.lower_effect,
        upper: r.upper_effect,
      }));
  }, [results, post_period]);

  const dateAxisTickFormatter = (val: string) => {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const tooltipFormatter = (value: number | undefined, name: string) => {
    if (value === undefined || value === null || Number.isNaN(value))
      return ['—', name];
    const label =
      name === 'effect'
        ? 'Daily Effect'
        : name === 'lower'
        ? 'CI Lower'
        : name === 'upper'
        ? 'CI Upper'
        : name;
    return [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, label];
  };

  return (
    <Card className="card-gradient border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          Daily Point Effects (Post-Intervention)
        </CardTitle>
        <CardDescription className="text-sm">
          Each bar is the daily causal effect (actual − predicted). Positive bars mean the campaign lifted sales that day; negative bars mean it underperformed the counterfactual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={postData}
              margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="effectPosBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.05} />
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
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
              <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeWidth={1} />
              {/* CI band */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="url(#effectPosBand)"
                fillOpacity={1}
                name="95% CI upper"
                connectNulls
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="var(--background)"
                fillOpacity={1}
                name="95% CI lower"
                connectNulls
                isAnimationActive={false}
              />
              {/* Effect bars — color depends on sign */}
              <Bar
                dataKey="effect"
                name="Daily Effect"
                isAnimationActive={true}
                animationDuration={600}
                radius={[2, 2, 0, 0]}
              >
                {postData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.effect >= 0 ? 'var(--chart-2)' : 'var(--chart-5)'} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

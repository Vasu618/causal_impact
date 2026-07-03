'use client';

import * as React from 'react';

/**
 * Causal Impact — Counterfactual Engine
 *
 * Logo concept: a bar chart with an upward-trending line and arrowhead,
 * representing data growth, analytics, and positive causal impact.
 * No badge/container — the icon blends directly with the UI background.
 *
 * Flat only — no gradients, no shadows.
 */

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoVariant = 'full' | 'icon';

interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  className?: string;
  showWordmark?: boolean;
}

const BADGE_SIZE: Record<LogoSize, number> = {
  sm: 24,
  md: 28,
  lg: 34,
  xl: 44,
};

// Primary green — matches the app's --primary chartreuse-green
const GREEN = '#16A34A';

/**
 * The icon mark — standalone bar chart with trending line + arrow.
 * No badge; sits directly on the UI background. Uses a 32×32 viewBox.
 */
export function LogoIcon({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  // Bar geometry — 5 bars of increasing height, centered horizontally
  const barW = 3.2;
  const barGap = 2.4;
  const totalBarsW = 5 * barW + 4 * barGap; // = 25.6
  const barsStartX = (32 - totalBarsW) / 2; // = 3.2
  const barBottom = 27;

  // Bar heights — increasing trend with slight variance (like real data)
  const barHeights = [7, 10, 8.5, 13, 17];

  // Bar x positions (left edge) and center-x for the trend line
  const bars = barHeights.map((h, i) => {
    const x = barsStartX + i * (barW + barGap);
    const y = barBottom - h;
    return { x, y, w: barW, h, cx: x + barW / 2 };
  });

  // Trend line connects the tops of the bars, then extends to the arrow
  const lineStroke = 2;
  const arrowSize = 4;

  // Build the trend line path: from first bar top through each bar top,
  // then extend past the last bar to the arrow tip
  const lastBar = bars[bars.length - 1];
  const arrowTipX = lastBar.cx + 4.5;
  const arrowTipY = lastBar.y - 4.5;

  const linePath = [
    `M ${bars[0].cx} ${bars[0].y}`,
    ...bars.slice(1).map((b) => `L ${b.cx} ${b.y}`),
    `L ${arrowTipX} ${arrowTipY}`,
  ].join(' ');

  // Arrowhead — a filled triangle at the tip, pointing up-right
  const dx = arrowTipX - lastBar.cx;
  const dy = arrowTipY - lastBar.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  const baseX = arrowTipX - ux * arrowSize;
  const baseY = arrowTipY - uy * arrowSize;
  const halfW = arrowSize * 0.6;
  const arrowPath = [
    `M ${arrowTipX} ${arrowTipY}`,
    `L ${baseX + px * halfW} ${baseY + py * halfW}`,
    `L ${baseX - px * halfW} ${baseY - py * halfW}`,
    'Z',
  ].join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Causal Impact logo"
    >
      {/* Bar chart — 5 increasing bars */}
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx={0.6}
          fill={GREEN}
        />
      ))}

      {/* Trend line connecting bar tops */}
      <path
        d={linePath}
        stroke={GREEN}
        strokeWidth={lineStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Arrowhead at the end of the trend line */}
      <path d={arrowPath} fill={GREEN} />
    </svg>
  );
}

/**
 * Wordmark — "Causal Impact" bold + "COUNTERFACTUAL ENGINE" muted uppercase.
 * Uses the Geist font family already loaded by the app.
 */
export function LogoWordmark({
  size = 'md',
  className,
}: {
  size?: LogoSize;
  className?: string;
}) {
  const titleSize: Record<LogoSize, string> = {
    sm: 'text-[12px]',
    md: 'text-[13px]',
    lg: 'text-[15px]',
    xl: 'text-[18px]',
  };
  const subSize: Record<LogoSize, string> = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-[12px]',
  };

  return (
    <span className={`flex flex-col leading-tight ${className ?? ''}`}>
      <span className={`${titleSize[size]} font-bold tracking-tight text-foreground`}>
        Causal Impact
      </span>
      <span
        className={`${subSize[size]} font-medium uppercase tracking-[0.18em] text-muted-foreground`}
      >
        Counterfactual Engine
      </span>
    </span>
  );
}

/**
 * Full logo — icon + wordmark, with consistent spacing.
 */
export function Logo({
  size = 'md',
  variant = 'full',
  className,
  showWordmark = true,
}: LogoProps) {
  const badgePx = BADGE_SIZE[size];

  if (variant === 'icon' || !showWordmark) {
    return <LogoIcon size={badgePx} className={className} />;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <LogoIcon size={badgePx} />
      <LogoWordmark size={size} />
    </span>
  );
}


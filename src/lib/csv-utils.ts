// CSV parsing & data type detection utilities

import Papa from 'papaparse';
import type { ParsedCsv, DataRow } from './causal-types';

export function parseCsvText(text: string, fileName: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (h) => h.trim(),
  });

  const columns = result.meta.fields ?? [];
  const rawRows = (result.data as Record<string, string>[]).filter(
    (r) => r && Object.values(r).some((v) => v !== undefined && v !== '')
  );

  // Build typed rows for preview
  const rows: DataRow[] = rawRows.map((r) => {
    const typed: DataRow = {};
    for (const c of columns) {
      const v = r[c];
      if (v === undefined || v === null || v === '') {
        typed[c] = null;
        continue;
      }
      // Try numeric
      const num = Number(v);
      if (!Number.isNaN(num) && v.trim() !== '') {
        typed[c] = num;
      } else {
        typed[c] = v;
      }
    }
    return typed;
  });

  return {
    columns,
    rows,
    rawRows,
    rowCount: rows.length,
    fileName,
  };
}

export function detectDateColumn(parsed: ParsedCsv): string | null {
  // Heuristic: column whose name contains "date" or "time", or first column with parseable dates
  const dateNameMatch = parsed.columns.find((c) =>
    /date|time|day|week|month/i.test(c)
  );
  if (dateNameMatch) return dateNameMatch;

  // Fallback: scan first non-empty column
  for (const col of parsed.columns) {
    const samples = parsed.rows.slice(0, 10).map((r) => r[col]).filter(Boolean);
    if (samples.length === 0) continue;
    const dateLike = samples.filter((s) => {
      if (typeof s !== 'string') return false;
      const d = new Date(s);
      return !Number.isNaN(d.getTime());
    });
    if (dateLike.length / samples.length > 0.8) return col;
  }
  return null;
}

export function detectNumericColumns(parsed: ParsedCsv): string[] {
  const numeric: string[] = [];
  for (const col of parsed.columns) {
    const samples = parsed.rows.slice(0, 50).map((r) => r[col]);
    const numCount = samples.filter((s) => typeof s === 'number').length;
    if (numCount / Math.max(samples.length, 1) > 0.7) {
      numeric.push(col);
    }
  }
  return numeric;
}

export function detectTargetColumn(parsed: ParsedCsv, numericCols: string[]): string | null {
  // Prefer columns with names like sales, revenue, conversions, traffic, etc.
  const targetPatterns = [/sales/i, /revenue/i, /conversion/i, /traffic/i, /visit/i, /order/i, /signup/i, /user/i, /metric/i];
  for (const p of targetPatterns) {
    const match = numericCols.find((c) => p.test(c));
    if (match) return match;
  }
  return numericCols[0] ?? null;
}

export function getAllDateValues(
  parsed: ParsedCsv,
  dateCol: string
): { min: string; max: string; values: string[] } | null {
  if (!dateCol) return null;
  const values: string[] = [];
  for (const r of parsed.rows) {
    const v = r[dateCol];
    if (v === null || v === undefined) continue;
    const d = new Date(String(v));
    if (!Number.isNaN(d.getTime())) {
      values.push(d.toISOString().split('T')[0]);
    }
  }
  if (values.length === 0) return null;
  values.sort();
  return { min: values[0], max: values[values.length - 1], values };
}

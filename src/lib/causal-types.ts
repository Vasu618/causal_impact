// Shared types for the Causal Impact Platform

export type CellValue = string | number | null | undefined;
export type DataRow = Record<string, CellValue>;

export interface ParsedCsv {
  columns: string[];
  rows: DataRow[];
  rawRows: Record<string, string>[];
  rowCount: number;
  fileName: string;
}

export interface AnalysisMetrics {
  average_effect: number;
  cumulative_effect: number;
  p_value: number;
  relative_effect: number;
}

export interface AnalysisResultPoint {
  date: string;
  actual: number | null;
  predicted: number | null;
  point_effect: number | null;
  lower_effect: number | null;
  upper_effect: number | null;
}

export interface AnalysisResponse {
  metrics: AnalysisMetrics;
  summary_text: string;
  report_text: string;
  results: AnalysisResultPoint[];
  pre_period: [string, string];
  post_period: [string, string];
  intervention_date: string;
}

export interface AnalysisRequest {
  rows: Record<string, string | number>[];
  intervention_date: string;
  target_col: string;
  date_col: string;
  covariate_cols: string[];
}

export type AnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error';

export interface AnalysisState {
  status: AnalysisStatus;
  result: AnalysisResponse | null;
  error: string | null;
  startedAt: number | null;
  durationMs: number | null;
}

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Resolve the Python binary — use env var if set (Docker/production),
// otherwise try common paths (dev sandbox, system Python)
const PYTHON_BIN =
  process.env.PYTHON_BIN ||
  process.env.PYTHON_PATH ||
  (process.env.NODE_ENV === 'production'
    ? 'python3'
    : '/home/z/.venv/bin/python3');
const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'run_analysis.py');

interface AnalysisPayload {
  rows: Record<string, string | number>[];
  intervention_date: string;
  target_col: string;
  date_col: string;
  covariate_cols?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const payload: AnalysisPayload = await req.json();

    // Basic validation
    if (!payload || !Array.isArray(payload.rows) || payload.rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided.' }, { status: 400 });
    }
    if (!payload.intervention_date) {
      return NextResponse.json({ error: 'Intervention date is required.' }, { status: 400 });
    }
    if (!payload.target_col) {
      return NextResponse.json({ error: 'Target column is required.' }, { status: 400 });
    }
    if (!payload.date_col) {
      return NextResponse.json({ error: 'Date column is required.' }, { status: 400 });
    }

    // Cap data size to prevent OOM
    const MAX_ROWS = 5000;
    if (payload.rows.length > MAX_ROWS) {
      payload.rows = payload.rows.slice(0, MAX_ROWS);
    }

    const payloadJson = JSON.stringify(payload);

    const result = await new Promise<{ stdout: string; stderr: string; code: number }>(
      (resolve) => {
        const proc = spawn(PYTHON_BIN, [SCRIPT_PATH], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONDONTWRITEBYTECODE: '1' },
        });

        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (d) => (stdout += d.toString()));
        proc.stderr.on('data', (d) => (stderr += d.toString()));
        proc.on('close', (code) => resolve({ stdout, stderr, code: code ?? 1 }));

        proc.stdin.write(payloadJson);
        proc.stdin.end();
      }
    );

    if (result.code !== 0) {
      // Try to parse error from stdout (our script writes JSON to stdout)
      try {
        const errObj = JSON.parse(result.stdout);
        if (errObj.error) {
          return NextResponse.json(
            { error: errObj.error, detail: errObj.traceback?.split('\n').slice(-8).join('\n') },
            { status: 500 }
          );
        }
      } catch {
        /* not JSON, fall through */
      }
      return NextResponse.json(
        { error: 'Python analysis failed.', detail: result.stderr || result.stdout || 'Unknown error' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(result.stdout);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Server error', detail: message }, { status: 500 });
  }
}

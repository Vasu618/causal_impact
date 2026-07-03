"""CLI runner for causal analysis.

Reads a JSON payload from stdin with the structure:
{
    "rows": [{"date": "2023-01-01", "sales": 1000, "marketing_spend": 30}, ...],
    "intervention_date": "2024-12-01",
    "target_col": "sales",
    "date_col": "date",
    "covariate_cols": ["marketing_spend"]  // optional
}

Writes a JSON response to stdout with:
{
    "metrics": {...},
    "summary_text": "...",
    "report_text": "...",
    "results": [{"date": "...", "actual": ..., "predicted": ..., "point_effect": ..., "lower_effect": ..., "upper_effect": ...}, ...],
    "pre_period": ["...", "..."],
    "post_period": ["...", "..."],
    "intervention_date": "..."
}

On error, writes {"error": "..."} and exits with code 1.
"""

import sys
import json
import os
import math
import warnings
import traceback

# Suppress warnings for clean JSON output
warnings.filterwarnings("ignore")

# Add parent dir to path so we can import causal_engine
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from causal_engine import run_causal_analysis, get_key_metrics  # noqa: E402


def serialize_timestamp(ts):
    """Safely serialize a pandas Timestamp to ISO string."""
    try:
        return pd.Timestamp(ts).strftime('%Y-%m-%d')
    except Exception:
        return str(ts)


def main():
    try:
        # Read JSON from stdin
        raw = sys.stdin.read()
        if not raw.strip():
            print(json.dumps({"error": "No input data received on stdin"}))
            sys.exit(1)

        payload = json.loads(raw)
        rows = payload.get("rows")
        intervention_date = payload.get("intervention_date")
        target_col = payload.get("target_col")
        date_col = payload.get("date_col")
        covariate_cols = payload.get("covariate_cols") or None

        if not rows or not intervention_date or not target_col or not date_col:
            print(json.dumps({"error": "Missing required fields: rows, intervention_date, target_col, date_col"}))
            sys.exit(1)

        # Build DataFrame
        import pandas as pd
        df = pd.DataFrame(rows)

        # Validate columns exist
        missing = [c for c in [target_col, date_col] if c not in df.columns]
        if missing:
            print(json.dumps({"error": f"Missing columns in data: {missing}"}))
            sys.exit(1)
        if covariate_cols:
            missing_cov = [c for c in covariate_cols if c not in df.columns]
            if missing_cov:
                print(json.dumps({"error": f"Missing covariate columns: {missing_cov}"}))
                sys.exit(1)

        # Run analysis
        result = run_causal_analysis(
            dataframe=df,
            intervention_date=intervention_date,
            target_col=target_col,
            date_col=date_col,
            covariate_cols=covariate_cols,
        )

        # Extract metrics
        metrics = get_key_metrics(result['summary_data'], p_value=result['p_value'])

        # Serialize results DataFrame to list of dicts
        results_df = result['results_df'].copy()
        # Convert dates to ISO strings
        results_df['date'] = results_df['date'].apply(
            lambda x: x.strftime('%Y-%m-%d') if hasattr(x, 'strftime') else str(x)
        )
        # Convert numpy values to Python natives, NaN -> None
        results_records = results_df.where(results_df.notna(), None).to_dict(orient='records')

        # Round numeric values for cleaner JSON, ensure no NaN/Inf survive
        for rec in results_records:
            for k, v in rec.items():
                if isinstance(v, float):
                    if math.isnan(v) or math.isinf(v):
                        rec[k] = None
                    else:
                        rec[k] = round(v, 4)
                elif isinstance(v, (int,)):
                    rec[k] = v
                # numpy ints/floats already converted by to_dict

        # Round metrics
        for k, v in metrics.items():
            if isinstance(v, float):
                if math.isnan(v) or math.isinf(v):
                    metrics[k] = None
                else:
                    metrics[k] = round(v, 6)

        response = {
            "metrics": metrics,
            "summary_text": str(result['summary_text']),
            "report_text": str(result['report_text']),
            "results": results_records,
            "pre_period": [serialize_timestamp(result['pre_period'][0]),
                           serialize_timestamp(result['pre_period'][1])],
            "post_period": [serialize_timestamp(result['post_period'][0]),
                            serialize_timestamp(result['post_period'][1])],
            "intervention_date": serialize_timestamp(intervention_date),
        }

        # Use allow_nan=False to ensure no NaN leaks into JSON output
        print(json.dumps(response, allow_nan=False))

    except Exception as e:
        tb = traceback.format_exc()
        print(json.dumps({"error": f"{type(e).__name__}: {str(e)}", "traceback": tb}))
        sys.exit(1)


if __name__ == "__main__":
    import pandas as pd  # noqa: F811 - imported here to ensure available in scope
    main()

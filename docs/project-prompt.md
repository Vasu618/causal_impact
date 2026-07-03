# Causal Impact Platform — Full Project Prompt

> Use this prompt in any LLM to rebuild the interactive dashboard using a framework other than Streamlit (e.g., Flask + vanilla JS, FastAPI + React, Dash, etc.)

---

## Project Overview

Build an **Automated Causal Inference & A/B Testing Platform** — a web-based interactive dashboard that lets users upload time-series CSV data, specify an intervention date, and run **Bayesian Structural Time-Series** analysis (Google's CausalImpact methodology) to determine whether a marketing campaign or business intervention actually *caused* a measurable change in a target metric, or if the change was just organic trends/seasonality.

The core question the platform answers: **"What would have happened if the intervention never occurred?"**

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Dashboard)            │
│  - CSV upload (drag & drop)                      │
│  - Column selection (date, target, covariates)   │
│  - Intervention date picker                      │
│  - Results: charts, metrics, downloadable report │
└──────────────────────┬──────────────────────────┘
                       │ HTTP API
┌──────────────────────▼──────────────────────────┐
│              Backend API Layer                   │
│  - Receives CSV + parameters                     │
│  - Calls causal_engine.py                        │
│  - Returns JSON results + chart data             │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│           causal_engine.py (Core Logic)          │
│  - Uses pycausalimpact (statsmodels-based)       │
│  - Builds synthetic control / counterfactual     │
│  - Returns predictions, effects, p-value, report │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│           data_generator.py (Test Data)          │
│  - Generates 2 synthetic CSVs (1000 rows each)  │
│  - Scenario A: Fake Success (zero real impact)   │
│  - Scenario B: True Success (real campaign lift) │
└─────────────────────────────────────────────────┘
```

---

## The Two Test Scenarios (Pre-built Datasets)

### Scenario A — Fake Success (`fake_success.csv`)
- **1000 daily rows** starting from 2023-01-01
- **Columns:** `date`, `sales`, `marketing_spend`
- **Intervention day:** Row 700 (date: 2024-12-01)
- **Behavior:** Sales have a strong upward seasonal trend (`np.linspace(1000, 2000, 1000)`) plus weekly and monthly seasonality. Marketing spend starts at intervention day but has **ZERO causal effect** on sales. The sales were going to rise regardless.
- **Expected result from the algorithm:** The model should detect that the trend was organic. Average causal effect should be near zero or statistically insignificant.

### Scenario B — True Success (`true_success.csv`)
- **1000 daily rows** starting from 2023-01-01
- **Columns:** `date`, `sales`, `marketing_spend`
- **Intervention day:** Row 700 (date: 2024-12-01)
- **Behavior:** Sales have a flat baseline (~1000/day) with mild weekly seasonality. At the intervention day, an immediate jump of ~$2000/day occurs (exponentially decaying initial spike of $1200 + sustained lift of $800). Marketing spend jumps from ~$30/day to ~$4000/day.
- **Expected result from the algorithm:** The model should detect a massive, statistically significant causal lift of ~$800-2000/day, with p-value near 0.

---

## Core Engine — `causal_engine.py`

This is the **backend brain** of the platform. It is fully decoupled from any UI framework. Here is the exact working code:

```python
"""Causal Inference Engine Module.

Core logic for running Bayesian Structural Time-Series analysis
using pycausalimpact (statsmodels-based implementation of Google's CausalImpact).
"""

import pandas as pd
import numpy as np
from causalimpact import CausalImpact


def run_causal_analysis(dataframe, intervention_date, target_col, date_col, covariate_cols=None):
    """Run causal impact analysis on time series data.
    
    Args:
        dataframe: DataFrame with date, target, and optional covariates
        intervention_date: Date when intervention started (string like '2024-12-01', or Timestamp)
        target_col: Name of the target/response column (Y), e.g. 'sales'
        date_col: Name of the date column, e.g. 'date'
        covariate_cols: Optional list of covariate column names (X), e.g. ['marketing_spend']
    
    Returns:
        dict containing:
            - 'ci': CausalImpact object
            - 'summary_data': DataFrame with key metrics (average/cumulative effects)
            - 'summary_text': Executive summary text
            - 'report_text': Detailed report text
            - 'results_df': DataFrame with daily predictions and effects
            - 'pre_period': Pre-period dates [start, end]
            - 'post_period': Post-period dates [start, end]
            - 'p_value': Bayesian p-value
    """
    df = dataframe.copy()
    df[date_col] = pd.to_datetime(df[date_col])
    df = df.sort_values(date_col).reset_index(drop=True)
    
    intervention_ts = pd.Timestamp(intervention_date)
    
    # Define pre and post periods
    pre_period = [df[date_col].min(), intervention_ts - pd.Timedelta(days=1)]
    post_period = [intervention_ts, df[date_col].max()]
    
    # Prepare data matrix for CausalImpact - MUST contain only numeric columns
    numeric_cols = [target_col]
    if covariate_cols:
        numeric_cols += covariate_cols
    data = df[numeric_cols].copy()
    # Ensure all selected columns are numeric (prevent string date leakage)
    data = data.apply(pd.to_numeric, errors='coerce')
    data = data.ffill().bfill()
    data.index = df[date_col]
    
    # Run CausalImpact
    ci = CausalImpact(data, pre_period, post_period)
    
    # Build results DataFrame with predictions and effects
    n_pre = len(df[df[date_col] <= pre_period[1]])
    n_post = len(df[df[date_col] >= post_period[0]])
    n_total = n_pre + n_post
    
    results_df = pd.DataFrame({
        'date': df[date_col].iloc[:n_total].values,
        'actual': data.iloc[:n_total, 0].values,
        'predicted': ci.inferences['preds'].iloc[:n_total].values,
        'point_effect': ci.inferences['point_effects'].iloc[:n_total].values,
    })
    
    # Add confidence intervals for post-period
    post_mask = results_df['date'] >= post_period[0]
    results_df.loc[post_mask, 'lower_effect'] = ci.inferences['point_effects_lower'].iloc[:n_total].values[post_mask]
    results_df.loc[post_mask, 'upper_effect'] = ci.inferences['point_effects_upper'].iloc[:n_total].values[post_mask]
    results_df.loc[~post_mask, 'lower_effect'] = np.nan
    results_df.loc[~post_mask, 'upper_effect'] = np.nan
    
    return {
        'ci': ci,
        'summary_data': ci.summary_data,
        'summary_text': ci.summary(),
        'report_text': ci.summary(output='report'),
        'results_df': results_df,
        'pre_period': pre_period,
        'post_period': post_period,
        'p_value': ci.p_value,
    }


def get_key_metrics(summary_data, p_value=0.0):
    """Extract key metrics from CausalImpact summary_data.
    
    summary_data is a DataFrame with index:
        ['actual', 'predicted', 'predicted_lower', 'predicted_upper',
         'abs_effect', 'abs_effect_lower', 'abs_effect_upper',
         'rel_effect', 'rel_effect_lower', 'rel_effect_upper']
    and columns: ['average', 'cumulative']
    """
    try:
        avg_eff = float(summary_data.loc['abs_effect', 'average'])
        cum_eff = float(summary_data.loc['abs_effect', 'cumulative'])
        rel_eff = float(summary_data.loc['rel_effect', 'average'])
    except:
        avg_eff, cum_eff, rel_eff = 0.0, 0.0, 0.0
    return {
        'average_effect': avg_eff,
        'cumulative_effect': cum_eff,
        'p_value': float(p_value),
        'relative_effect': rel_eff,
    }
```

---

## Data Generator — `data_generator.py`

```python
"""Synthetic Data Generator for Causal Inference Platform.

Generates two datasets to demonstrate the platform's ability to distinguish
between fake success (seasonal trends) and true success (actual marketing impact).
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta


def generate_fake_success(n_days=1000, intervention_day=700, seed=42):
    """Scenario A: Strong seasonal trend, zero marketing impact."""
    np.random.seed(seed)
    start_date = datetime(2023, 1, 1)
    dates = [start_date + timedelta(days=i) for i in range(n_days)]
    
    trend = np.linspace(1000, 2000, n_days)
    weekly = 100 * np.sin(2 * np.pi * np.arange(n_days) / 7)
    monthly = 50 * np.sin(2 * np.pi * np.arange(n_days) / 30)
    noise = np.random.normal(0, 50, n_days)
    
    sales = np.maximum(trend + weekly + monthly + noise, 0)
    
    marketing_spend = np.random.uniform(10, 50, n_days)
    marketing_spend[intervention_day:] += np.random.uniform(500, 1000, n_days - intervention_day)
    
    return pd.DataFrame({
        'date': dates,
        'sales': sales.astype(int),
        'marketing_spend': marketing_spend.astype(int)
    })


def generate_true_success(n_days=1000, intervention_day=700, seed=42):
    """Scenario B: Flat baseline, massive real marketing impact."""
    np.random.seed(seed)
    start_date = datetime(2023, 1, 1)
    dates = [start_date + timedelta(days=i) for i in range(n_days)]
    
    baseline = 1000 + np.random.normal(0, 30, n_days)
    weekly = 30 * np.sin(2 * np.pi * np.arange(n_days) / 7)
    
    intervention_effect = np.zeros(n_days)
    intervention_effect[intervention_day:] = 800  # Sustained lift
    post_days = np.arange(n_days - intervention_day)
    intervention_effect[intervention_day:] += 1200 * np.exp(-post_days * 0.05)
    
    noise = np.random.normal(0, 40, n_days)
    sales = np.maximum(baseline + weekly + intervention_effect + noise, 0)
    
    marketing_spend = np.random.uniform(10, 50, n_days)
    marketing_spend[intervention_day:] += np.random.uniform(3000, 5000, n_days - intervention_day)
    
    return pd.DataFrame({
        'date': dates,
        'sales': sales.astype(int),
        'marketing_spend': marketing_spend.astype(int)
    })


if __name__ == "__main__":
    fake_df = generate_fake_success()
    true_df = generate_true_success()
    fake_df.to_csv('fake_success.csv', index=False)
    true_df.to_csv('true_success.csv', index=False)
    print(f"Generated fake_success.csv ({len(fake_df)} rows) and true_success.csv ({len(true_df)} rows)")
```

---

## Dashboard Requirements (What You Need to Build)

Build an interactive web dashboard (NOT Streamlit) with the following features:

### 1. Data Input Panel (Sidebar or Top Section)
- **CSV file upload** via drag-and-drop or file picker
- After upload, show a **data preview table** (first 5 rows)
- **Column selection dropdowns:**
  - Date Column (auto-detect the date column)
  - Target/Response Variable (Y) — the metric to analyze (e.g., `sales`)
  - Covariates/Controls (X) — optional multi-select (e.g., `marketing_spend`)
- **Intervention date picker** — the date the campaign/action started
- **"Run Analysis" button**

### 2. Results Display (Main Content Area)

After running the analysis, display:

#### a) Causal Impact Plot
- Line chart showing **Actual values** (solid line) vs **Predicted counterfactual** (dashed line) over time
- Shaded confidence interval around the predicted line
- Vertical line marking the intervention date
- The gap between actual and predicted in the post-period IS the causal effect

#### b) Point Effects Chart
- Bar/area chart showing the **daily causal effect** (actual - predicted) for each day after intervention
- With confidence interval bands

#### c) Key Metrics Cards (4 cards in a row)
- **Average Effect**: Average daily causal impact (from `get_key_metrics()['average_effect']`)
- **Cumulative Effect**: Total causal impact over the entire post-period
- **P-Value**: Statistical significance (highlight green if < 0.05, red if >= 0.05)
- **Relative Effect**: Percentage lift caused by the intervention

#### d) Summary Report
- Text block with the executive summary from `ci.summary()`
- Detailed report from `ci.summary(output='report')`

#### e) Export/Download
- Download the full report as `.txt`
- Download the predictions & effects DataFrame as `.csv`

### 3. Landing Page (Before Analysis)
- Brief explanation of what causal inference is
- Expected CSV format example
- How the algorithm works (1-2-3 steps)

---

## Python Dependencies

```
pycausalimpact
pandas
numpy
matplotlib
scipy
statsmodels
```

**IMPORTANT:** Do NOT use `tfcausalimpact` — it has TensorFlow threading deadlocks on macOS Apple Silicon. Use `pycausalimpact` which is statsmodels-based and works perfectly.

---

## Key Technical Gotchas (Lessons Learned)

1. **Only pass numeric columns to CausalImpact.** The data matrix must never contain date strings. Set dates as the DataFrame index, not as a column.
2. **The intervention_date must be a string or pd.Timestamp**, not a `datetime.date` object.
3. **Covariates must have non-zero variance** across the entire time range. If marketing_spend is exactly 0 before the campaign, add small random baseline noise.
4. **pycausalimpact's `ci.plot()` returns None.** If using matplotlib, call `ci.plot()` then `plt.gcf()` to capture the figure.
5. **pycausalimpact API:** Results are in `ci.inferences` (DataFrame), `ci.summary_data` (DataFrame), `ci.p_value` (float), `ci.summary()` (string).

---

## Design Guidelines

- Clean, professional UI — no emojis, no playful language
- Dark mode or modern glassmorphic styling
- Responsive layout
- Smooth loading states during analysis (the CausalImpact computation takes 2-5 seconds)
- Charts should be interactive (hover tooltips with exact values)
- Color scheme: use professional blues/grays with accent colors for significance indicators

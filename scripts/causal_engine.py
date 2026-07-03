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
        dict containing ci object, summary data, results df, etc.
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
    """Extract key metrics from CausalImpact summary_data."""
    try:
        avg_eff = float(summary_data.loc['abs_effect', 'average'])
        cum_eff = float(summary_data.loc['abs_effect', 'cumulative'])
        rel_eff = float(summary_data.loc['rel_effect', 'average'])
    except Exception:
        avg_eff, cum_eff, rel_eff = 0.0, 0.0, 0.0
    return {
        'average_effect': avg_eff,
        'cumulative_effect': cum_eff,
        'p_value': float(p_value),
        'relative_effect': rel_eff,
    }

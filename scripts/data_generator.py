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
    import os
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'samples')
    os.makedirs(out_dir, exist_ok=True)

    fake_df = generate_fake_success()
    true_df = generate_true_success()

    fake_path = os.path.join(out_dir, 'fake_success.csv')
    true_path = os.path.join(out_dir, 'true_success.csv')

    fake_df.to_csv(fake_path, index=False)
    true_df.to_csv(true_path, index=False)

    print(f"Generated fake_success.csv ({len(fake_df)} rows) at {fake_path}")
    print(f"Generated true_success.csv ({len(true_df)} rows) at {true_path}")
    print(f"Intervention date for both: {fake_df.iloc[700]['date']} (row 700)")

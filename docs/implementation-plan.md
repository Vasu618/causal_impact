# Causal Inference Platform Implementation Plan

This document serves as the exact technical blueprint to build the Automated Causal Inference & A/B Testing Platform. Providing this plan to an AI agent ensures a structured, bug-free execution without hallucinated dependencies or disorganized code.

## Goal Description
Build a full-stack Python application utilizing **Streamlit** (for the frontend) and **pycausalimpact** (for the algorithmic engine) to generate synthetic sales data and calculate the causal impact of marketing interventions.

## User Review Required
> [!IMPORTANT]  
> We are planning to use **Streamlit** for the frontend because it allows for rapid, beautiful deployment of data applications purely in Python, bypassing the need for a complex React/FastAPI setup. Please confirm if this is acceptable, or if you prefer a separate backend/frontend stack.

## Proposed Changes

We will create a new directory `causal_platform/` in your current workspace, containing the following structure:

### Configuration
#### [NEW] `causal_platform/requirements.txt`
Will contain the required Python packages: `streamlit`, `pandas`, `numpy`, `tfcausalimpact`, `matplotlib`.

### Backend & Causal Engine
#### [NEW] `causal_platform/data_generator.py`
A script to generate two CSV datasets:
1. `fake_success.csv`: High seasonal upward trend, zero actual marketing impact.
2. `true_success.csv`: Flat baseline, massive marketing impact.

#### [NEW] `causal_platform/causal_engine.py`
The core logic engine. Will contain a function `run_causal_analysis(dataframe, intervention_date)` that:
- Splits the data into "pre-campaign" and "post-campaign" periods.
- Runs the Bayesian Structural Time-Series algorithm.
- Returns the statistical summary and the data required for plotting.

### Frontend Dashboard
#### [NEW] `causal_platform/app.py`
The main Streamlit web application.
- **Sidebar:** Allows the user to select which dataset to load (Scenario A or Scenario B).
- **Metrics:** Displays large summary numbers (Total Incremental Revenue, P-value).
- **Charts:** Renders the "What If?" charts and the Daily Impact charts natively.

## Verification Plan

### Manual Verification
Once the code is written, you will be able to verify it by simply running:
1. `pip install -r requirements.txt` (to install dependencies)
2. `python data_generator.py` (to generate the synthetic data)
3. `streamlit run app.py` (to launch the live interactive web dashboard)

We will visually confirm that the dashboard correctly identifies Scenario A as having $0 impact, and Scenario B as having a high impact.

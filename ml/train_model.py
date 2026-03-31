"""
train_model.py
──────────────
Trains a RandomForestClassifier to predict whether a Lobato Tours quote
was sold (target column: `sold`).

Quick start
───────────
    1. Export ML data:
         Open https://your-app/cotizaciones  →  click "Export ML Data"
         Save the file as  ml/data.csv

    2. Install dependencies:
         pip install -r requirements.txt

    3. Train:
         python train_model.py                       # uses ml/data.csv by default
         python train_model.py path/to/data.csv      # custom path
         python train_model.py data.csv --no-plots   # skip matplotlib charts

Output
──────
    • Prints accuracy, precision, recall, F1, AUC-ROC
    • Plots: feature importance bar chart + confusion matrix
    • Saves trained model to  ml/lobato_rf_model.pkl
    • Saves column list to    ml/feature_columns.txt
      (needed if you deploy the model later)
"""

import sys
import warnings
import os
import joblib
import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_auc_score, RocCurveDisplay,
)
from sklearn.inspection import permutation_importance

from preprocess import load_and_prepare

warnings.filterwarnings("ignore")

# ── Config ────────────────────────────────────────────────────────────────────
DEFAULT_CSV     = os.path.join(os.path.dirname(__file__), "data.csv")
MODEL_OUT       = os.path.join(os.path.dirname(__file__), "lobato_rf_model.pkl")
FEATURES_OUT    = os.path.join(os.path.dirname(__file__), "feature_columns.txt")
N_ESTIMATORS    = 300
MAX_DEPTH       = None       # let trees grow fully; RF is robust to overfitting
MIN_SAMPLES_LEAF = 2
RANDOM_STATE    = 42
TOP_N_FEATURES  = 20         # how many features to show in the importance plot


# ── Helpers ───────────────────────────────────────────────────────────────────

def _divider(title: str = "") -> None:
    width = 72
    if title:
        pad = (width - len(title) - 2) // 2
        print(f"\n{'─' * pad} {title} {'─' * pad}")
    else:
        print("─" * width)


def _print_metrics(y_true, y_pred, y_prob=None) -> None:
    acc = accuracy_score(y_true, y_pred)
    print(f"  Accuracy  : {acc:.4f}  ({acc*100:.1f}%)")
    if y_prob is not None:
        try:
            auc = roc_auc_score(y_true, y_prob)
            print(f"  AUC-ROC   : {auc:.4f}")
        except ValueError:
            pass   # only one class in test set
    print()
    print(classification_report(y_true, y_pred,
                                target_names=["Not Sold (0)", "Sold (1)"],
                                digits=3))


def _plot_confusion_matrix(y_true, y_pred, show: bool) -> None:
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax,
                xticklabels=["Not Sold", "Sold"],
                yticklabels=["Not Sold", "Sold"])
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Confusion Matrix")
    plt.tight_layout()
    if show:
        plt.show()
    else:
        out = os.path.join(os.path.dirname(__file__), "confusion_matrix.png")
        plt.savefig(out, dpi=120)
        print(f"  Confusion matrix saved → {out}")
    plt.close()


def _plot_feature_importance(model, feature_names: list, show: bool) -> None:
    importances = model.feature_importances_
    idx = np.argsort(importances)[::-1][:TOP_N_FEATURES]
    top_names  = [feature_names[i] for i in idx]
    top_scores = importances[idx]

    fig, ax = plt.subplots(figsize=(9, 6))
    colors = ["#4f46e5" if s > np.percentile(top_scores, 66) else
              "#818cf8" if s > np.percentile(top_scores, 33) else
              "#c7d2fe" for s in top_scores]
    bars = ax.barh(top_names[::-1], top_scores[::-1], color=colors[::-1])
    ax.set_xlabel("Mean Decrease in Impurity (Gini importance)")
    ax.set_title(f"Top {TOP_N_FEATURES} Feature Importances — Random Forest")
    ax.bar_label(bars, fmt="%.4f", padding=3, fontsize=8)
    plt.tight_layout()
    if show:
        plt.show()
    else:
        out = os.path.join(os.path.dirname(__file__), "feature_importance.png")
        plt.savefig(out, dpi=120)
        print(f"  Feature importance chart saved → {out}")
    plt.close()


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    # ── Args ──────────────────────────────────────────────────────────────────
    args      = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags     = [a for a in sys.argv[1:] if a.startswith("--")]
    csv_path  = args[0] if args else DEFAULT_CSV
    show_plots = "--no-plots" not in flags

    if not show_plots:
        matplotlib.use("Agg")   # headless rendering

    _divider("LOBATO TOURS — ML MODEL TRAINER")
    print(f"  CSV          : {csv_path}")
    print(f"  Estimators   : {N_ESTIMATORS}")
    print(f"  Random state : {RANDOM_STATE}")

    # ── Load & preprocess ─────────────────────────────────────────────────────
    _divider("Loading data")
    X_train, X_test, y_train, y_test, feature_names = load_and_prepare(
        csv_path,
        test_size=0.2,
        random_state=RANDOM_STATE,
        scale=False,    # RF does not need scaling
        verbose=True,
    )

    # Guard: need both classes in training set
    if len(np.unique(y_train)) < 2:
        print("\n[WARNING] Only one class found in training data.")
        print("  Mark more quotes as sold or not-sold before training.")
        print("  Tip: use the 💰 button on each quote's detail page.")
        sys.exit(0)

    # ── Train ─────────────────────────────────────────────────────────────────
    _divider("Training Random Forest")
    model = RandomForestClassifier(
        n_estimators=N_ESTIMATORS,
        max_depth=MAX_DEPTH,
        min_samples_leaf=MIN_SAMPLES_LEAF,
        class_weight="balanced",   # handles class imbalance automatically
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    print(f"  Trained on {len(X_train):,} samples with {len(feature_names)} features.")

    # ── Evaluate ──────────────────────────────────────────────────────────────
    _divider("Evaluation — Test set")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    _print_metrics(y_test, y_pred, y_prob)

    # ── Feature importance ────────────────────────────────────────────────────
    _divider("Top feature importances")
    importances = model.feature_importances_
    idx = np.argsort(importances)[::-1][:TOP_N_FEATURES]
    for rank, i in enumerate(idx, 1):
        bar = "█" * int(importances[i] * 200)
        print(f"  {rank:>2}. {feature_names[i]:<35} {importances[i]:.4f}  {bar}")

    # ── Visuals ───────────────────────────────────────────────────────────────
    _divider("Charts")
    _plot_feature_importance(model, feature_names, show=show_plots)
    _plot_confusion_matrix(y_test, y_pred, show=show_plots)

    # ── Save model ────────────────────────────────────────────────────────────
    _divider("Saving model")
    joblib.dump(model, MODEL_OUT)
    print(f"  Model saved  → {MODEL_OUT}")

    with open(FEATURES_OUT, "w") as f:
        f.write("\n".join(feature_names))
    print(f"  Features saved → {FEATURES_OUT}")

    # ── Quick prediction example ──────────────────────────────────────────────
    _divider("Quick prediction demo")
    _demo_prediction(model, feature_names)

    _divider()
    print("  Done! ✓")


def _demo_prediction(model, feature_names: list) -> None:
    """
    Shows how to score a single new quote.
    All features default to 0; we only set the ones that are relevant.
    """
    sample = {col: 0 for col in feature_names}

    # Example: finished quote with a flight + hotel, commission 10%
    sample.update({
        "finished":          1,
        "commission_pct":   10,
        "has_vuelo":         1,
        "vuelo_total_cost": 4500,
        "airline_aeromexico":1,
        "has_hotel":         1,
        "hotel_total_nights":7,
        "hotel_total_cost":  12000,
        "num_travelers":     2,
        "num_adults":        2,
        "uses_dollar":       1,
        "exchange_rate":    17.5,
        "estimated_total":  17000,
        "num_services":      2,
    })

    row = pd.DataFrame([sample])[feature_names]
    prob = model.predict_proba(row)[0, 1]
    pred = model.predict(row)[0]

    print(f"  Example quote (flight + hotel, 2 adults, MXN 17,000):")
    print(f"  → Predicted class : {'SOLD 💰' if pred == 1 else 'NOT SOLD'}")
    print(f"  → Sale probability: {prob*100:.1f}%")


if __name__ == "__main__":
    main()

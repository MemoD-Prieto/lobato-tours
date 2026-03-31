# Lobato Tours — Machine Learning Module

Standalone Python module for predicting whether a travel quote will convert into a **sale**.

---

## How it works

### 1 — Mark quotes as "Sold"
In the app, open any finalized quote and click the **💰 Sold** toggle button in the header.
This sets `sold = true` on that quote in the database. The more quotes you label, the better the model.

### 2 — Export the ML dataset
In the **Quotes** list page, click the violet **"Export ML Data"** button.
This downloads a CSV from `/api/cotizaciones/ml-export` that contains one row per quote, with:

- All string/categorical fields converted to **binary (0/1) columns** (one-hot encoding)
- All costs and counts as **numeric** columns
- A `sold` column as the **target variable** (0 = not sold, 1 = sold)

Save the file as `ml/data.csv`.

### 3 — Install Python dependencies
```bash
cd ml
pip install -r requirements.txt
```

### 4 — Train the model
```bash
cd ml
python train_model.py                    # uses ml/data.csv
python train_model.py /path/to/file.csv  # custom CSV path
python train_model.py --no-plots         # skip matplotlib (headless/server)
```

The script prints:
- Class distribution (sold vs not sold)
- Service penetration rates
- Test-set accuracy, precision, recall, F1, AUC-ROC
- Top 20 most predictive features
- Saves `lobato_rf_model.pkl` (trained model)
- Saves `feature_columns.txt` (column order, needed for inference)
- Saves `confusion_matrix.png` and `feature_importance.png`

---

## CSV column reference

| Column | Type | Description |
|--------|------|-------------|
| `cotizacion_id` | int | Quote ID (dropped before training) |
| **`sold`** | **0/1** | **TARGET — was this quote sold?** |
| `finished` | 0/1 | Was the quote finalized? |
| `commission_pct` | float | Commission percentage |
| `has_notes` | 0/1 | Quote has notes text |
| `has_valid_until` | 0/1 | Quote has an expiry date |
| `days_until_expiry` | int | Days left until expiry (0 if none) |
| `has_greeting` / `has_goodbye` | 0/1 | Personalized messages present |
| `creation_month` | 1–12 | Month created |
| `creation_quarter` | 1–4 | Quarter created |
| `creation_dayofweek` | 0–6 | Day of week (0=Sun) |
| `has_jacket/tickets/snacks/guide/ticketholder` | 0/1 | Extra items included |
| `jacket/tickets/snacks/guide/ticketholder_cost` | float | Cost of each extra |
| `num_clients` | int | Number of client records |
| `num_travelers` | int | Total passengers |
| `num_infants/children_small/children_teen/adults` | int | Pax by age group |
| `uses_dollar` | 0/1 | Quote priced in USD |
| `exchange_rate` | float | MXN/USD rate used |
| `has_paquete` | 0/1 | Travel package included |
| `paquete_price` | float | Package cost |
| `paquete_duration_days` | int | Trip length in days |
| `has_vuelo` | 0/1 | Flight included |
| `vuelo_total_cost` | float | Total flight cost (all fees) |
| `vuelo_num_personas` | int | Flight pax count |
| `airline_aeromexico` / `airline_volaris` / `airline_viva_aerobus` / `airline_other` | 0/1 | One-hot airline |
| `has_crucero` | 0/1 | Cruise included |
| `crucero_precio_total` | float | Cruise cost × pax |
| `crucero_duracion` | int | Cruise duration (days) |
| `cruise_royal_caribbean` / `cruise_norwegian` / `cruise_princess` / `cruise_other` | 0/1 | One-hot cruise line |
| `has_hotel` | 0/1 | Hotel included |
| `hotel_count` | int | Number of hotels |
| `hotel_total_nights` | int | Sum of all hotel nights |
| `hotel_total_cost` | float | Sum of all room costs + IVA |
| `has_traslado` | 0/1 | Transfer included |
| `traslado_amount` | float | Transfer cost |
| `traslado_tipo_privado` / `traslado_tipo_compartido` | 0/1 | Transfer type flags |
| `has_entradas` | 0/1 | Attraction tickets included |
| `entradas_total` | float | Tickets cost × quantity |
| `has_ferry` | 0/1 | Ferry included |
| `ferry_precio_total` | float | Ferry cost × pax |
| `has_seguro` | 0/1 | Insurance included |
| `seguro_costo_total` | float | Insurance cost × pax |
| `insurance_euroamerican_assistance` / `insurance_universal_assistance` / `insurance_other` | 0/1 | One-hot insurer |
| `seguro_tipo_individual` / `seguro_tipo_familiar` | 0/1 | Insurance type flags |
| `has_datos` | 0/1 | Data plan/eSIM included |
| `datos_costo_total` | float | Data plan cost × pax |
| `has_visa` | 0/1 | Visa processing included |
| `visa_costo_total` | float | Visa cost × pax |
| `num_services` | int | Total number of services in quote |
| `estimated_total` | float | Full quote cost including commission |

---

## Model details

| Parameter | Value |
|-----------|-------|
| Algorithm | Random Forest Classifier |
| Trees | 300 |
| Class weight | `balanced` (handles sold/not-sold imbalance) |
| Feature scaling | Not needed (tree-based) |
| Test split | 20% stratified |

The `balanced` class weight means the model learns equally from sold and unsold quotes even if you have far fewer sold labels — which is the typical early-stage situation.

---

## Loading a saved model for inference

```python
import joblib
import pandas as pd

model = joblib.load("lobato_rf_model.pkl")

with open("feature_columns.txt") as f:
    columns = f.read().splitlines()

# Build a row with all columns = 0, then set the known values
sample = {col: 0 for col in columns}
sample.update({
    "finished": 1,
    "commission_pct": 12,
    "has_vuelo": 1,
    "vuelo_total_cost": 5000,
    "airline_aeromexico": 1,
    "num_travelers": 3,
    "estimated_total": 22000,
    "num_services": 2,
})

row = pd.DataFrame([sample])[columns]
probability = model.predict_proba(row)[0, 1]
print(f"Sale probability: {probability*100:.1f}%")
```

---

## Tips for better accuracy

1. **Label more quotes** — aim for at least 50–100 sold quotes before training.
2. **Re-export & retrain** every month as new quote data comes in.
3. The `estimated_total`, `num_services`, and `commission_pct` columns tend to be the strongest predictors.
4. If accuracy is low, check that `sold` is consistently labeled (not just the most recent quotes).

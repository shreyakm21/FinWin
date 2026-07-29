# ml/export_model.py

#Used to save trained models.
import joblib
import json

vectorizer = joblib.load("vectorizer.pkl")
model = joblib.load("category_model.pkl")

export_data = {
    "vocabulary": vectorizer.vocabulary_,
    "idf": vectorizer.idf_.tolist(),
    "categories": model.classes_.tolist(),
    "coefficients": model.coef_.tolist(),
    "intercepts": model.intercept_.tolist()
}

with open("../utils/analytics/category_model.json", "w") as f:
    json.dump(export_data, f)

print("✅ Exported model to category_model.json")
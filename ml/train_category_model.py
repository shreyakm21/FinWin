# ml/train_category_model.py

import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC

# Load CSV
df = pd.read_csv("category_data.csv")

# ✅ Remove duplicates FIRST
df = df.drop_duplicates()
df = df.sample(frac=1, random_state=42)

# Extract features and labels AFTER cleaning
X = df["narration"].astype(str)
y = df["category"].astype(str)

# TF-IDF vectorizer (1–2 word phrases)
vectorizer = TfidfVectorizer(
    lowercase=True,
    ngram_range=(1, 2),
    stop_words="english"
)

X_vec = vectorizer.fit_transform(X)

# Train model
model = LinearSVC()
model.fit(X_vec, y)

# Save both
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(model, "category_model.pkl")

print("✅ Model trained successfully!")
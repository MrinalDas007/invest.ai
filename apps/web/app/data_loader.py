# app/data_loader.py
import json
import os
from app.database import SessionLocal
from app import models

DATA_DIR = "D:\\Projects\\AI Builds\\invest.ai\\apps\\web\\data"

TABLE_FILE_MODEL_MAP = {
    "nifty_indices.json": models.NiftyIndex,
    "stocks.json": models.Stock,
    "stock_recommendations.json": models.StockRecommendation,
    "market_analysis.json": models.MarketAnalysis,
    "technical_indicators.json": models.TechnicalIndicator,
    "sector_performance.json": models.SectorPerformance,
    "user_preferences.json": models.UserPreferences,
    "notification_history.json": models.NotificationHistory,
}


def load_initial_data():
    db = SessionLocal()

    for filename, model in TABLE_FILE_MODEL_MAP.items():
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"⚠️ Skipping {filename}, not found")
            continue

        # Skip if table already has data
        count = db.query(model).count()
        if count > 0:
            print(
                f"ℹ️ Skipping {filename}, {count} records already in {model.__tablename__}"
            )
            continue

        with open(filepath, "r") as f:
            try:
                records = json.load(f)
            except Exception as e:
                print(f"❌ Error loading {filename}: {e}")
                continue

        if not isinstance(records, list):
            print(f"⚠️ {filename} is not a list, skipping.")
            continue

        for record in records:
            try:
                db.add(model(**record))
            except Exception as e:
                print(f"❌ Error inserting record into {model.__tablename__}: {e}")

        db.commit()
        print(f"✅ Imported {len(records)} records into {model.__tablename__}")

    db.close()

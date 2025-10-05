# app/main.py
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime
from pydantic import BaseModel
from typing import List, Optional, Any, Dict

from requests import Session
from sqlalchemy import func
from app.database import init_db, get_db
from app.data_loader import load_initial_data
from .models import (
    NiftyIndex,
    SectorPerformance,
    Stock,
    StockRecommendation,
    MarketAnalysis,
    NotificationHistory,
    TechnicalIndicator,
    UserPreferences,
)
from .technical import rsi
from .ai_client import (
    fetch_market_snapshot,
    fetch_stock_recommendations,
    generate_recommendation_reasoning,
    fetch_stock_prices,
)
import random
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Market Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Startup ---
@app.on_event("startup")
def on_startup():
    init_db()
    load_initial_data()


@app.get("/")
def root():
    return {"message": "Backend running with Postgres + JSON data loaded!"}


# --- Schemas ---
class NiftyIndexIn(BaseModel):
    name: str
    current_value: float
    change_value: float
    change_percent: float


class RecommendationIn(BaseModel):
    ticker: str
    alert_time: str
    recommendation: str
    confidence_score: float
    timeframe: str
    reasons: Optional[str] = None
    sector: Optional[str] = None


class RealTimeAction(BaseModel):
    action: str
    alertTime: Optional[str] = None


class NotificationPost(BaseModel):
    type: str
    user_id: Optional[str] = "default_user"
    title: Optional[str] = None
    message: Optional[str] = None
    push_notifications_enabled: Optional[bool] = None
    morning_alerts_enabled: Optional[bool] = None
    afternoon_alerts_enabled: Optional[bool] = None
    notification_id: Optional[int] = None


# --- Portfolio Schemas ---
class StockIn(BaseModel):
    ticker: str
    company_name: Optional[str] = None
    sector: Optional[str] = None
    nifty_group: Optional[str] = None
    buy_price: Optional[float] = None
    current_price: Optional[float] = None
    change_value: Optional[float] = None
    change_percent: Optional[float] = None
    volume: Optional[int] = None
    market_cap: Optional[float] = None


def get_realistic_timeframe(
    alert_time: str, recommendation_type: str, confidence: float
) -> str:
    """
    Generate a realistic timeframe for the recommendation.
    - Intraday alerts -> very short timeframes
    - High confidence BUY -> longer hold times
    - Low confidence -> shorter hold times
    """
    if alert_time == "10_AM":  # Morning alerts → short-term
        return random.choice(["1-3 Days", "1 Week"])

    if recommendation_type == "BUY":
        if confidence > 0.85:
            return random.choice(["6-12 Months", "1 Year"])
        elif confidence > 0.75:
            return random.choice(["1-3 Months", "3-6 Months"])
        else:
            return random.choice(["1-3 Weeks", "1-3 Months"])

    if recommendation_type == "SELL":
        return random.choice(["1-3 Days", "1 Week", "1-2 Weeks"])

    # HOLD case
    return random.choice(["2-4 Weeks", "1-3 Months"])


# --- Endpoints ---


@app.get("/api/stocks/nifty-indices")
def get_nifty_indices(db=Depends(get_db)):
    rows = db.query(NiftyIndex).all()
    out = []
    for r in rows:
        out.append(
            {
                "name": r.name,
                "current_value": r.current_value,
                "change_value": r.change_value,
                "change_percent": r.change_percent,
                "is_positive": True if r.change_value >= 0 else False,
            }
        )
    return {"data": out}


@app.get("/api/stocks/recommendations")
def get_recommendations(
    alert_time: Optional[str] = Query(None),
    date_q: Optional[date] = Query(None, alias="date"),
    limit: Optional[int] = 20,
    db=Depends(get_db),
):
    q = db.query(StockRecommendation)
    if alert_time:
        q = q.filter(StockRecommendation.alert_time == alert_time)
    if date_q:
        q = q.filter(StockRecommendation.recommendation_date == date_q)
    rows = q.order_by(StockRecommendation.created_at.desc()).limit(limit).all()
    out = []
    for r in rows:
        out.append(
            {
                "id": r.id,
                "ticker": r.ticker,
                "company_name": r.company_name,
                "sector": r.sector,
                "current_price": r.current_price,
                "target_price": r.target_price,
                "recommendation": r.recommendation,
                "confidence_score": r.confidence_score,
                "timeframe": r.timeframe,
                "reasons": r.reasons,
                "alert_time": r.alert_time,
            }
        )
    return {"data": out}


@app.get("/api/stocks/analysis")
def get_analysis(db=Depends(get_db)):
    # Fetch latest market analysis
    row = db.query(MarketAnalysis).order_by(MarketAnalysis.id.desc()).first()
    if not row:
        return {"data": {}}

    # Fetch technical indicators (latest per ticker)
    indicators = (
        db.query(TechnicalIndicator)
        .order_by(TechnicalIndicator.analysis_date.desc())
        .limit(10)  # you can adjust number of indicators sent
        .all()
    )

    tech_list = []
    for ti in indicators:
        tech_list.append(
            {
                "ticker": ti.ticker,
                "rsi": ti.rsi_14,
                "macd": ti.macd,
                "moving_avg_50": ti.moving_avg_50,
                "moving_avg_200": ti.moving_avg_200,
                "bollinger_upper": ti.bollinger_upper,
                "bollinger_lower": ti.bollinger_lower,
                "support_level": ti.support_level,
                "resistance_level": ti.resistance_level,
                "analysis_date": (
                    ti.analysis_date.isoformat() if ti.analysis_date else None
                ),
            }
        )

    # Fetch latest sector performance
    sectors = (
        db.query(SectorPerformance)
        .order_by(SectorPerformance.analysis_date.desc())
        .all()
    )

    sector_list = []
    for s in sectors:
        sector_list.append(
            {
                "name": s.sector_name,
                "performance": s.performance_percent,
                "trend": s.trend,  # "positive" or "negative"
                "market_cap": s.market_cap,
                "analysis_date": (
                    s.analysis_date.isoformat() if s.analysis_date else None
                ),
            }
        )

    # Compute key support/resistance from latest technical indicators
    support_levels = [float(ti.support_level) for ti in indicators if ti.support_level]
    resistance_levels = [
        float(ti.resistance_level) for ti in indicators if ti.resistance_level
    ]

    key_levels = {
        "support": round(min(support_levels), 2) if support_levels else None,
        "resistance": round(max(resistance_levels), 2) if resistance_levels else None,
    }

    return {
        "data": {
            "date": row.analysis_date.isoformat() if row.analysis_date else None,
            "bullish_sentiment": row.bullish_sentiment,
            "bearish_sentiment": row.bearish_sentiment,
            "market_trend": row.market_trend,
            "fear_greed_index": row.fear_greed_index,
            "volatility_index": row.volatility_index,
            "technicalIndicators": tech_list,
            "sectors": sector_list,
            "keyLevels": key_levels,
        }
    }


@app.post("/api/stocks/analysis")
def post_analysis(payload: Dict[str, Any], db=Depends(get_db)):
    """
    Accepts sentiment, sector performance, and optional technical indicators.
    """
    analysis_date = payload.get("date", date.today().isoformat())
    market_analysis = MarketAnalysis(
        analysis_date=date.fromisoformat(analysis_date),
        bullish_sentiment=payload.get("bullish_sentiment", 50.0),
        bearish_sentiment=payload.get("bearish_sentiment", 50.0),
        market_trend=payload.get("market_trend", "Neutral"),
        fear_greed_index=payload.get("fear_greed_index", 50.0),
        volatility_index=payload.get("volatility_index", "N/A"),
    )
    db.add(market_analysis)

    # Save technical indicators if provided
    technicals = payload.get("technicalIndicators", [])
    for t in technicals:
        ti = TechnicalIndicator(
            ticker=t.get("ticker"),
            rsi_14=t.get("rsi_14"),
            macd=t.get("macd"),
            moving_avg_50=t.get("moving_avg_50"),
            moving_avg_200=t.get("moving_avg_200"),
            bollinger_upper=t.get("bollinger_upper"),
            bollinger_lower=t.get("bollinger_lower"),
            support_level=t.get("support_level"),
            resistance_level=t.get("resistance_level"),
            analysis_date=date.fromisoformat(analysis_date),
            created_at=date.today(),
        )
        db.add(ti)

    db.commit()
    return {"status": "ok"}


@app.get("/api/notifications")
def get_notifications(
    user_id: Optional[str] = "default_user", limit: int = 20, db=Depends(get_db)
):
    prefs = db.query(UserPreferences).filter_by(user_id=user_id).first()
    if not prefs:
        prefs = UserPreferences(user_id=user_id, created_at=date.today())
        db.add(prefs)
        db.commit()
    rows = (
        db.query(NotificationHistory)
        .filter_by(user_id=user_id)
        .order_by(NotificationHistory.sent_at.desc())
        .limit(limit)
        .all()
    )
    history = [
        {
            "id": r.id,
            "title": r.title,
            "message": r.message,
            "notification_type": r.notification_type,
            "sent_at": r.sent_at.isoformat() if r.sent_at else None,
            "read_at": r.read_at.isoformat() if r.read_at else None,
        }
        for r in rows
    ]
    return {
        "preferences": {
            "push_notifications_enabled": prefs.push_notifications_enabled,
            "morning_alerts_enabled": prefs.morning_alerts_enabled,
            "afternoonAlertsEnabled": prefs.afternoon_alerts_enabled,
        },
        "history": history,
    }


@app.post("/api/notifications")
def post_notifications(payload: NotificationPost, db=Depends(get_db)):
    typ = payload.type
    user_id = payload.user_id or "default_user"
    if typ == "send_notification":
        if not payload.title or not payload.message:
            raise HTTPException(status_code=400, detail="title and message required")
        n = NotificationHistory(
            user_id=user_id,
            title=payload.title,
            message=payload.message,
            notification_type="stock_recommendation",
            sent_at=date.today(),
            created_at=date.today(),
        )
        db.add(n)
        db.commit()
        return {"status": "sent"}
    elif typ == "update_preferences":
        print("Preferences payload:", payload)
        prefs = db.query(UserPreferences).filter_by(user_id=user_id).first()
        if not prefs:
            prefs = UserPreferences(user_id=user_id, created_at=date.today())
            db.add(prefs)
        if payload.push_notifications_enabled is not None:
            prefs.push_notifications_enabled = payload.push_notifications_enabled
        if payload.morning_alerts_enabled is not None:
            prefs.morning_alerts_enabled = payload.morning_alerts_enabled
        if payload.afternoon_alerts_enabled is not None:
            prefs.afternoon_alerts_enabled = payload.afternoon_alerts_enabled
        db.commit()
        return {"status": "updated"}
    elif typ == "mark_as_read":
        nid = payload.notification_id
        if not nid:
            raise HTTPException(
                status_code=400, detail="notification_id required for mark_as_read"
            )
        rec = db.query(NotificationHistory).filter_by(id=nid).first()
        if not rec:
            raise HTTPException(status_code=404, detail="notification not found")
        rec.read_at = datetime.now()
        db.commit()
        return {"status": "ok"}
    else:
        raise HTTPException(status_code=400, detail="unknown type")


@app.post("/api/stocks/real-time-update")
async def realtime_update(payload: dict, db: Session = Depends(get_db)):
    action = payload.get("action")

    if action == "update_market_data":
        snapshot = await fetch_market_snapshot()
        if "error" in snapshot:
            raise HTTPException(status_code=500, detail=snapshot["error"])

        # Save Nifty Indices
        for idx in snapshot.get("nifty_indices", []):
            existing = (
                db.query(NiftyIndex)
                .filter(func.lower(NiftyIndex.name) == func.lower(idx["name"]))
                .first()
            )
            if existing:
                existing.current_value = idx["current_value"]
                existing.change_value = idx["change_value"]
                existing.change_percent = idx["change_percent"]
                existing.last_updated = date.today()
            else:
                db.add(
                    NiftyIndex(
                        name=idx["name"],
                        current_value=idx["current_value"],
                        change_value=idx["change_value"],
                        change_percent=idx["change_percent"],
                        last_updated=date.today(),
                        created_at=date.today(),
                    )
                )

        # Save Sector Performance
        for sec in snapshot.get("sectors", []):
            existing = (
                db.query(SectorPerformance)
                .filter(
                    func.lower(SectorPerformance.sector_name)
                    == func.lower(sec["sector_name"])
                )
                .first()
            )
            if existing:
                existing.performance_percent = sec["performance_percent"]
                existing.trend = sec["trend"]
                existing.market_cap = sec["market_cap"]
                existing.analysis_date = date.today()
            else:
                db.add(
                    SectorPerformance(
                        sector_name=sec["sector_name"],
                        performance_percent=sec["performance_percent"],
                        trend=sec["trend"],
                        market_cap=sec["market_cap"],
                        analysis_date=date.today(),
                        created_at=date.today(),
                    )
                )

        # Save Market Sentiment
        sentiment = snapshot.get("sentiment", {})
        db.add(
            MarketAnalysis(
                analysis_date=date.today(),
                bullish_sentiment=sentiment.get("bullish_sentiment"),
                bearish_sentiment=sentiment.get("bearish_sentiment"),
                market_trend=sentiment.get("market_trend"),
                fear_greed_index=sentiment.get("fear_greed_index"),
                volatility_index=sentiment.get("volatility_index"),
                created_at=date.today(),
            )
        )

        # Update stock prices in portfolio for list of stock tickers
        portfolio_stocks = db.query(Stock).all()
        tickers = [s.ticker for s in portfolio_stocks if s.ticker]
        if tickers:
            price_updates = await fetch_stock_prices(tickers)
            if "error" in price_updates:
                raise HTTPException(status_code=500, detail=price_updates["error"])
            for stock in portfolio_stocks:
                if stock.ticker in price_updates["stock_prices"]:
                    stock.current_price = price_updates["stock_prices"][stock.ticker][
                        "current_price"
                    ]
                    # Recalculate change_value and change_percent if buy_price and volume are set
                    if stock.buy_price and stock.volume:
                        stock.change_value = (
                            stock.current_price - stock.buy_price
                        ) * stock.volume
                        invested_amount = stock.buy_price * stock.volume
                        stock.change_percent = (
                            (stock.change_value / invested_amount) * 100
                            if invested_amount != 0
                            else 0
                        )
                        stock.change_percent = round(stock.change_percent, 2)
                    stock.last_updated = date.today()

        db.commit()
        return {
            "status": "ok",
            "message": "Market data updated (simulated)",
            "snapshot_saved": True,
        }

    elif action == "generate_recommendations":
        alert_time = payload.get("alert_time", "10_AM")

        recos = await fetch_stock_recommendations()
        if "error" in recos:
            raise HTTPException(status_code=500, detail=recos["error"])
        created = 0
        for rec in recos.get("stocks", []):
            existing = (
                db.query(StockRecommendation)
                .filter(
                    func.lower(StockRecommendation.ticker) == func.lower(rec["ticker"]),
                    StockRecommendation.alert_time == alert_time,
                    StockRecommendation.recommendation_date == date.today(),
                )
                .first()
            )
            if existing:
                existing.company_name = rec.get("company_name", existing.company_name)
                existing.sector = rec.get("sector", existing.sector)
                existing.recommendation = rec["recommendation"]
                existing.confidence_score = rec["confidence_score"] * 100
                existing.timeframe = rec["timeframe"]
                existing.reasons = rec.get("reasons", existing.reasons)
                existing.current_price = rec["current_price"]
                existing.target_price = rec["target_price"]
                existing.recommendation_date = date.today()
                existing.alert_time = alert_time
            else:
                # Process each stock recommendation
                created += 1
                reasoning = rec.get("reasons")
                if not reasoning:
                    prompt = (
                        f"Generate reasoning for {rec['recommendation']} on {rec['ticker']}, "
                        f"confidence {rec['confidence_score']*100:.0f}%, timeframe {rec['timeframe']}, sector {rec.get('sector', 'Unknown')}."
                    )
                    reasoning = await generate_recommendation_reasoning(prompt)
                db.add(
                    StockRecommendation(
                        ticker=rec["ticker"],
                        company_name=rec["company_name"],
                        sector=rec.get("sector", "Unknown"),
                        current_price=rec["current_price"],
                        target_price=rec["target_price"],
                        recommendation=rec["recommendation"],
                        confidence_score=rec["confidence_score"] * 100,
                        timeframe=rec["timeframe"],
                        reasons=reasoning,
                        alert_time=alert_time,
                        recommendation_date=date.today(),
                        created_at=date.today(),
                    )
                )

        # Log notification
        notif = NotificationHistory(
            user_id="default_user",
            notification_type="stock_recommendation",
            title=f"New {alert_time} recommendations",
            message=f"Alert: {created} new stock recommendations available. Check them out!",
            sent_at=date.today(),
            created_at=date.today(),
        )
        db.add(notif)

        db.commit()
        return {"status": "ok", "created": created}

    else:
        raise HTTPException(status_code=400, detail="Unknown action")


# --- Portfolio Endpoints ---


@app.get("/api/stock/portfolio")
def get_portfolio(db=Depends(get_db)):
    """
    Fetch all stocks saved in the user's portfolio.
    """
    rows = db.query(Stock).all()

    out = []
    total_invested = 0
    total_current = 0
    total_change = 0
    for r in rows:
        # compute change if not already stored
        change_value = r.change_value
        change_percent = r.change_percent
        invested_amount = (r.buy_price * r.volume) if r.buy_price else 0
        if (
            r.current_price is not None
            and r.buy_price is not None
            and r.volume is not None
        ):
            change_value = r.current_price * r.volume - r.buy_price * r.volume
            change_percent = (
                (change_value / invested_amount) * 100 if invested_amount != 0 else 0
            )
        total_invested += invested_amount
        total_current += r.current_price * r.volume

        out.append(
            {
                "id": r.id,
                "ticker": r.ticker,
                "company_name": r.company_name,
                "sector": r.sector,
                "nifty_group": r.nifty_group,
                "buy_price": round(r.buy_price, 2) if r.buy_price else 0,
                "current_price": round(r.current_price, 2) if r.current_price else 0,
                "invested_amount": round(invested_amount, 2),
                "change_value": round(change_value, 2) if change_value else 0,
                "change_percent": round(change_percent, 2) if change_percent else 0,
                "is_positive": True if change_value and change_value >= 0 else False,
                "volume": r.volume,
                "market_cap": r.market_cap,
                "last_updated": r.last_updated.isoformat() if r.last_updated else None,
            }
        )

    total_change = round(total_current - total_invested, 2)

    return {
        "data": out,
        "total_invested": round(total_invested, 2),
        "total_current": round(total_current, 2),
        "total_change": round(total_change, 2),
        "total_change_percent": (
            round((total_change / total_invested * 100), 2)
            if total_invested != 0
            else 0
        ),
    }


@app.post("/api/stock/portfolio")
def add_to_portfolio(payload: StockIn, db=Depends(get_db)):
    """
    Add a stock to the portfolio. If ticker already exists → update it.
    """
    print("Payload received:", payload)
    if not payload.change_value:
        payload.change_value = (
            (payload.current_price - payload.buy_price) * payload.volume
            if payload.current_price and payload.buy_price and payload.volume
            else 0
        )
    if not payload.change_percent:
        payload.change_percent = (
            (payload.change_value / (payload.buy_price * payload.volume) * 100)
            if payload.buy_price
            and payload.volume
            and payload.buy_price * payload.volume != 0
            else 0
        )

    existing = db.query(Stock).filter_by(ticker=payload.ticker).first()
    if existing:
        # update existing stock
        existing.company_name = payload.company_name or existing.company_name
        existing.sector = payload.sector or existing.sector
        existing.nifty_group = payload.nifty_group or existing.nifty_group
        existing.buy_price = payload.buy_price or existing.buy_price
        existing.current_price = payload.current_price or existing.current_price
        existing.change_value = round(payload.change_value, 2) or existing.change_value
        existing.change_percent = (
            round(payload.change_percent, 2) or existing.change_percent
        )
        existing.volume = payload.volume or existing.volume
        existing.market_cap = payload.market_cap or existing.market_cap or 0
        existing.last_updated = date.today()

    else:
        # create new stock
        new_stock = Stock(
            ticker=payload.ticker,
            company_name=payload.company_name,
            sector=payload.sector,
            nifty_group=payload.nifty_group,
            buy_price=payload.buy_price,
            current_price=payload.current_price,
            change_value=payload.change_value,
            change_percent=payload.change_percent,
            volume=payload.volume,
            market_cap=payload.market_cap or 0,
            last_updated=date.today(),
            created_at=date.today(),
        )
        db.add(new_stock)
        existing = new_stock

    db.commit()
    db.refresh(existing)
    return {"status": "ok", "message": f"Stock {existing.ticker} added/updated"}

from sqlalchemy import Column, Integer, String, Float, Date, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class NiftyIndex(Base):
    __tablename__ = "nifty_indices"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    current_value = Column(Float)
    change_value = Column(Float)
    change_percent = Column(Float)
    last_updated = Column(Date)
    created_at = Column(Date)


class Stock(Base):
    __tablename__ = "stocks"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticker = Column(String, unique=True, index=True)
    company_name = Column(String)
    sector = Column(String)
    nifty_group = Column(String)
    buy_price = Column(Float)
    current_price = Column(Float)
    change_value = Column(Float)
    change_percent = Column(Float)
    volume = Column(Integer)
    market_cap = Column(Float)
    last_updated = Column(Date)
    created_at = Column(Date)


class StockRecommendation(Base):
    __tablename__ = "stock_recommendations"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticker = Column(String)
    company_name = Column(String)
    sector = Column(String)
    current_price = Column(Float)
    target_price = Column(Float)
    recommendation = Column(String)
    confidence_score = Column(Float)
    timeframe = Column(String)
    reasons = Column(String)
    analysis_type = Column(String)
    alert_time = Column(String)
    recommendation_date = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(Date)


class MarketAnalysis(Base):
    __tablename__ = "market_analysis"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_date = Column(Date)
    bullish_sentiment = Column(Float)
    bearish_sentiment = Column(Float)
    market_trend = Column(String)
    fear_greed_index = Column(Float)
    volatility_index = Column(String)
    created_at = Column(Date)


class TechnicalIndicator(Base):
    __tablename__ = "technical_indicators"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticker = Column(String)
    rsi_14 = Column(String)
    macd = Column(String)
    moving_avg_50 = Column(String)
    moving_avg_200 = Column(String)
    bollinger_upper = Column(String)
    bollinger_lower = Column(String)
    support_level = Column(String)
    resistance_level = Column(String)
    analysis_date = Column(Date)
    created_at = Column(Date)
    stock = relationship("Stock")


class SectorPerformance(Base):
    __tablename__ = "sector_performance"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sector_name = Column(String, index=True)
    performance_percent = Column(String)
    trend = Column(String)
    market_cap = Column(String)
    analysis_date = Column(Date)
    created_at = Column(Date)


class UserPreferences(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, index=True)
    morning_alerts_enabled = Column(Boolean, default=True)
    afternoon_alerts_enabled = Column(Boolean, default=True)
    push_notifications_enabled = Column(Boolean, default=True)
    email_notifications_enabled = Column(Boolean, default=True)
    preferred_sectors = Column(String)
    risk_tolerance = Column(String)
    created_at = Column(Date)
    updated_at = Column(Date)


class NotificationHistory(Base):
    __tablename__ = "notification_history"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, index=True)
    notification_type = Column(String)
    title = Column(String)
    message = Column(String)
    ticker = Column(String, nullable=True)
    sent_at = Column(Date)
    read_at = Column(Date)
    created_at = Column(Date)

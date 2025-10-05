📁 Backend API Structure Guide

1. 📍 URL: GET/POST /api/stocks/nifty-indices

Purpose: Handles Nifty indices data (Nifty 50, Nifty Bank, Nifty IT, etc.)

Key Features:

GET: Fetches all Nifty indices with current values, changes, and percentages
POST: Updates Nifty indices data for real-time updates
Returns properly formatted data with positive/negative indicators
Orders indices by importance (Nifty 50 first)
Mobile App Usage:

```javascript
// Dashboard calls this to display Nifty cards
const response = await fetch("/api/stocks/nifty-indices");
```

2. 📍 URL: GET/POST /api/stocks/recommendations

Purpose: Manages stock recommendations for different alert times

Key Features:

GET: Fetches recommendations filtered by:
alert_time (10_AM or 2_PM)
date (specific date)
limit (number of results)

POST: Creates multiple new recommendations
Includes confidence scores, timeframes, and detailed reasoning
Assigns background colors based on recommendation type and sector
Mobile App Usage:

```javascript
// Recommendations screen calls this
const response = await fetch(
  `/api/stocks/recommendations?alert_time=10_AM&limit=5`
);
```

3. 📍 URL: GET/POST /api/stocks/analysis

Purpose: Provides comprehensive market analysis data

Key Features:

GET: Returns market sentiment, sector performance, technical indicators, key levels
POST: Updates market analysis with new sentiment data
Calculates support/resistance levels based on current Nifty value
Provides bullish/bearish sentiment percentages
Mobile App Usage:

```python
// Analysis screen calls this
const response = await fetch('/api/stocks/analysis');
```

4. 📍 URL: POST /api/stocks/real-time-update

Purpose: Handles real-time data updates and recommendation generation

Key Features:

Action: 'generate_recommendations': Creates new smart recommendations
Uses different strategies for morning vs afternoon
Ensures sector diversification
Applies technical analysis (RSI, MACD, momentum)
Sends notifications to users

Action: 'update_market_data': Simulates real-time market updates
Updates Nifty indices with random changes
Updates individual stock prices
Modifies technical indicators

Mobile App Usage:

```javascript
// Dashboard "Generate New" button calls this
const response = await fetch("/api/stocks/real-time-update", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "generate_recommendations",
    alertTime: "10_AM",
  }),
});
```

5. 📍 URL: GET/POST /api/notifications

Purpose: Manages user notifications and preferences

Key Features:

GET: Fetches user preferences and notification history
POST: Supports multiple types:
send_notification: Creates new notifications
update_preferences: Updates user alert settings
mark_as_read: Marks notifications as read

Mobile App Usage:

```javascript
// Notifications screen calls this
const response = await fetch(
  "/api/notifications?user_id=default_user&limit=20"
);

// Profile screen calls this to update preferences
const response = await fetch("/api/notifications", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "update_preferences",
    morningAlertsEnabled: true,
    afternoonAlertsEnabled: false,
  }),
});
```

🔄 API Data Flow

Dashboard Screen Flow:

fetchNiftyData() → /api/stocks/nifty-indices (GET)
fetchRecommendations() → /api/stocks/recommendations (GET)
updateMarketData() → /api/stocks/real-time-update (POST)
generateRecommendations() → /api/stocks/real-time-update (POST)
Analysis Screen Flow:
fetchMarketAnalysis() → /api/stocks/analysis (GET)

Recommendations Screen Flow:

fetchRecommendations() → /api/stocks/recommendations (GET)
generateRecommendations() → /api/stocks/real-time-update (POST)

Notifications Screen Flow:

Load preferences and history → /api/notifications (GET)
Update preferences → /api/notifications (POST)
Mark as read → /api/notifications (POST)

📊 Database Tables Used:

nifty_indices - Live index data
stocks - Individual stock information
stock_recommendations - Generated recommendations
market_analysis - Sentiment and market data
technical_indicators - RSI, MACD, moving averages
sector_performance - Sector-wise analysis
user_preferences - User notification settings
notification_history - All sent notifications

🔧 Smart Features:

Recommendation Engine:
Morning Strategy (10_AM): Focus on momentum, breakouts, technical analysis
Afternoon Strategy (2_PM): Focus on swing trades, reversals, volume analysis
Sector Diversification: Ensures picks from different Nifty groups
Confidence Scoring: 60-95% based on multiple technical factors

Real-Time Updates:
Auto-refresh: Every 5 minutes during market hours

Market Simulation: Realistic price movements and volume changes

Technical Indicators: Dynamic RSI and MACD calculations

This backend structure provides a complete foundation for a professional investment app with real-time data, smartrecommendations, and comprehensive market analysis!

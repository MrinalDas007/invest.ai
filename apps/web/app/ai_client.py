import json
from typing import List
from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


async def generate_recommendation_reasoning(prompt: str) -> str:
    """
    Wrapper using Gemini (Google Generative AI).
    """
    if not GEMINI_API_KEY:
        # Fallback for offline dev
        return "Offline simulation: recommendation based on RSI and momentum signals."

    try:
        # Use the Gemini 2.5 Flash (fast) or 2.5 Pro (more accurate)
        model = genai.GenerativeModel("gemini-2.5-flash")

        # Call the model
        response = model.generate_content(prompt)

        # Return plain text reasoning
        return response.text.strip()
    except Exception as e:
        return f"Gemini error: {str(e)}"


def safe_parse_json(text: str):
    """Ensure Gemini output is valid JSON"""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to fix common issues like trailing commas or code fences
        text = text.strip().strip("`")
        if text.startswith("json"):
            text = text[4:]
        try:
            return json.loads(text)
        except Exception:
            return {"error": "Invalid JSON from Gemini", "raw": text}


async def fetch_market_snapshot() -> dict:
    """
    Fetch market-wide snapshot (indices, sentiment, sectors)
    """
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not set"}

    prompt = """
    You are a financial AI assistant.  
    Generate a plausible real-time snapshot of the Indian stock market for all nifty indices and all sectors.  
    Return ONLY valid JSON.  

    Schema:
    {
    "nifty_indices": [
        {
        "name": "string (e.g., NIFTY 50, NIFTY BANK, NIFTY IT, NIFTY PHARMA, NIFTY FMCG, NIFTY AUTO, NIFTY METAL, NIFTY ENERGY, NIFTY REALTY, NIFTY PSU BANK)",
        "current_value": float,
        "change_value": float,
        "change_percent": float
        }
    ],
    "sentiment": {
        "bullish_sentiment": float (0-100),
        "bearish_sentiment": float (0-100),
        "market_trend": "Bullish" | "Bearish" | "Neutral",
        "fear_greed_index": float (0-100),
        "volatility_index": float
    },
    "sectors": [
        {
        "sector_name": "string",
        "performance_percent": float,
        "trend": "positive" | "negative",
        "market_cap": float
        }
    ]
    }
    """

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return safe_parse_json(response.text)
    except Exception as e:
        return {"error": f"Gemini error: {str(e)}"}


async def fetch_stock_recommendations() -> dict:
    """
    Fetch stock-specific recommendations with technical indicators
    """
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not set"}

    prompt = """
    You are a financial AI assistant.  
    Generate plausible 5 stock recommendations for Indian equities.  
    Return ONLY valid JSON.  

    Schema:
    {
    "stocks": [
        {
        "ticker": "string (e.g., INFY, TCS, HDFCBANK)",
        "company_name": "string",
        "sector": "string",
        "current_price": float,
        "target_price": float,
        "recommendation": "BUY" | "SELL" | "HOLD",
        "confidence_score": float (0-1),
        "timeframe": "string (e.g., '1-3 Months', '1-2 Weeks')",
        "reasons": "short explanation why recommendation is made"
        }
    ]
    }
    """

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return safe_parse_json(response.text)
    except Exception as e:
        return {"error": f"Gemini error: {str(e)}"}


async def fetch_stock_prices(tickers: List[str]) -> dict:
    """
    Fetch the current stock price for a given ticker symbol.
    """
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not set"}

    prompt = """
    You are a financial data assistant. 
    The user will provide a list of Indian stock tickers. 
    Your task is to:

    1. Fetch the **latest live price** for each ticker symbol.
    2. Return the result **strictly as a valid JSON array**, no extra text, in the format below:
    Schema:
    {
        "stock_prices": [
        {
        "ticker": "string (e.g., INFY, AAPL, MSFT)",
        "current_price": float,
        }
    ]
    }

    3. Do not include explanations, markdown, or additional commentary — only the JSON output.

    Now, return the updated stock prices for the following tickers: {tickers}
    """

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return safe_parse_json(response.text)
    except Exception as e:
        return {"error": f"Gemini error: {str(e)}"}

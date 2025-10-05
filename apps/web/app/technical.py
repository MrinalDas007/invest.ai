import pandas as pd
import numpy as np


def rsi(series, period=14):
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    ma_up = up.rolling(window=period, min_periods=1).mean()
    ma_down = down.rolling(window=period, min_periods=1).mean()
    rs = ma_up / (ma_down + 1e-8)
    return 100 - (100 / (1 + rs))


def moving_average(series, period=20):
    return series.rolling(window=period, min_periods=1).mean()


def support_resistance(current_value, volatility=0.01):
    """
    simple pivot-like levels based on percent steps
    """
    levels = {
        "support1": current_value * (1 - volatility),
        "support2": current_value * (1 - volatility * 2),
        "resistance1": current_value * (1 + volatility),
        "resistance2": current_value * (1 + volatility * 2),
    }
    return levels

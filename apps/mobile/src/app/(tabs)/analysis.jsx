import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  RotateCcw,
} from "lucide-react-native";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";

const { width } = Dimensions.get("window");

export default function Analysis() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [activeTimeframe, setActiveTimeframe] = useState("1D");
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
  });

  const timeframes = ["1D", "1W", "1M", "3M", "1Y"];

  // Fetch market analysis data
  const fetchMarketAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://p09ns6pb-4000.inc1.devtunnels.ms/api/stocks/analysis"
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch market analysis: ${response.status}`);
      }
      const data = await response.json();
      if (data) {
        setMarketAnalysis(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch market analysis");
      }
    } catch (error) {
      console.error("Error fetching market analysis:", error);
      setError("Failed to load market analysis");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMarketAnalysis();
  }, []);

  const handleTimeframePress = (timeframe) => {
    setActiveTimeframe(timeframe);
    // In a real implementation, this would fetch data for the selected timeframe
  };

  const handleSectorPress = (sector) => {
    Alert.alert(
      sector.name,
      `Performance: ${sector.performance}\nTrend: ${sector.trend}`
    );
  };

  const handleRefresh = () => {
    fetchMarketAnalysis();
  };

  if (!fontsLoaded) {
    return null;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Market Analysis" />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontFamily: "Roboto_500Medium",
              fontSize: 16,
            }}
          >
            Loading market analysis...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Market Analysis" />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              color: theme.colors.error,
              fontFamily: "Roboto_500Medium",
              fontSize: 16,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
            }}
            onPress={handleRefresh}
          >
            <Text
              style={{
                color: "#000000",
                fontFamily: "Roboto_600SemiBold",
                fontSize: 14,
              }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Market Analysis" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Chart Placeholder */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 16,
              height: 200,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BarChart3 size={48} color={theme.colors.textTertiary} />
            <Text
              style={{
                fontFamily: "Roboto_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Nifty 50 Chart
            </Text>
            <Text
              style={{
                fontFamily: "Roboto_400Regular",
                fontSize: 14,
                color: theme.colors.textSecondary,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Interactive chart coming soon
            </Text>
          </View>

          {/* Timeframe Selector */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 16,
              gap: 8,
            }}
          >
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={{
                  backgroundColor:
                    activeTimeframe === timeframe
                      ? theme.colors.primary
                      : theme.colors.card,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
                onPress={() => handleTimeframePress(timeframe)}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontFamily: "Roboto_500Medium",
                    fontSize: 14,
                    color:
                      activeTimeframe === timeframe
                        ? "#000000"
                        : theme.colors.text,
                  }}
                >
                  {timeframe}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Market Sentiment */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                fontFamily: "Roboto_700Bold",
                fontSize: 18,
                color: theme.colors.text,
                marginBottom: 16,
              }}
            >
              Market Sentiment
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 12,
                padding: 8,
              }}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <RotateCcw size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <TrendingUp size={16} color={theme.colors.success} />
                  <Text
                    style={{
                      fontFamily: "Roboto_600SemiBold",
                      fontSize: 20,
                      color: theme.colors.success,
                      marginLeft: 4,
                    }}
                  >
                    {marketAnalysis?.bullish_sentiment || 0}%
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Roboto_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Bullish
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <TrendingDown size={16} color={theme.colors.error} />
                  <Text
                    style={{
                      fontFamily: "Roboto_600SemiBold",
                      fontSize: 20,
                      color: theme.colors.error,
                      marginLeft: 4,
                    }}
                  >
                    {marketAnalysis?.bearish_sentiment || 0}%
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Roboto_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Bearish
                </Text>
              </View>
            </View>
            {/* Sentiment Bar */}
            <View
              style={{
                height: 8,
                backgroundColor: theme.colors.background,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${marketAnalysis?.bullish_sentiment || 50}%`,
                  backgroundColor: theme.colors.success,
                }}
              />
            </View>
          </View>
        </View>

        {/* Sector Performance */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Sector Performance
          </Text>
          {marketAnalysis?.sectors?.map((sector, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onPress={() => handleSectorPress(sector)}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontFamily: "Roboto_600SemiBold",
                  fontSize: 16,
                  color: theme.colors.text,
                }}
              >
                {sector.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {sector.trend === "positive" ? (
                  <TrendingUp size={16} color={theme.colors.success} />
                ) : (
                  <TrendingDown size={16} color={theme.colors.error} />
                )}
                <Text
                  style={{
                    fontFamily: "Roboto_600SemiBold",
                    fontSize: 14,
                    color:
                      sector.trend === "positive"
                        ? theme.colors.success
                        : theme.colors.error,
                    marginLeft: 4,
                  }}
                >
                  {sector.performance}
                </Text>
              </View>
            </TouchableOpacity>
          )) || (
            <Text
              style={{
                color: theme.colors.textSecondary,
                textAlign: "center",
                padding: 20,
                fontFamily: "Roboto_400Regular",
              }}
            >
              No sector data available
            </Text>
          )}
        </View>

        {/* Technical Indicators */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Technical Indicators
          </Text>

          {marketAnalysis?.technicalIndicators?.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View
                style={{
                  flexDirection: "column",
                  backgroundColor: "#1E1E1E",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                {/* Table Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingBottom: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Roboto_500Medium",
                      width: 80,
                      color: theme.colors.text,
                    }}
                  >
                    Ticker
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Roboto_500Medium",
                      width: 60,
                      color: theme.colors.text,
                    }}
                  >
                    RSI-14
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Roboto_500Medium",
                      width: 60,
                      color: theme.colors.text,
                    }}
                  >
                    MACD
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Roboto_500Medium",
                      width: 80,
                      color: theme.colors.text,
                    }}
                  >
                    MA-50
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Roboto_500Medium",
                      width: 80,
                      color: theme.colors.text,
                    }}
                  >
                    MA-200
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Roboto_500Medium",
                      width: 80,
                      color: theme.colors.text,
                    }}
                  >
                    Boll Upper
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Roboto_500Medium",
                      width: 80,
                      color: theme.colors.text,
                    }}
                  >
                    Boll Lower
                  </Text>
                </View>

                {/* Table Rows */}
                {marketAnalysis.technicalIndicators.map((indicator, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 8,
                      borderBottomWidth:
                        index < marketAnalysis.technicalIndicators.length - 1
                          ? 1
                          : 0,
                      borderBottomColor: theme.colors.border,
                      color: theme.colors.text,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Roboto_500Medium",
                        width: 80,
                        color: theme.colors.text,
                      }}
                    >
                      {indicator.ticker}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Roboto_400Regular",
                        width: 60,
                        color: theme.colors.text,
                      }}
                    >
                      {indicator.rsi || "N/A"}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Roboto_400Regular",
                        width: 60,
                        color: theme.colors.text,
                      }}
                    >
                      {indicator.macd || "N/A"}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Roboto_400Regular",
                        width: 80,
                        color: theme.colors.text,
                      }}
                    >
                      {indicator.moving_avg_50 || "N/A"}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Roboto_400Regular",
                        width: 80,
                        color: theme.colors.text,
                      }}
                    >
                      {indicator.moving_avg_200 || "N/A"}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Roboto_400Regular",
                        width: 80,
                        color: theme.colors.text,
                      }}
                    >
                      {indicator.bollinger_upper || "N/A"}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Roboto_400Regular",
                        width: 80,
                        color: theme.colors.text,
                      }}
                    >
                      {indicator.bollinger_lower || "N/A"}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Text
              style={{
                color: theme.colors.textSecondary,
                textAlign: "center",
                padding: 20,
                fontFamily: "Roboto_400Regular",
              }}
            >
              No technical indicators available
            </Text>
          )}
        </View>

        {/* Key Levels */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Key Support & Resistance
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Roboto_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Support
                </Text>
                <Text
                  style={{
                    fontFamily: "Roboto_700Bold",
                    fontSize: 16,
                    color: theme.colors.success,
                  }}
                >
                  {marketAnalysis?.keyLevels?.support || "N/A"}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Roboto_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Current
                </Text>
                <Text
                  style={{
                    fontFamily: "Roboto_700Bold",
                    fontSize: 16,
                    color: theme.colors.text,
                  }}
                >
                  {marketAnalysis?.market_trend || "N/A"}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Roboto_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Resistance
                </Text>
                <Text
                  style={{
                    fontFamily: "Roboto_700Bold",
                    fontSize: 16,
                    color: theme.colors.error,
                  }}
                >
                  {marketAnalysis?.keyLevels?.resistance || "N/A"}
                </Text>
              </View>
            </View>
            {/* Price Range Bar */}
            <View
              style={{
                height: 8,
                backgroundColor: theme.colors.background,
                borderRadius: 4,
                position: "relative",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  left: "45%",
                  top: 0,
                  width: 8,
                  height: 8,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Filter,
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
import StockRecommendationCard from "@/components/StockRecommendationCard";

export default function Recommendations() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTimeSlot, setActiveTimeSlot] = useState("10_AM");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
  });

  const timeSlots = [
    { id: "10_AM", label: "10:00 AM", icon: "morning" },
    { id: "2_PM", label: "2:00 PM", icon: "afternoon" },
  ];

  // Fetch recommendations based on selected time slot
  const fetchRecommendations = async (timeSlot = activeTimeSlot) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://p09ns6pb-4000.inc1.devtunnels.ms/api/stocks/recommendations?alert_time=${timeSlot}&limit=10`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        setRecommendations(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch recommendations");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Generate new recommendations for the selected time slot
  const generateRecommendations = async (timeSlot) => {
    try {
      const response = await fetch(
        "https://p09ns6pb-4000.inc1.devtunnels.ms/api/stocks/real-time-update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "generate_recommendations",
            alertTime: timeSlot,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to generate recommendations: ${response.status}`
        );
      }

      const data = await response.json();
      if (data) {
        Alert.alert("Success", data.message);
        fetchRecommendations(timeSlot); // Refresh the recommendations
      } else {
        throw new Error(data.error || "Failed to generate recommendations");
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      Alert.alert("Error", "Failed to generate new recommendations");
    }
  };

  // Load initial data
  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Refresh recommendations when time slot changes
  useEffect(() => {
    if (activeTimeSlot) {
      fetchRecommendations(activeTimeSlot);
    }
  }, [activeTimeSlot]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRecommendations(activeTimeSlot);
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTimeSlotPress = (timeSlot) => {
    setActiveTimeSlot(timeSlot);
  };

  const handleStockPress = (stock) => {
    Alert.alert(
      `${stock.ticker} - ${stock.recommendation}`,
      `${stock.company_name}\n\nCurrent Price: ₹${stock.current_price}\nTarget Price: ₹${stock.target_price}\nConfidence: ${stock.confidence_score}%\nTimeframe: ${stock.timeframe}\n\nAnalysis:\n${stock.reasons}`,
      [{ text: "OK", style: "default" }]
    );
  };

  const handleGenerateNew = () => {
    const timeLabel = activeTimeSlot === "10_AM" ? "morning" : "afternoon";
    Alert.alert(
      "Generate New Recommendations",
      `Generate new ${timeLabel} stock recommendations for today?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: () => generateRecommendations(activeTimeSlot),
        },
      ]
    );
  };

  const getRecommendationStats = () => {
    if (!recommendations || recommendations.length === 0) {
      return { buy: 0, sell: 0, hold: 0 };
    }

    return recommendations.reduce(
      (stats, rec) => {
        if (rec.recommendation === "BUY") stats.buy++;
        else if (rec.recommendation === "SELL") stats.sell++;
        else if (rec.recommendation === "HOLD") stats.hold++;
        return stats;
      },
      { buy: 0, sell: 0, hold: 0 }
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  const stats = getRecommendationStats();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Stock Recommendations" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Time Slot Selector */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Daily Alert Times
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={{
                  flex: 1,
                  backgroundColor:
                    activeTimeSlot === slot.id
                      ? theme.colors.primary
                      : theme.colors.card,
                  borderRadius: 16,
                  padding: 16,
                  alignItems: "center",
                }}
                onPress={() => handleTimeSlotPress(slot.id)}
                activeOpacity={0.8}
              >
                <Clock
                  size={24}
                  color={
                    activeTimeSlot === slot.id ? "#000000" : theme.colors.text
                  }
                />
                <Text
                  style={{
                    fontFamily: "Roboto_600SemiBold",
                    fontSize: 16,
                    color:
                      activeTimeSlot === slot.id
                        ? "#000000"
                        : theme.colors.text,
                    marginTop: 8,
                  }}
                >
                  {slot.label}
                </Text>
                <Text
                  style={{
                    fontFamily: "Roboto_400Regular",
                    fontSize: 12,
                    color:
                      activeTimeSlot === slot.id
                        ? "rgba(0, 0, 0, 0.7)"
                        : theme.colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  {slot.icon === "morning"
                    ? "Morning Alert"
                    : "Afternoon Alert"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Summary */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
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
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: "Roboto_600SemiBold",
                  fontSize: 16,
                  color: theme.colors.text,
                }}
              >
                Today's Recommendations
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={handleGenerateNew}
                activeOpacity={0.8}
              >
                <Zap size={14} color="#000000" />
                <Text
                  style={{
                    fontFamily: "Roboto_500Medium",
                    fontSize: 12,
                    color: "#000000",
                    marginLeft: 4,
                  }}
                >
                  Generate New
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
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
                      fontFamily: "Roboto_700Bold",
                      fontSize: 18,
                      color: theme.colors.success,
                      marginLeft: 4,
                    }}
                  >
                    {stats.buy}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Roboto_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Buy
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
                      fontFamily: "Roboto_700Bold",
                      fontSize: 18,
                      color: theme.colors.error,
                      marginLeft: 4,
                    }}
                  >
                    {stats.sell}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Roboto_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Sell
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
                  <Filter size={16} color={theme.colors.textSecondary} />
                  <Text
                    style={{
                      fontFamily: "Roboto_700Bold",
                      fontSize: 18,
                      color: theme.colors.text,
                      marginLeft: 4,
                    }}
                  >
                    {stats.hold}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Roboto_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Hold
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Error State */}
        {error && (
          <View
            style={{
              backgroundColor: theme.colors.error,
              padding: 12,
              marginHorizontal: 20,
              marginBottom: 16,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontFamily: "Roboto_500Medium",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Recommendations List */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            {activeTimeSlot === "10_AM" ? "Morning" : "Afternoon"} Picks
          </Text>

          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontFamily: "Roboto_500Medium",
                  fontSize: 16,
                }}
              >
                Loading recommendations...
              </Text>
            </View>
          ) : recommendations.length === 0 ? (
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 16,
                padding: 32,
                alignItems: "center",
              }}
            >
              <Clock size={48} color={theme.colors.textTertiary} />
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontFamily: "Roboto_600SemiBold",
                  fontSize: 16,
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                No recommendations available
              </Text>
              <Text
                style={{
                  color: theme.colors.textTertiary,
                  fontFamily: "Roboto_400Regular",
                  fontSize: 14,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Tap "Generate New" to create recommendations for{" "}
                {activeTimeSlot === "10_AM" ? "morning" : "afternoon"}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {recommendations.map((stock, index) => (
                <View key={stock.id || index} style={{ width: "100%" }}>
                  <StockRecommendationCard
                    ticker={stock.ticker}
                    company={stock.company_name}
                    sector={stock.sector}
                    price={stock.current_price}
                    target={stock.target_price}
                    recommendation={stock.recommendation}
                    confidence={stock.confidence_score}
                    timeframe={stock.timeframe}
                    reasons={stock.reasons}
                    backgroundColor={stock.backgroundColor}
                    onPress={() => handleStockPress(stock)}
                    style={{ width: "100%" }}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer Info */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Roboto_600SemiBold",
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              📊 Analysis Based On:
            </Text>
            <Text
              style={{
                fontFamily: "Roboto_400Regular",
                fontSize: 12,
                color: theme.colors.textSecondary,
                lineHeight: 18,
              }}
            >
              • Technical indicators (RSI, MACD, Moving Averages){"\n"}• Market
              sentiment and sector performance{"\n"}• Volume analysis and price
              momentum{"\n"}• Fundamental analysis and news impact
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

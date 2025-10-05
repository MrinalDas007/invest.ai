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
import { Bell, RotateCcw, Clock } from "lucide-react-native";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import NiftyCard from "@/components/NiftyCard";
import StockRecommendationCard from "@/components/StockRecommendationCard";

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [niftyData, setNiftyData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
  });

  // Fetch Nifty indices data
  const fetchNiftyData = async () => {
    try {
      const response = await fetch(
        "https://p09ns6pb-4000.inc1.devtunnels.ms/api/stocks/nifty-indices"
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch Nifty data: ${response.status}`);
      }
      const data = await response.json();
      if (data) {
        setNiftyData(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch Nifty data");
      }
    } catch (error) {
      console.error("Error fetching Nifty data:", error);
      setError("Failed to load market data");
    }
  };

  // Fetch today's recommendations
  const fetchRecommendations = async () => {
    try {
      const currentHour = new Date().getHours();
      let alert_time = "";

      // Determine which recommendations to show based on current time
      if (currentHour >= 10 && currentHour < 14) {
        alert_time = "10_AM";
      } else if (currentHour >= 14) {
        alert_time = "2_PM";
      } else {
        // Before 10 AM, show yesterday's 2 PM recommendations
        alert_time = "2_PM";
      }

      const response = await fetch(
        `https://p09ns6pb-4000.inc1.devtunnels.ms/api/stocks/recommendations?alert_time=${alert_time}&limit=5`
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
    }
  };

  // Generate new recommendations (simulates the scheduled task)
  const generateRecommendations = async (alert_time) => {
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
            alert_time: alert_time,
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
        fetchRecommendations(); // Refresh the recommendations
      } else {
        throw new Error(data.error || "Failed to generate recommendations");
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      Alert.alert("Error", "Failed to generate new recommendations");
    }
  };

  // Update market data (simulates real-time data feed)
  const updateMarketData = async () => {
    try {
      const response = await fetch(
        "https://p09ns6pb-4000.inc1.devtunnels.ms/api/stocks/real-time-update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "update_market_data",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update market data: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        fetchNiftyData(); // Refresh the Nifty data
        setLastUpdate(new Date());
      } else {
        throw new Error(data.error || "Failed to update market data");
      }
    } catch (error) {
      console.error("Error updating market data:", error);
      Alert.alert("Error", "Failed to update market data");
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchNiftyData(), fetchRecommendations()]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-refresh data every 5 minutes during market hours
  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();

      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60; // minutes
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istTime = new Date(utc + istOffset * 60000);

      const openTime = new Date(istTime);
      openTime.setHours(9, 15, 0, 0);

      const closeTime = new Date(istTime);
      closeTime.setHours(15, 30, 0, 0);

      setIsMarketOpen(istTime >= openTime && istTime <= closeTime);
    };

    // Check immediately
    checkMarketStatus();

    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();

      // Only auto-refresh during market hours (9 AM to 4 PM IST)
      if (currentHour >= 9 && currentHour <= 16) {
        checkMarketStatus();
        updateMarketData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(offsetY > 10);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);

    try {
      await Promise.all([updateMarketData(), fetchRecommendations()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotificationPress = () => {
    Alert.alert("Notifications", "You have 3 new stock alerts");
  };

  const handleStockPress = (stock) => {
    Alert.alert(
      stock.ticker,
      `${stock.company_name}\nRecommendation: ${stock.recommendation}\nTarget: ₹${stock.target_price}\nConfidence: ${stock.confidence_score}%\n\nReasons: ${stock.reasons}`
    );
  };

  const handleNiftyPress = (nifty) => {
    Alert.alert(
      nifty.name,
      `Current value: ${nifty.current_value}\nChange: ${nifty.change_value} (${nifty.change_percent})`
    );
  };

  const getNextAlertTime = () => {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < 10) {
      return "10:00 AM";
    } else if (currentHour < 14) {
      return "2:00 PM";
    } else {
      return "Tomorrow 10:00 AM";
    }
  };

  const generateNewRecommendations = () => {
    const now = new Date();
    const currentHour = now.getHours();

    let alert_time = "10_AM";
    if (currentHour >= 14) {
      alert_time = "2_PM";
    }

    Alert.alert(
      "Generate Recommendations",
      `Generate new ${
        alert_time === "10_AM" ? "morning" : "afternoon"
      } stock recommendations?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: () => generateRecommendations(alert_time),
        },
      ]
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Fixed Header */}
      <ScreenHeader showBorder={showHeaderBorder}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: "Roboto_400Regular",
                fontSize: 12,
                color: theme.colors.textTertiary,
              }}
            >
              Market Dashboard
            </Text>
            <Text
              style={{
                fontFamily: "Roboto_700Bold",
                fontSize: 18,
                color: theme.colors.text,
              }}
            >
              Live Market Data
            </Text>
          </View>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.colors.card,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleNotificationPress}
            activeOpacity={0.8}
          >
            <Bell size={18} color={theme.colors.text} />
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.colors.error,
              }}
            />
          </TouchableOpacity>
        </View>
      </ScreenHeader>

      {error && (
        <View
          style={{
            backgroundColor: theme.colors.error,
            padding: 12,
            marginHorizontal: 20,
            marginTop: 16,
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Market Status */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Roboto_600SemiBold",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                Market Status
              </Text>
              <Text
                style={{
                  fontFamily: "Roboto_400Regular",
                  fontSize: 14,
                  color: isMarketOpen
                    ? theme.colors.success
                    : theme.colors.error,
                }}
              >
                {isMarketOpen ? "Open" : "Closed"} • 9:15 AM - 3:30 PM IST
              </Text>
            </View>
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
        </View>

        {/* Nifty Indices */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Nifty Indices
          </Text>
          {loading ? (
            <Text
              style={{
                color: theme.colors.textSecondary,
                textAlign: "center",
                padding: 20,
              }}
            >
              Loading market data...
            </Text>
          ) : (
            niftyData.map((nifty, index) => (
              <NiftyCard
                key={index}
                name={nifty.name}
                value={nifty.current_value}
                change={nifty.change_value}
                changePercent={nifty.change_percent}
                isPositive={nifty.isPositive}
                onPress={() => handleNiftyPress(nifty)}
              />
            ))
          )}
        </View>

        {/* Today's Recommendations */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Roboto_700Bold",
                fontSize: 18,
                color: theme.colors.text,
              }}
            >
              Today's Top Picks
            </Text>
            <TouchableOpacity onPress={generateNewRecommendations}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Clock size={14} color={theme.colors.textTertiary} />
                <Text
                  style={{
                    fontFamily: "Roboto_400Regular",
                    fontSize: 12,
                    color: theme.colors.textTertiary,
                    marginLeft: 4,
                  }}
                >
                  Last updated:{" "}
                  {lastUpdate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            decelerationRate="fast"
            snapToAlignment="start"
            snapToInterval={292}
          >
            {loading ? (
              <Text style={{ color: theme.colors.textSecondary, padding: 20 }}>
                Loading recommendations...
              </Text>
            ) : recommendations.length === 0 ? (
              <Text style={{ color: theme.colors.textSecondary, padding: 20 }}>
                No recommendations available. Tap the clock to generate new
                ones.
              </Text>
            ) : (
              recommendations.map((stock) => (
                <StockRecommendationCard
                  key={stock.id}
                  ticker={stock.ticker}
                  company={stock.company_name}
                  sector={stock.sector}
                  price={stock.current_price}
                  target={stock.target_price}
                  recommendation={stock.recommendation}
                  confidence={stock.confidence_score}
                  timeframe={stock.timeframe}
                  reasons={stock.reasons}
                  backgroundColor={theme.colors.card}
                  onPress={() => handleStockPress(stock)}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Next Alert Time */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Roboto_600SemiBold",
                fontSize: 16,
                color: "#000000",
                marginBottom: 4,
              }}
            >
              Next Alert
            </Text>
            <Text
              style={{
                fontFamily: "Roboto_700Bold",
                fontSize: 20,
                color: "#000000",
              }}
            >
              {getNextAlertTime()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

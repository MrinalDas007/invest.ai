import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RotateCcw, Plus } from "lucide-react-native";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";

export default function Portfolio() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [portfolio, setPortfolio] = useState(null);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [ticker, setTicker] = useState("");
  const [stockCompanyName, setStockCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [niftyGroup, setNiftyGroup] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [volume, setVolume] = useState("");

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
  });

  const fetchPortfolio = async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);

      const response = await fetch(
        "https://invest-ai-1ic7.onrender.com/api/stock/portfolio"
      );
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const data = await response.json();
      setPortfolio(data);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setError("Failed to load portfolio");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchPortfolio()]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(offsetY > 10);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);

    try {
      await Promise.all([fetchPortfolio()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddition = () => {
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (
      !ticker ||
      !stockCompanyName ||
      !volume ||
      !buyPrice ||
      !currentPrice ||
      !niftyGroup ||
      !sector
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const payload = {
      ticker: ticker,
      company_name: stockCompanyName,
      sector: sector,
      nifty_group: niftyGroup,
      buy_price: parseFloat(buyPrice),
      current_price: parseFloat(currentPrice),
      volume: parseInt(volume, 10),
    };

    try {
      const response = await fetch(
        "https://invest-ai-1ic7.onrender.com/api/stock/portfolio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const data = await response.json();
      if (data) {
        Alert.alert("Success", data.message);
      } else {
        Alert.alert("Error", "Failed to add stock");
      }
      setModalVisible(false);
      // reset form
      setTicker("");
      setStockCompanyName("");
      setSector("");
      setNiftyGroup("");
      setBuyPrice("");
      setCurrentPrice("");
      setVolume("");
      await fetchPortfolio();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add stock");
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  if (!portfolio)
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
                  fontFamily: "Roboto_700Bold",
                  fontSize: 18,
                  color: theme.colors.text,
                }}
              >
                Portfolio
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
          <Text
            style={{
              color: theme.colors.textSecondary,
              textAlign: "center",
              padding: 20,
              fontFamily: "Roboto_400Regular",
            }}
          >
            No stock data available
          </Text>
        </ScrollView>
      </View>
    );

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
                fontFamily: "Roboto_700Bold",
                fontSize: 18,
                color: theme.colors.text,
              }}
            >
              Portfolio
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 12,
                padding: 8,
              }}
              onPress={handleAddition}
              activeOpacity={0.8}
            >
              <Plus size={18} color={theme.colors.text} />
            </TouchableOpacity>
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
        {/* Portfolio Summary */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "column",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: theme.colors.textSecondary,
                  marginBottom: 6,
                }}
              >
                Invested
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                ₹{portfolio.total_invested}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "column",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: theme.colors.textSecondary,
                  marginBottom: 6,
                }}
              >
                Current
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                ₹{portfolio.total_current}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                color: theme.colors.textSecondary,
                fontWeight: "500",
              }}
            >
              P&L:
            </Text>
            <Text
              style={{
                fontSize: 14,
                color:
                  portfolio.total_change >= 0
                    ? theme.colors.success
                    : theme.colors.error,
                fontWeight: "500",
              }}
            >
              {portfolio.total_change >= 0 ? "+" : ""}
              {portfolio.total_change} ({portfolio.total_change_percent}%)
            </Text>
          </View>
        </View>

        {/* Holdings */}
        <View style={{ marginHorizontal: 20 }}>
          {portfolio.data.map((stock, index) => (
            <View
              key={index}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {stock.ticker}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      stock.change_value >= 0
                        ? theme.colors.success
                        : theme.colors.error,
                  }}
                >
                  {stock.change_value >= 0 ? "+" : ""}
                  {stock.change_value}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                Qty. {stock.volume} • Avg. {stock.buy_price}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginBottom: 6,
                }}
              >
                Invested ₹{stock.invested_amount}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ fontSize: 12, color: theme.colors.textSecondary }}
                >
                  LTP ₹{stock.current_price}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color:
                      stock.change_percent >= 0
                        ? theme.colors.success
                        : theme.colors.error,
                  }}
                >
                  {stock.change_percent >= 0 ? "+" : ""}
                  {stock.change_percent}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: "90%",
              backgroundColor: theme.colors.background,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                marginBottom: 10,
                color: theme.colors.text,
              }}
            >
              Add Stock Holdings
            </Text>

            <Text style={{ color: theme.colors.textSecondary }}>
              Stock Ticker Name :
            </Text>

            <TextInput
              placeholder=""
              value={ticker}
              onChangeText={setTicker}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                marginBottom: 10,
                color: theme.colors.text,
              }}
            />

            <Text style={{ color: theme.colors.textSecondary }}>
              Stock Company Name :
            </Text>

            <TextInput
              placeholder=""
              value={stockCompanyName}
              onChangeText={setStockCompanyName}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                marginBottom: 10,
                color: theme.colors.text,
              }}
            />

            <Text style={{ color: theme.colors.textSecondary }}>Sector :</Text>

            <TextInput
              placeholder=""
              value={sector}
              onChangeText={setSector}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                marginBottom: 10,
                color: theme.colors.text,
              }}
            />

            <Text style={{ color: theme.colors.textSecondary }}>
              Nifty Group :
            </Text>

            <TextInput
              placeholder=""
              value={niftyGroup}
              onChangeText={setNiftyGroup}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                marginBottom: 20,
                color: theme.colors.text,
              }}
            />

            <Text style={{ color: theme.colors.textSecondary }}>
              Buy Price/Avg. Price :
            </Text>

            <TextInput
              placeholder=""
              value={buyPrice}
              onChangeText={setBuyPrice}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                marginBottom: 20,
                color: theme.colors.text,
              }}
            />

            <Text style={{ color: theme.colors.textSecondary }}>
              Current Price/LTP :
            </Text>

            <TextInput
              placeholder=""
              value={currentPrice}
              onChangeText={setCurrentPrice}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                marginBottom: 20,
                color: theme.colors.text,
              }}
            />

            <Text style={{ color: theme.colors.textSecondary }}>
              Stock Qty/Volume :
            </Text>

            <TextInput
              placeholder=""
              value={volume}
              onChangeText={setVolume}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                marginBottom: 20,
                color: theme.colors.text,
              }}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              style={{
                backgroundColor: theme.colors.primary,
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#1804fcff", fontWeight: "bold" }}>
                Submit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 10,
                padding: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.text }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

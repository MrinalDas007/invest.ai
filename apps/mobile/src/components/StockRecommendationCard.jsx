import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TrendingUp, TrendingDown, Star } from "lucide-react-native";
import { useTheme } from "@/utils/theme";

export default function StockRecommendationCard({
  ticker,
  company,
  sector,
  price,
  target,
  recommendation,
  confidence,
  timeframe,
  reasons,
  backgroundColor,
  onPress,
}) {
  const theme = useTheme();
  const isBuy = recommendation === "BUY";
  
  return (
    <TouchableOpacity
      style={{
        backgroundColor,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        width: 280,
        marginRight: 12,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 2,
            }}
          >
            {ticker}
          </Text>
          <Text
            style={{
              fontFamily: "Roboto_400Regular",
              fontSize: 14,
              color: theme.colors.textSecondary,
              marginBottom: 2,
            }}
          >
            {company}
          </Text>
          <Text
            style={{
              fontFamily: "Roboto_400Regular",
              fontSize: 12,
              color: theme.colors.textTertiary,
            }}
          >
            {sector}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <View
            style={{
              backgroundColor: isBuy ? theme.colors.success : theme.colors.error,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontFamily: "Roboto_600SemiBold",
                fontSize: 12,
                color: "#FFFFFF",
              }}
            >
              {recommendation}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Star size={12} color={theme.colors.warning} fill={theme.colors.warning} />
            <Text
              style={{
                fontFamily: "Roboto_500Medium",
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginLeft: 2,
              }}
            >
              {confidence}%
            </Text>
          </View>
        </View>
      </View>

      {/* Price Info */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text
              style={{
                fontFamily: "Roboto_400Regular",
                fontSize: 12,
                color: theme.colors.textTertiary,
              }}
            >
              Current Price
            </Text>
            <Text
              style={{
                fontFamily: "Roboto_700Bold",
                fontSize: 16,
                color: theme.colors.text,
              }}
            >
              ₹{price}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontFamily: "Roboto_400Regular",
                fontSize: 12,
                color: theme.colors.textTertiary,
              }}
            >
              Target
            </Text>
            <Text
              style={{
                fontFamily: "Roboto_700Bold",
                fontSize: 16,
                color: isBuy ? theme.colors.success : theme.colors.error,
              }}
            >
              ₹{target}
            </Text>
          </View>
        </View>
      </View>

      {/* Key Reasons */}
      <View style={{ marginBottom: 8 }}>
        <Text
          style={{
            fontFamily: "Roboto_600SemiBold",
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginBottom: 6,
          }}
        >
          Key Reasons:
        </Text>
        <Text
          style={{
            fontFamily: "Roboto_400Regular",
            fontSize: 12,
            color: theme.colors.textTertiary,
            lineHeight: 16,
          }}
        >
          {reasons}
        </Text>
      </View>

      {/* Timeframe */}
      <Text
        style={{
          fontFamily: "Roboto_500Medium",
          fontSize: 11,
          color: theme.colors.textTertiary,
        }}
      >
        Timeframe: {timeframe}
      </Text>
    </TouchableOpacity>
  );
}
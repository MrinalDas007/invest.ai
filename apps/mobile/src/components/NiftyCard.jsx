import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TrendingUp, TrendingDown } from "lucide-react-native";
import { useTheme } from "@/utils/theme";

export default function NiftyCard({
  name,
  value,
  change,
  changePercent,
  isPositive,
  onPress,
}) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Roboto_600SemiBold",
            fontSize: 16,
            color: theme.colors.text,
            marginBottom: 4,
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontFamily: "Roboto_700Bold",
            fontSize: 20,
            color: theme.colors.text,
          }}
        >
          {value}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          {isPositive ? (
            <TrendingUp size={16} color={theme.colors.success} strokeWidth={2} />
          ) : (
            <TrendingDown size={16} color={theme.colors.error} strokeWidth={2} />
          )}
          <Text
            style={{
              fontFamily: "Roboto_600SemiBold",
              fontSize: 14,
              color: isPositive ? theme.colors.success : theme.colors.error,
              marginLeft: 4,
            }}
          >
            {change}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: "Roboto_500Medium",
            fontSize: 12,
            color: isPositive ? theme.colors.success : theme.colors.error,
          }}
        >
          {changePercent}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
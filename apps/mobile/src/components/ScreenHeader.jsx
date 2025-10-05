import React from "react";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/utils/theme";

export default function ScreenHeader({ title, children, showBorder = true }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        }}
      >
        {children ? (
          children
        ) : (
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 24,
              color: theme.colors.text,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
        )}
      </View>
    </>
  );
}
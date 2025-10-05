import { useColorScheme } from "react-native";

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = {
    isDark,
    colors: {
      // Background colors
      background: isDark ? "#121212" : "#FFFFFF",
      surface: isDark ? "#1E1E1E" : "#FFFFFF",
      elevated: isDark ? "#262626" : "#F8F9FA",
      card: isDark ? "#1E1E1E" : "#F6F6F6",

      // Text colors
      text: isDark ? "#FFFFFF" : "#0D0D0D",
      textSecondary: isDark ? "rgba(255, 255, 255, 0.7)" : "#6B7280",
      textTertiary: isDark ? "rgba(255, 255, 255, 0.6)" : "#A1A1A1",

      // UI Elements
      border: isDark ? "#404040" : "#E5E7EB",
      inputBorder: isDark ? "#404040" : "#A1A1A1",

      // Brand colors (adjusted for dark mode)
      primary: isDark ? "#E8FF4A" : "#D4FF3D",
      success: isDark ? "#4AE85C" : "#35C759",
      error: isDark ? "#FF6B6B" : "#FF453A",
      warning: isDark ? "#FFD60A" : "#FF9500",

      // Tab bar
      tabBarBackground: isDark ? "#1E1E1E" : "#FFFFFF",
      tabBarBorder: isDark ? "#404040" : "#E5E7EB",
      tabBarActive: isDark ? "#FFFFFF" : "#000000",
      tabBarInactive: isDark ? "rgba(255, 255, 255, 0.6)" : "#9CA3AF",

      // Special colors
      portfolioBackground: isDark ? "#1A1A1A" : "#FFFFFF",
      notification: isDark ? "#FF6B6B" : "#FF453A",

      // Card backgrounds (for stock cards) - updated dark mode colors
      cardGreen: isDark ? "#2A2A2A" : "#D8F9DD",
      cardPurple: isDark ? "#2A2A2A" : "#CFC3FF",
      cardBlue: isDark ? "#2A2A2A" : "#E3F2FD",
      cardOrange: isDark ? "#2A2A2A" : "#FFE4B5",
      cardRed: isDark ? "#2A2A2A" : "#FFE4E1",
    },
  };

  return theme;
};
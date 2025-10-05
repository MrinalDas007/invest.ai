import React from "react";
import { View, Text, Alert, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Settings,
  Bell,
  HelpCircle,
  User,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react-native";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  const handleSettingsPress = () => {
    Alert.alert("Settings", "App settings coming soon");
  };

  const handleNotificationSettingsPress = () => {
    Alert.alert("Notification Settings", "Configure your alert preferences");
  };

  const handleHelpPress = () => {
    Alert.alert("Help & Support", "Need help? Contact our support team");
  };

  const handleAccountPress = () => {
    Alert.alert("Account", "Manage your account settings");
  };

  const handlePrivacyPress = () => {
    Alert.alert("Privacy & Security", "Your data privacy settings");
  };

  const handleAboutPress = () => {
    Alert.alert("About", "Stock Recommendation App v1.0\n\nBuilt with Anything");
  };

  if (!fontsLoaded) {
    return null;
  }

  const ProfileMenuItem = ({ icon, title, onPress, subtitle }) => (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Roboto_500Medium",
              fontSize: 16,
              color: theme.colors.text,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontFamily: "Roboto_400Regular",
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Profile" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 20,
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.colors.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <User size={40} color="#000000" />
          </View>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 24,
              color: theme.colors.text,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Investment Tracker
          </Text>
          <Text
            style={{
              fontFamily: "Roboto_400Regular",
              fontSize: 16,
              color: theme.colors.textSecondary,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Smart stock recommendations for better returns
          </Text>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Roboto_700Bold",
                  fontSize: 18,
                  color: theme.colors.success,
                }}
              >
                7
              </Text>
              <Text
                style={{
                  fontFamily: "Roboto_400Regular",
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                }}
              >
                Today's Picks
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Roboto_700Bold",
                  fontSize: 18,
                  color: theme.colors.text,
                }}
              >
                79%
              </Text>
              <Text
                style={{
                  fontFamily: "Roboto_400Regular",
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                }}
              >
                Avg Accuracy
              </Text>
            </View>
          </View>
        </View>

        {/* Alert Schedule */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Alert Schedule
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Clock size={20} color={theme.colors.success} />
              <Text
                style={{
                  fontFamily: "Roboto_600SemiBold",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginLeft: 12,
                }}
              >
                10:00 AM IST
              </Text>
              <Text
                style={{
                  fontFamily: "Roboto_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginLeft: 8,
                }}
              >
                • Morning Picks
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Clock size={20} color={theme.colors.warning} />
              <Text
                style={{
                  fontFamily: "Roboto_600SemiBold",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginLeft: 12,
                }}
              >
                2:00 PM IST
              </Text>
              <Text
                style={{
                  fontFamily: "Roboto_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginLeft: 8,
                }}
              >
                • Afternoon Update
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Menu */}
        <View>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Settings
          </Text>

          <ProfileMenuItem
            icon={<User size={20} color={theme.colors.text} />}
            title="Account"
            subtitle="Manage your account settings"
            onPress={handleAccountPress}
          />

          <ProfileMenuItem
            icon={<Bell size={20} color={theme.colors.text} />}
            title="Notifications"
            subtitle="Configure alert preferences"
            onPress={handleNotificationSettingsPress}
          />

          <ProfileMenuItem
            icon={<Shield size={20} color={theme.colors.text} />}
            title="Privacy & Security"
            subtitle="Data privacy and security settings"
            onPress={handlePrivacyPress}
          />

          <ProfileMenuItem
            icon={<Settings size={20} color={theme.colors.text} />}
            title="App Settings"
            subtitle="General app preferences"
            onPress={handleSettingsPress}
          />

          <ProfileMenuItem
            icon={<HelpCircle size={20} color={theme.colors.text} />}
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={handleHelpPress}
          />

          <ProfileMenuItem
            icon={<TrendingUp size={20} color={theme.colors.text} />}
            title="About"
            subtitle="App version and information"
            onPress={handleAboutPress}
          />
        </View>
      </ScrollView>
    </View>
  );
}
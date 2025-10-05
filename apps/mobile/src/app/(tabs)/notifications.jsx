import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
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

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [preferences, setPreferences] = useState({
    morning_alerts_enabled: true,
    afternoon_alerts_enabled: true,
    push_notifications_enabled: true,
    email_notifications_enabled: false,
    risk_tolerance: "medium",
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
  });

  // Fetch notification data and preferences
  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://p09ns6pb-4000.inc1.devtunnels.ms/api/notifications"
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch notification data: ${response.status}`
        );
      }

      const data = await response.json();
      if (data) {
        setPreferences(data.preferences);
        setNotifications(data.history);
      } else {
        throw new Error(data.error || "Failed to fetch notification data");
      }
    } catch (error) {
      console.error("Error fetching notification data:", error);
      setError("Failed to load notification data");
    } finally {
      setLoading(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (updatedPrefs) => {
    try {
      console.log("Sending prefs:", updatedPrefs);
      const response = await fetch(
        "https://p09ns6pb-4000.inc1.devtunnels.ms/api/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "update_preferences",
            user_id: "default_user",
            ...updatedPrefs,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update preferences: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        setPreferences((prev) => ({ ...prev, ...updatedPrefs }));
      } else {
        throw new Error(data.error || "Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      Alert.alert("Error", "Failed to update notification preferences");
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        "https://p09ns6pb-4000.inc1.devtunnels.ms/api/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "mark_as_read",
            notificationId: notificationId,
          }),
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, read_at: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchNotificationData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotificationData();
    } catch (error) {
      console.error("Error refreshing notification data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }

    Alert.alert(notification.title, notification.message, [
      { text: "OK", style: "default" },
    ]);
  };

  const handlePreferenceChange = (key, value) => {
    const updates = { [key]: value };
    setPreferences((prev) => ({ ...prev, [key]: value }));
    updatePreferences(updates);
  };

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "stock_recommendation":
        return Bell;
      case "market_alert":
        return AlertCircle;
      case "system":
        return Settings;
      default:
        return Bell;
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 24,
              color: theme.colors.text,
            }}
          >
            Notifications
          </Text>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.colors.card,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <Settings size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </ScreenHeader>

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

        {/* Alert Settings */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Alert Settings
          </Text>

          {/* Push Notifications */}
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Bell size={20} color={theme.colors.text} />
                <Text
                  style={{
                    fontFamily: "Roboto_600SemiBold",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginLeft: 8,
                  }}
                >
                  Push Notifications
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Roboto_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                }}
              >
                Receive instant alerts for stock recommendations
              </Text>
            </View>
            <Switch
              value={preferences.push_notifications_enabled}
              onValueChange={(value) =>
                handlePreferenceChange("push_notifications_enabled", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                preferences.push_notifications_enabled
                  ? "#000000"
                  : theme.colors.textTertiary
              }
            />
          </View>

          {/* Morning Alerts */}
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Clock size={20} color={theme.colors.text} />
                <Text
                  style={{
                    fontFamily: "Roboto_600SemiBold",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginLeft: 8,
                  }}
                >
                  Morning Alerts (10:00 AM IST)
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Roboto_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                }}
              >
                Daily stock recommendations at market opening
              </Text>
            </View>
            <Switch
              value={preferences.morning_alerts_enabled}
              onValueChange={(value) =>
                handlePreferenceChange("morning_alerts_enabled", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                preferences.morning_alerts_enabled
                  ? "#000000"
                  : theme.colors.textTertiary
              }
            />
          </View>

          {/* Afternoon Alerts */}
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
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Clock size={20} color={theme.colors.text} />
                <Text
                  style={{
                    fontFamily: "Roboto_600SemiBold",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginLeft: 8,
                  }}
                >
                  Afternoon Alerts (2:00 PM IST)
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Roboto_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                }}
              >
                Mid-day market analysis and recommendations
              </Text>
            </View>
            <Switch
              value={preferences.afternoon_alerts_enabled}
              onValueChange={(value) =>
                handlePreferenceChange("afternoon_alerts_enabled", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                preferences.afternoon_alerts_enabled
                  ? "#000000"
                  : theme.colors.textTertiary
              }
            />
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: "Roboto_700Bold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Recent Alerts
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
                Loading notifications...
              </Text>
            </View>
          ) : notifications.length === 0 ? (
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 16,
                padding: 32,
                alignItems: "center",
              }}
            >
              <Bell size={48} color={theme.colors.textTertiary} />
              <Text
                style={{
                  fontFamily: "Roboto_600SemiBold",
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                No notifications yet
              </Text>
              <Text
                style={{
                  fontFamily: "Roboto_400Regular",
                  fontSize: 14,
                  color: theme.colors.textTertiary,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                You'll receive stock alerts here when available
              </Text>
            </View>
          ) : (
            notifications.map((notification) => {
              const IconComponent = getNotificationIcon(
                notification.notification_type
              );
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={{
                    backgroundColor: notification.read_at
                      ? theme.colors.card
                      : theme.colors.primary + "20",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: notification.read_at
                      ? theme.colors.border
                      : theme.colors.primary,
                  }}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.8}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: notification.read_at
                          ? theme.colors.background
                          : theme.colors.primary + "40",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <IconComponent
                        size={20}
                        color={
                          notification.read_at
                            ? theme.colors.textSecondary
                            : theme.colors.primary
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: notification.isRead
                              ? "Roboto_500Medium"
                              : "Roboto_600SemiBold",
                            fontSize: 14,
                            color: theme.colors.text,
                            flex: 1,
                          }}
                        >
                          {notification.title}
                        </Text>
                        {!notification.read_at && (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.colors.primary,
                              marginLeft: 8,
                            }}
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          fontFamily: "Roboto_400Regular",
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                          lineHeight: 16,
                          marginBottom: 8,
                        }}
                      >
                        {notification.message}
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Clock size={12} color={theme.colors.textTertiary} />
                        <Text
                          style={{
                            fontFamily: "Roboto_400Regular",
                            fontSize: 11,
                            color: theme.colors.textTertiary,
                            marginLeft: 4,
                          }}
                        >
                          {formatNotificationTime(notification.sent_at)}
                        </Text>
                        {notification.ticker && (
                          <>
                            <Text
                              style={{
                                fontFamily: "Roboto_400Regular",
                                fontSize: 11,
                                color: theme.colors.textTertiary,
                                marginHorizontal: 8,
                              }}
                            >
                              •
                            </Text>
                            <Text
                              style={{
                                fontFamily: "Roboto_500Medium",
                                fontSize: 11,
                                color: theme.colors.primary,
                              }}
                            >
                              {notification.ticker}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

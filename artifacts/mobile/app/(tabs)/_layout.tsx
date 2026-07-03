import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const { userRole, roleLoaded } = useApp();
  const isDriver = userRole === "driver";

  useEffect(() => {
    if (roleLoaded && userRole === null) {
      router.replace("/role-select");
    }
  }, [roleLoaded, userRole]);

  if (!roleLoaded) return null;

  const activeColor = isDriver ? colors.immediate : colors.scheduled;

  return (
    <Tabs
      initialRouteName={isDriver ? "driver-home" : "index"}
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 62,
          paddingBottom: isWeb ? 34 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_500Medium",
          marginTop: 2,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ) : null,
      }}
    >
      {/* ── Passenger-only tabs ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "拼车大厅",
          href: isDriver ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="passenger-publish"
        options={{
          title: "发布需求",
          href: isDriver ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Feather name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-trips"
        options={{
          title: "我的行程",
          href: isDriver ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Feather name="navigation" size={size} color={color} />
          ),
        }}
      />

      {/* ── Driver-only tabs ── */}
      <Tabs.Screen
        name="driver-home"
        options={{
          title: "发布行程",
          href: isDriver ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Feather name="truck" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="driver-board-tab"
        options={{
          title: "接客看板",
          href: isDriver ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />

      {/* ── Shared tab ── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "个人中心",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

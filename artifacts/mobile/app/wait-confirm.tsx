import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const TOTAL = 60;

export default function WaitConfirmScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { myBookings } = useApp();

  const [seconds, setSeconds] = useState(TOTAL);
  const [status, setStatus] = useState<"waiting" | "confirmed" | "rejected">("waiting");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  // Simulate driver accepting after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("confirmed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status !== "waiting") return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setStatus("rejected");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === "waiting") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      ringAnim.stopAnimation();
    }
  }, [status]);

  const ringScale = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const ringOpacity = ringAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.4, 0.1, 0] });

  const progressPercent = ((TOTAL - seconds) / TOTAL) * 100;

  if (status === "confirmed") {
    return (
      <View style={[styles.container, { backgroundColor: colors.successLight ?? colors.background, paddingBottom: insets.bottom + 20 }]}>
        <Stack.Screen options={{ title: "拼车成功", headerShown: false }} />
        <View style={styles.successContent}>
          <View style={[styles.successIcon, { backgroundColor: colors.success }]}>
            <Feather name="check" size={48} color="#fff" />
          </View>
          <Text style={[styles.successTitle, { color: colors.success }]}>拼车成功！</Text>
          <Text style={[styles.successSub, { color: colors.foreground }]}>等待接驾中</Text>
          <TouchableOpacity
            style={[styles.bigBtn, { backgroundColor: colors.success, marginTop: 32 }]}
            onPress={() => router.replace({ pathname: "/trip-success", params: { tripId } })}
            activeOpacity={0.85}
          >
            <Feather name="phone" size={22} color="#fff" />
            <Text style={styles.bigBtnText}>查看司机信息 / 联系司机</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: colors.success }]}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.8}
          >
            <Text style={[styles.outlineBtnText, { color: colors.success }]}>返回大厅</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (status === "rejected") {
    return (
      <View style={[styles.container, { backgroundColor: colors.immediateLight ?? colors.background, paddingBottom: insets.bottom + 20 }]}>
        <Stack.Screen options={{ title: "已取消", headerShown: false }} />
        <View style={styles.successContent}>
          <View style={[styles.successIcon, { backgroundColor: colors.immediate }]}>
            <Feather name="x" size={48} color="#fff" />
          </View>
          <Text style={[styles.successTitle, { color: colors.immediate }]}>未能接单</Text>
          <Text style={[styles.rejectedSub, { color: colors.foreground }]}>
            抱歉，司机因路线不顺未能接单。{"\n"}座位已释放，请重新选择车次。
          </Text>
          <TouchableOpacity
            style={[styles.bigBtn, { backgroundColor: colors.immediate, marginTop: 32 }]}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.85}
          >
            <Feather name="refresh-cw" size={20} color="#fff" />
            <Text style={styles.bigBtnText}>返回大厅重新选车</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
      <Stack.Screen
        options={{
          title: "等待接单",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.center}>
        {/* Ring animation */}
        <View style={styles.ringContainer}>
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: colors.soon,
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.countdown,
              {
                backgroundColor: colors.card,
                borderColor: colors.soon,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={[styles.countdownNum, { color: colors.soon }]}>{seconds}</Text>
            <Text style={[styles.countdownLabel, { color: colors.mutedForeground }]}>秒</Text>
          </Animated.View>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.soon, width: `${progressPercent}%` as any },
            ]}
          />
        </View>

        <Text style={[styles.waitingTitle, { color: colors.foreground }]}>等待司机接单</Text>
        <Text style={[styles.waitingText, { color: colors.mutedForeground }]}>
          司机正在看路核对您的位置，{"\n"}1分钟内未接单将自动取消，请稍候...
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.cancelBtn, { borderColor: colors.border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.replace("/(tabs)");
        }}
        activeOpacity={0.75}
      >
        <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>取消等待</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  ringContainer: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  countdown: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  countdownNum: { fontSize: 52, fontWeight: "700", fontFamily: "Inter_700Bold" },
  countdownLabel: { fontSize: 16, fontFamily: "Inter_400Regular", marginTop: -4 },
  progressBar: { width: "100%", height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  waitingTitle: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  waitingText: { fontSize: 16, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 26 },
  cancelBtn: {
    marginHorizontal: 32,
    marginBottom: 16,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  // Success / rejected shared
  successContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 14,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 32, fontWeight: "700", fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 18, fontFamily: "Inter_500Medium" },
  rejectedSub: { fontSize: 17, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 26 },
  bigBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    justifyContent: "center",
  },
  bigBtnText: { color: "#fff", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  outlineBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    width: "100%",
    alignItems: "center",
  },
  outlineBtnText: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});

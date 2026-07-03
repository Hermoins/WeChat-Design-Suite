import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { ReviewRequest } from "@/context/AppContext";

const COUNTDOWN = 60;

interface Props {
  request: ReviewRequest | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onDismiss: () => void;
}

export default function DriverReviewSheet({ request, onApprove, onReject, onDismiss }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(COUNTDOWN);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setSeconds(COUNTDOWN);
    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: COUNTDOWN * 1000,
      useNativeDriver: false,
    }).start();

    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          onDismiss();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [progressAnim, onDismiss]);

  useEffect(() => {
    if (request) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      startTimer();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [request]);

  if (!request) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const progressColor =
    seconds > 30 ? colors.success : seconds > 10 ? colors.soon : colors.immediate;

  return (
    <Modal
      visible={!!request}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.handle} />
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              新拼车请求
            </Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              请在倒计时结束前确认
            </Text>
          </View>

          {/* Countdown bar */}
          <View style={styles.countdownWrap}>
            <View style={[styles.countdownBar, { backgroundColor: colors.muted }]}>
              <Animated.View
                style={[
                  styles.countdownFill,
                  { width: progressWidth, backgroundColor: progressColor },
                ]}
              />
            </View>
            <Text style={[styles.countdownNum, { color: progressColor }]}>
              {seconds}秒
            </Text>
          </View>

          {/* Passenger info */}
          <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
            <View style={styles.infoRow}>
              <View style={[styles.infoLabel, { backgroundColor: colors.success }]}>
                <Text style={styles.infoLabelText}>上</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                {request.passenger.pickupPoint}
              </Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <View style={[styles.infoLabel, { backgroundColor: colors.immediate }]}>
                <Text style={styles.infoLabelText}>下</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                {request.passenger.dropoffPoint}
              </Text>
            </View>
          </View>

          {/* Accept button */}
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: colors.success }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onApprove(request.passenger.id);
            }}
            activeOpacity={0.8}
          >
            <Feather name="check-circle" size={22} color="#fff" />
            <Text style={styles.acceptBtnText}>顺路，接单</Text>
          </TouchableOpacity>

          {/* Reject options */}
          <View style={styles.rejectRow}>
            {["绕路不顺", "暂无空座", "其他原因"].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[styles.rejectBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onReject(request.passenger.id, reason);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.rejectBtnText, { color: colors.mutedForeground }]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  countdownWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  countdownBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  countdownFill: {
    height: "100%",
    borderRadius: 5,
  },
  countdownNum: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    minWidth: 48,
    textAlign: "right",
  },
  infoBox: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabelText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  infoValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  infoDivider: {
    height: 1,
    marginVertical: 4,
    marginLeft: 40,
  },
  acceptBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  acceptBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  rejectRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 12,
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});

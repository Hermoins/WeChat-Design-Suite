import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import type { TimeType } from "@/context/AppContext";

const ROUTES = [
  { from: "新城子", to: "道义商圈" },
  { from: "道义商圈", to: "新城子" },
];

const TIME_OPTIONS: { key: TimeType; label: string; sub: string }[] = [
  { key: "now", label: "现在马上走", sub: "立即发布" },
  { key: "soon", label: "10分钟后", sub: "稍等一下" },
  { key: "scheduled", label: "自定义预约", sub: "选择时间" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const DAY_OPTIONS = ["今天", "明天", "后天"];

function TimePickerModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (label: string) => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const label = `${DAY_OPTIONS[day]} ${pad(hour)}:${pad(minute)}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={tpStyles.overlay}>
        <View style={[tpStyles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
          <View style={[tpStyles.handle, { backgroundColor: colors.muted }]} />
          <Text style={[tpStyles.title, { color: colors.foreground }]}>选择预约时间</Text>

          {/* Day selector */}
          <View style={tpStyles.selectorRow}>
            {DAY_OPTIONS.map((d, i) => (
              <TouchableOpacity
                key={d}
                style={[tpStyles.chip, { backgroundColor: day === i ? colors.scheduled : colors.muted }]}
                onPress={() => { Haptics.selectionAsync(); setDay(i); }}
                activeOpacity={0.8}
              >
                <Text style={[tpStyles.chipText, { color: day === i ? "#fff" : colors.foreground }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hour + Minute */}
          <View style={tpStyles.timeRow}>
            <View style={tpStyles.timeCol}>
              <Text style={[tpStyles.timeColLabel, { color: colors.mutedForeground }]}>小时</Text>
              <ScrollView style={tpStyles.timeScroll} showsVerticalScrollIndicator={false}>
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[tpStyles.timeItem, hour === h && { backgroundColor: colors.scheduledLight }]}
                    onPress={() => { Haptics.selectionAsync(); setHour(h); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[tpStyles.timeItemText, { color: hour === h ? colors.scheduled : colors.foreground, fontWeight: hour === h ? "700" : "400" }]}>
                      {pad(h)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={[tpStyles.colon, { color: colors.foreground }]}>:</Text>
            <View style={tpStyles.timeCol}>
              <Text style={[tpStyles.timeColLabel, { color: colors.mutedForeground }]}>分钟</Text>
              <ScrollView style={tpStyles.timeScroll} showsVerticalScrollIndicator={false}>
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[tpStyles.timeItem, minute === m && { backgroundColor: colors.scheduledLight }]}
                    onPress={() => { Haptics.selectionAsync(); setMinute(m); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[tpStyles.timeItemText, { color: minute === m ? colors.scheduled : colors.foreground, fontWeight: minute === m ? "700" : "400" }]}>
                      {pad(m)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Preview */}
          <View style={[tpStyles.preview, { backgroundColor: colors.scheduledLight, borderColor: colors.scheduled }]}>
            <Text style={[tpStyles.previewText, { color: colors.scheduled }]}>
              {label}
            </Text>
          </View>

          <TouchableOpacity
            style={[tpStyles.confirmBtn, { backgroundColor: colors.scheduled }]}
            onPress={() => { onConfirm(label); onClose(); }}
            activeOpacity={0.85}
          >
            <Text style={tpStyles.confirmBtnText}>确认时间</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function DriverPublishScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { publishTrip, savedRoutes, addSavedRoute, acceptPassengerRequest } = useApp();
  const params = useLocalSearchParams<{
    preRoute?: string;
    preTime?: string;
    preSeats?: string;
    voiceText?: string;
    requestId?: string;
  }>();

  const [selectedRoute, setSelectedRoute] = useState(0);
  const [timeType, setTimeType] = useState<TimeType>("now");
  const [scheduledTime, setScheduledTime] = useState("");
  const [seats, setSeats] = useState(3);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [voiceBanner, setVoiceBanner] = useState(params.voiceText ?? "");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pre-fill from voice / saved route params
  useEffect(() => {
    if (params.preRoute) {
      try {
        const r = JSON.parse(params.preRoute) as { from: string; to: string };
        const idx = ROUTES.findIndex((ro) => ro.from === r.from && ro.to === r.to);
        if (idx >= 0) setSelectedRoute(idx);
      } catch {}
    }
    if (params.preTime && ["now", "soon", "scheduled"].includes(params.preTime)) {
      setTimeType(params.preTime as TimeType);
    }
    if (params.preSeats) {
      const n = parseInt(params.preSeats);
      if (!isNaN(n) && n >= 1 && n <= 6) setSeats(n);
    }
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const route = ROUTES[selectedRoute];
  const tagColor =
    timeType === "now" ? colors.immediate : timeType === "soon" ? colors.soon : colors.scheduled;

  const effectiveScheduledTime = scheduledTime || "明早 07:30";
  const timeLabel =
    timeType === "now" ? "马上走" : timeType === "soon" ? "10分钟后" : effectiveScheduledTime;

  const handleTimeSelect = (key: TimeType) => {
    Haptics.selectionAsync();
    setTimeType(key);
    if (key === "scheduled") setShowTimePicker(true);
  };

  const DRIVER_NAME = "我";
  const DRIVER_PHONE = "13800000000";
  const DRIVER_PLATE = "辽A·88888";
  const DRIVER_CAR = "白色别克GL8";

  const handlePublish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addSavedRoute({ from: route.from, to: route.to });
    const trip = publishTrip({
      driverName: DRIVER_NAME,
      driverPhone: DRIVER_PHONE,
      driverPlate: DRIVER_PLATE,
      driverCar: DRIVER_CAR,
      route: { from: route.from, to: route.to },
      timeType,
      scheduledTime: timeType === "scheduled" ? effectiveScheduledTime : null,
      totalSeats: seats,
      remainingSeats: seats,
      price: "10元",
    });
    // If driver accepted a passenger request, notify the passenger
    if (params.requestId) {
      acceptPassengerRequest(params.requestId, {
        driverName: DRIVER_NAME,
        driverPhone: DRIVER_PHONE,
        driverPlate: DRIVER_PLATE,
        driverCar: DRIVER_CAR,
        tripId: trip.id,
      });
    }
    router.replace({ pathname: "/share-card", params: { tripId: trip.id } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "司机发车",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
      >
        {/* Voice banner */}
        {voiceBanner ? (
          <View style={[styles.voiceBanner, { backgroundColor: colors.immediateLight, borderColor: colors.immediate }]}>
            <Feather name="mic" size={15} color={colors.immediate} />
            <Text style={[styles.voiceBannerText, { color: colors.immediate }]} numberOfLines={1}>
              已识别：{voiceBanner}
            </Text>
            <TouchableOpacity onPress={() => setVoiceBanner("")} activeOpacity={0.7}>
              <Feather name="x" size={15} color={colors.immediate} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Saved routes quick-select */}
        {savedRoutes.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>常用路线</Text>
            <View style={styles.savedRouteRow}>
              {savedRoutes.map((sr, i) => {
                const idx = ROUTES.findIndex((r) => r.from === sr.from && r.to === sr.to);
                const active = idx === selectedRoute;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.savedChip,
                      {
                        backgroundColor: active ? colors.immediate : colors.card,
                        borderColor: active ? colors.immediate : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      if (idx >= 0) setSelectedRoute(idx);
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="navigation" size={12} color={active ? "#fff" : colors.mutedForeground} />
                    <Text style={[styles.savedChipText, { color: active ? "#fff" : colors.foreground }]}>
                      {sr.from}→{sr.to}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Route */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>选择路线</Text>
        <View style={styles.routeGrid}>
          {ROUTES.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.routeCard,
                {
                  backgroundColor: selectedRoute === i ? colors.immediate : colors.card,
                  borderColor: selectedRoute === i ? colors.immediate : colors.border,
                },
              ]}
              onPress={() => { Haptics.selectionAsync(); setSelectedRoute(i); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.routeFrom, { color: selectedRoute === i ? "#fff" : colors.foreground }]}>
                {r.from}
              </Text>
              <Feather
                name="arrow-right"
                size={18}
                color={selectedRoute === i ? "rgba(255,255,255,0.8)" : colors.mutedForeground}
              />
              <Text style={[styles.routeTo, { color: selectedRoute === i ? "#fff" : colors.foreground }]}>
                {r.to}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>发车时间</Text>
        <View style={styles.timeGrid}>
          {TIME_OPTIONS.map((opt) => {
            const active = timeType === opt.key;
            const c =
              opt.key === "now" ? colors.immediate : opt.key === "soon" ? colors.soon : colors.scheduled;
            const subLabel =
              opt.key === "scheduled" && scheduledTime ? scheduledTime : opt.sub;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.timeCard,
                  { backgroundColor: active ? c : colors.card, borderColor: active ? c : colors.border },
                ]}
                onPress={() => handleTimeSelect(opt.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.timeLabel, { color: active ? "#fff" : colors.foreground }]}>
                  {opt.label}
                </Text>
                <Text style={[styles.timeSub, { color: active ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                  {subLabel}
                </Text>
                {opt.key === "scheduled" && (
                  <Feather
                    name="clock"
                    size={14}
                    color={active ? "rgba(255,255,255,0.8)" : colors.mutedForeground}
                    style={{ marginTop: 4 }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Seats */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>空余座位</Text>
        <View style={[styles.seatsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.seatBtn, { backgroundColor: seats <= 1 ? colors.muted : colors.immediate }]}
            onPress={() => { if (seats > 1) { Haptics.selectionAsync(); setSeats(seats - 1); } }}
            activeOpacity={0.8}
          >
            <Feather name="minus" size={22} color={seats <= 1 ? colors.mutedForeground : "#fff"} />
          </TouchableOpacity>
          <Text style={[styles.seatCount, { color: colors.foreground }]}>{seats}</Text>
          <TouchableOpacity
            style={[styles.seatBtn, { backgroundColor: seats >= 6 ? colors.muted : colors.immediate }]}
            onPress={() => { if (seats < 6) { Haptics.selectionAsync(); setSeats(seats + 1); } }}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={22} color={seats >= 6 ? colors.mutedForeground : "#fff"} />
          </TouchableOpacity>
        </View>

        {/* Preview card */}
        <View style={[styles.previewCard, { backgroundColor: tagColor + "15", borderColor: tagColor }]}>
          <Text style={[styles.previewLabel, { color: tagColor }]}>分享卡片预览</Text>
          <Text style={[styles.previewTitle, { color: colors.foreground }]}>
            [余{seats}座] {route.from} → {route.to}
          </Text>
          <View style={[styles.previewTag, { backgroundColor: tagColor }]}>
            <Text style={styles.previewTagText}>{timeLabel}</Text>
          </View>
          <Text style={[styles.previewSub, { color: colors.mutedForeground }]}>
            点击卡片立刻占座 · 上门接送
          </Text>
        </View>
      </ScrollView>

      {/* Publish button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.publishBtn, { backgroundColor: colors.immediate }]}
            onPress={handlePublish}
            activeOpacity={0.85}
          >
            <Feather name="share-2" size={22} color="#fff" />
            <Text style={styles.publishBtnText}>确认发布并生成微信分享卡片</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Time picker modal */}
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onConfirm={(label) => setScheduledTime(label)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 8 },
  voiceBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 4,
  },
  voiceBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  savedRouteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  savedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  savedChipText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  routeGrid: { gap: 10 },
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: 14,
    paddingVertical: 18,
    borderWidth: 2,
  },
  routeFrom: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  routeTo: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  timeGrid: { flexDirection: "row", gap: 10 },
  timeCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 2,
  },
  timeLabel: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  timeSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" },
  seatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  seatBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  seatCount: {
    fontSize: 48,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    minWidth: 80,
  },
  previewCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  previewTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  previewTag: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  previewTagText: { color: "#fff", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  previewSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  publishBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  publishBtnText: { color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
});

const tpStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 20 },
  selectorRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  chip: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  chipText: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16, height: 180 },
  timeCol: { flex: 1 },
  timeColLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center", marginBottom: 8 },
  timeScroll: { flex: 1 },
  timeItem: { paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  timeItemText: { fontSize: 20, fontFamily: "Inter_400Regular" },
  colon: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  preview: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  previewText: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  confirmBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  confirmBtnText: { color: "#fff", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
});

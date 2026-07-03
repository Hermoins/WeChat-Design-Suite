import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
  { from: "新城子", to: "沈阳北站" },
  { from: "沈阳北站", to: "新城子" },
];

const TIME_OPTIONS: { key: TimeType; label: string; sub: string }[] = [
  { key: "now", label: "马上走", sub: "立即出发" },
  { key: "soon", label: "10分钟后", sub: "稍等一下" },
  { key: "scheduled", label: "预约出发", sub: "选择时间" },
];

export default function PassengerPublishScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { savedRoutes, addSavedRoute, publishPassengerRequest, myPassengerRequests } = useApp();

  const [selectedRoute, setSelectedRoute] = useState(0);
  const [timeType, setTimeType] = useState<TimeType>("now");
  const [passengerCount, setPassengerCount] = useState(1);
  const [published, setPublished] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = (Platform.OS === "web" ? 84 : 62) + insets.bottom + 16;

  const route = ROUTES[selectedRoute];
  const tagColor =
    timeType === "now" ? colors.immediate : timeType === "soon" ? colors.soon : colors.scheduled;
  const timeLabel =
    timeType === "now" ? "马上走" : timeType === "soon" ? "10分钟后" : "预约出发";

  const handlePublish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addSavedRoute({ from: route.from, to: route.to });
    publishPassengerRequest({
      route: { from: route.from, to: route.to },
      timeType,
      scheduledTime: null,
      passengerCount,
      note: "",
    });
    setPublished(true);
  };

  const handleReset = () => {
    setPublished(false);
    setPassengerCount(1);
    setTimeType("now");
  };

  if (published) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.successHeader, { paddingTop: topPad + 24 }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.successLight }]}>
            <Feather name="check-circle" size={40} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>需求已发布</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            {route.from} → {route.to} · {timeLabel} · {passengerCount}人
          </Text>
          <Text style={[styles.successHint, { color: colors.mutedForeground }]}>
            司机会主动联系你，也可以去大厅直接抢座
          </Text>
        </View>

        <View style={styles.successActions}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.scheduled }]}
            onPress={() => router.replace("/(tabs)/index")}
            activeOpacity={0.85}
          >
            <Feather name="grid" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>去拼车大厅抢座</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ghostBtn, { borderColor: colors.border }]}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <Text style={[styles.ghostBtnText, { color: colors.mutedForeground }]}>再发一个需求</Text>
          </TouchableOpacity>
        </View>

        {myPassengerRequests.length > 0 && (
          <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.historyLabel, { color: colors.mutedForeground }]}>我的需求历史</Text>
            {myPassengerRequests.slice(0, 3).map((req) => (
              <View key={req.id} style={[styles.historyRow, { borderTopColor: colors.border }]}>
                <Feather name="navigation" size={13} color={colors.scheduled} />
                <Text style={[styles.historyText, { color: colors.foreground }]}>
                  {req.route.from} → {req.route.to}
                </Text>
                <Text style={[styles.historyTime, { color: colors.mutedForeground }]}>
                  {req.timeType === "now" ? "马上走" : req.timeType === "soon" ? "10分钟后" : "预约"}
                  · {req.passengerCount}人
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1C1C1E" }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>发布拼车需求</Text>
              <Text style={styles.headerSub}>告诉司机你的出行计划</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: colors.scheduled + "30" }]}>
              <Feather name="user" size={14} color={colors.scheduled} />
              <Text style={[styles.roleBadgeText, { color: colors.scheduled }]}>乘客</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Saved routes quick-select */}
          {savedRoutes.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>常用路线</Text>
              <View style={styles.chipRow}>
                {savedRoutes.map((sr, i) => {
                  const idx = ROUTES.findIndex((r) => r.from === sr.from && r.to === sr.to);
                  const active = idx === selectedRoute;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? colors.scheduled : colors.card,
                          borderColor: active ? colors.scheduled : colors.border,
                        },
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        if (idx >= 0) setSelectedRoute(idx);
                      }}
                      activeOpacity={0.8}
                    >
                      <Feather name="navigation" size={12} color={active ? "#fff" : colors.mutedForeground} />
                      <Text style={[styles.chipText, { color: active ? "#fff" : colors.foreground }]}>
                        {sr.from}→{sr.to}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Route grid */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>选择路线</Text>
          <View style={styles.routeGrid}>
            {ROUTES.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.routeCard,
                  {
                    backgroundColor: selectedRoute === i ? colors.scheduled : colors.card,
                    borderColor: selectedRoute === i ? colors.scheduled : colors.border,
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
                  size={16}
                  color={selectedRoute === i ? "rgba(255,255,255,0.7)" : colors.mutedForeground}
                  style={{ marginHorizontal: 6 }}
                />
                <Text style={[styles.routeTo, { color: selectedRoute === i ? "#fff" : colors.foreground }]}>
                  {r.to}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>出发时间</Text>
          <View style={styles.timeRow}>
            {TIME_OPTIONS.map((opt) => {
              const active = timeType === opt.key;
              const c =
                opt.key === "now" ? colors.immediate : opt.key === "soon" ? colors.soon : colors.scheduled;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.timeCard,
                    {
                      backgroundColor: active ? c : colors.card,
                      borderColor: active ? c : colors.border,
                    },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setTimeType(opt.key); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.timeMain, { color: active ? "#fff" : colors.foreground }]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.timeSub, { color: active ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>
                    {opt.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Passenger count */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>出行人数</Text>
          <View style={[styles.countCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.countBtn, { backgroundColor: passengerCount <= 1 ? colors.muted : colors.scheduled }]}
              onPress={() => { if (passengerCount > 1) { Haptics.selectionAsync(); setPassengerCount(p => p - 1); } }}
              activeOpacity={0.8}
            >
              <Feather name="minus" size={20} color={passengerCount <= 1 ? colors.mutedForeground : "#fff"} />
            </TouchableOpacity>
            <View style={styles.countCenter}>
              <Text style={[styles.countNum, { color: colors.foreground }]}>{passengerCount}</Text>
              <Text style={[styles.countUnit, { color: colors.mutedForeground }]}>人</Text>
            </View>
            <TouchableOpacity
              style={[styles.countBtn, { backgroundColor: passengerCount >= 6 ? colors.muted : colors.scheduled }]}
              onPress={() => { if (passengerCount < 6) { Haptics.selectionAsync(); setPassengerCount(p => p + 1); } }}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={20} color={passengerCount >= 6 ? colors.mutedForeground : "#fff"} />
            </TouchableOpacity>
          </View>

          {/* Preview */}
          <View style={[styles.previewCard, { backgroundColor: colors.scheduledLight, borderColor: colors.scheduled + "50" }]}>
            <View style={styles.previewRow}>
              <View style={[styles.previewDot, { backgroundColor: tagColor }]} />
              <Text style={[styles.previewTitle, { color: colors.foreground }]}>
                [{passengerCount}人] {route.from} → {route.to}
              </Text>
            </View>
            <Text style={[styles.previewSub, { color: colors.mutedForeground }]}>
              {timeLabel} · 求顺路司机
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Publish button */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 12),
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.publishBtn, { backgroundColor: colors.scheduled }]}
          onPress={handlePublish}
          activeOpacity={0.85}
        >
          <Feather name="send" size={18} color="#fff" />
          <Text style={styles.publishBtnText}>发布拼车需求</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4, fontFamily: "Inter_400Regular" },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roleBadgeText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  content: { padding: 20, gap: 8 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 6,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  routeGrid: { gap: 10 },
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  routeFrom: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  routeTo: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },

  timeRow: { flexDirection: "row", gap: 10 },
  timeCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  timeMain: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  timeSub: { fontSize: 11, fontFamily: "Inter_400Regular" },

  countCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  countBtn: {
    width: 60,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  countCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 4,
  },
  countNum: { fontSize: 36, fontWeight: "800", fontFamily: "Inter_700Bold" },
  countUnit: { fontSize: 16, fontFamily: "Inter_500Medium" },

  previewCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    gap: 6,
    marginTop: 8,
  },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  previewDot: { width: 10, height: 10, borderRadius: 5 },
  previewTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  previewSub: { fontSize: 13, fontFamily: "Inter_400Regular" },

  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 18,
  },
  publishBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },

  // Success state
  successHeader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 26, fontWeight: "800", fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 15, fontFamily: "Inter_500Medium", textAlign: "center" },
  successHint: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 4 },
  successActions: { paddingHorizontal: 24, paddingBottom: 20, gap: 12 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 18,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  ghostBtn: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: "center",
  },
  ghostBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  historyCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  historyLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  historyText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  historyTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
});

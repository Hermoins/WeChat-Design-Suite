import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Linking,
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
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import type { PassengerRequest } from "@/context/AppContext";

type RouteFilter = "all" | "to-daoyuan" | "to-xinchengzi";

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  return `${Math.floor(mins / 60)}小时前`;
}

function RequestCard({
  req,
  isMatch,
}: {
  req: PassengerRequest;
  isMatch: boolean;
}) {
  const colors = useColors();
  const tagColor =
    req.timeType === "now"
      ? colors.immediate
      : req.timeType === "soon"
      ? colors.soon
      : colors.scheduled;
  const tagLabel =
    req.timeType === "now" ? "马上走" : req.timeType === "soon" ? "10分钟后" : req.scheduledTime ?? "预约";

  const DEMO_PHONES: Record<string, string> = {
    pr1: "13800001111",
    pr2: "13800002222",
    pr3: "13800003333",
    pr4: "13800004444",
    pr5: "13800005555",
  };
  const phone = DEMO_PHONES[req.id] ?? "13800000000";

  return (
    <View
      style={[
        styles.reqCard,
        {
          backgroundColor: colors.card,
          borderColor: isMatch ? tagColor + "80" : colors.border,
          borderWidth: isMatch ? 2 : 1,
        },
      ]}
    >
      {/* Top row */}
      <View style={styles.reqTop}>
        <View style={styles.reqRouteRow}>
          <Text style={[styles.reqFrom, { color: colors.foreground }]}>{req.route.from}</Text>
          <Feather name="arrow-right" size={14} color={colors.mutedForeground} style={{ marginHorizontal: 4 }} />
          <Text style={[styles.reqTo, { color: colors.foreground }]}>{req.route.to}</Text>
          {isMatch && (
            <View style={[styles.matchBadge, { backgroundColor: tagColor + "20" }]}>
              <Text style={[styles.matchText, { color: tagColor }]}>顺路</Text>
            </View>
          )}
        </View>
        <Text style={[styles.reqTime, { color: colors.mutedForeground }]}>{timeAgo(req.createdAt)}</Text>
      </View>

      {/* Tags row */}
      <View style={styles.reqTags}>
        <View style={[styles.tag, { backgroundColor: tagColor + "18" }]}>
          <View style={[styles.tagDot, { backgroundColor: tagColor }]} />
          <Text style={[styles.tagText, { color: tagColor }]}>{tagLabel}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: colors.muted }]}>
          <Feather name="users" size={11} color={colors.mutedForeground} />
          <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{req.passengerCount}人</Text>
        </View>
      </View>

      {/* Note */}
      {req.note ? (
        <Text style={[styles.reqNote, { color: colors.mutedForeground }]} numberOfLines={1}>
          {req.note}
        </Text>
      ) : null}

      {/* Actions */}
      <View style={styles.reqActions}>
        <TouchableOpacity
          style={[styles.callBtn, { backgroundColor: colors.success + "18", borderColor: colors.success + "50" }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Linking.openURL(`tel:${phone}`);
          }}
          activeOpacity={0.8}
        >
          <Feather name="phone" size={15} color={colors.success} />
          <Text style={[styles.callBtnText, { color: colors.success }]}>联系乘客</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptBtn, { backgroundColor: colors.immediate }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({
              pathname: "/driver-publish",
              params: { preRoute: JSON.stringify(req.route), preTime: req.timeType, requestId: req.id },
            });
          }}
          activeOpacity={0.85}
        >
          <Feather name="truck" size={15} color="#fff" />
          <Text style={styles.acceptBtnText}>顺路接</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DriverHomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { myTrips, savedRoutes, removeSavedRoute, passengerRequests } = useApp();
  const { isListening, lastResult, startListening, stopListening, clearResult, isSupported } =
    useSpeechRecognition();

  const [routeFilter, setRouteFilter] = useState<RouteFilter>("all");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = (Platform.OS === "web" ? 84 : 62) + insets.bottom + 16;
  const activeTrip = myTrips[0];

  useEffect(() => {
    if (lastResult) {
      router.push({
        pathname: "/driver-publish",
        params: {
          preRoute: lastResult.route ? JSON.stringify(lastResult.route) : undefined,
          preTime: lastResult.timeType,
          preSeats: lastResult.seats?.toString(),
          voiceText: lastResult.transcript,
        },
      });
      clearResult();
    }
  }, [lastResult]);

  const filtered = passengerRequests.filter((r) => {
    if (routeFilter === "to-daoyuan") return r.route.to === "道义商圈";
    if (routeFilter === "to-xinchengzi") return r.route.to === "新城子";
    return true;
  });

  // Which routes the driver has saved (used to mark "顺路" badge)
  const savedFromSet = new Set(savedRoutes.map((r) => `${r.from}|${r.to}`));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }}>
        {/* ── Dark header ── */}
        <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1C1C1E" }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>求拼大厅</Text>
              <Text style={styles.headerSub}>乘客实时需求 · 顺路就接</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: colors.immediate + "30" }]}>
              <Feather name="truck" size={14} color={colors.immediate} />
              <Text style={[styles.roleBadgeText, { color: colors.immediate }]}>司机</Text>
            </View>
          </View>

          {/* Active trip mini-banner */}
          {activeTrip && (
            <TouchableOpacity
              style={[styles.activeBanner, { backgroundColor: colors.success + "25", borderColor: colors.success + "60" }]}
              onPress={() => router.push("/driver-board")}
              activeOpacity={0.85}
            >
              <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.activeBannerText, { color: colors.success }]}>
                行程进行中：{activeTrip.route.from} → {activeTrip.route.to}
              </Text>
              <Feather name="chevron-right" size={15} color={colors.success} />
            </TouchableOpacity>
          )}

          {/* Voice strip */}
          <TouchableOpacity
            style={[
              styles.voiceStrip,
              {
                backgroundColor: isListening ? colors.immediate : "rgba(255,255,255,0.08)",
                borderColor: isListening ? colors.immediate : "rgba(255,255,255,0.15)",
              },
              !isSupported && { opacity: 0.4 },
            ]}
            onPress={isListening ? stopListening : startListening}
            disabled={!isSupported}
            activeOpacity={0.8}
          >
            <Feather
              name={isListening ? "mic-off" : "mic"}
              size={16}
              color={isListening ? "#fff" : "rgba(255,255,255,0.7)"}
            />
            <Text style={[styles.voiceStripText, { color: isListening ? "#fff" : "rgba(255,255,255,0.7)" }]}>
              {isListening
                ? "正在聆听... 请说路线"
                : isSupported
                ? "语音发车：说「新城子到道义 马上走」"
                : "语音发车 · Chrome / Safari 可用"}
            </Text>
            {!isListening && (
              <View style={[styles.publishPill, { backgroundColor: colors.immediate }]}>
                <Text style={styles.publishPillText}>发布行程</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Filter tabs ── */}
        <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {([
            { key: "all", label: `全部 (${passengerRequests.length})` },
            { key: "to-daoyuan", label: "→ 道义商圈" },
            { key: "to-xinchengzi", label: "→ 新城子" },
          ] as { key: RouteFilter; label: string }[]).map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterTab,
                routeFilter === f.key && {
                  borderBottomColor: colors.immediate,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => { Haptics.selectionAsync(); setRouteFilter(f.key); }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: routeFilter === f.key ? colors.immediate : colors.mutedForeground,
                    fontWeight: routeFilter === f.key ? "700" : "400",
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Saved routes quick-bar ── */}
        {savedRoutes.length > 0 && (
          <View style={[styles.savedBar, { borderBottomColor: colors.border }]}>
            <Text style={[styles.savedLabel, { color: colors.mutedForeground }]}>常用路线</Text>
            <View style={styles.savedChips}>
              {savedRoutes.map((r, i) => (
                <View key={i} style={[styles.savedChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.savedChipMain}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({ pathname: "/driver-publish", params: { preRoute: JSON.stringify(r) } });
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="navigation" size={12} color={colors.immediate} />
                    <Text style={[styles.savedChipText, { color: colors.foreground }]}>
                      {r.from}→{r.to}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { Haptics.selectionAsync(); removeSavedRoute(i); }}
                    style={styles.savedChipDel}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={12} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Request list ── */}
        <View style={styles.listWrap}>
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Feather name="inbox" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                暂无求拼需求，稍后再看
              </Text>
            </View>
          ) : (
            filtered.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                isMatch={savedFromSet.has(`${req.route.from}|${req.route.to}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Floating publish button ── */}
      <View
        style={[
          styles.floatBar,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 10),
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.publishBtn, { backgroundColor: colors.immediate }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/driver-publish");
          }}
          activeOpacity={0.85}
        >
          <Feather name="plus-circle" size={20} color="#fff" />
          <Text style={styles.publishBtnText}>发布我的行程</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 3, fontFamily: "Inter_400Regular" },
  roleBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
  },
  roleBadgeText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  activeBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeBannerText: { flex: 1, fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  voiceStrip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11,
  },
  voiceStripText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  publishPill: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  publishPillText: { color: "#fff", fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },

  // Filter
  filterBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  filterTab: {
    flex: 1, paddingVertical: 13, alignItems: "center", borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  // Saved
  savedBar: {
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, gap: 8,
  },
  savedLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  savedChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  savedChip: {
    flexDirection: "row", alignItems: "center", borderRadius: 20, borderWidth: 1, overflow: "hidden",
  },
  savedChipMain: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7 },
  savedChipText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  savedChipDel: { paddingHorizontal: 8, paddingVertical: 7 },

  // List
  listWrap: { padding: 16, gap: 12 },
  emptyWrap: { paddingVertical: 48, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },

  // Request card
  reqCard: { borderRadius: 16, padding: 16, gap: 10 },
  reqTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reqRouteRow: { flexDirection: "row", alignItems: "center", flex: 1, flexWrap: "wrap", gap: 2 },
  reqFrom: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  reqTo: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  matchBadge: { marginLeft: 6, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  matchText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  reqTime: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 6 },

  reqTags: { flexDirection: "row", gap: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  reqNote: { fontSize: 13, fontFamily: "Inter_400Regular" },

  reqActions: { flexDirection: "row", gap: 10, marginTop: 2 },
  callBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 12, borderWidth: 1.5, paddingVertical: 12,
  },
  callBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  acceptBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 12, paddingVertical: 12,
  },
  acceptBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },

  // Footer
  floatBar: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 12 },
  publishBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 16, paddingVertical: 17,
  },
  publishBtnText: { color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
});

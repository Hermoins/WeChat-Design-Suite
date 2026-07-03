import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { TimeTag } from "@/components/TripCard";
import type { PassengerRequest } from "@/context/AppContext";

type ViewMode = "passenger" | "driver";

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  return `${Math.floor(mins / 60)}小时前`;
}

function AcceptedCard({ req }: { req: PassengerRequest }) {
  const colors = useColors();
  const info = req.acceptedBy!;
  return (
    <View
      style={[
        styles.acceptedCard,
        { backgroundColor: colors.successLight, borderColor: colors.success + "60" },
      ]}
    >
      {/* Header */}
      <View style={styles.acceptedHeader}>
        <View style={[styles.acceptedIconWrap, { backgroundColor: colors.success }]}>
          <Feather name="check-circle" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.acceptedTitle, { color: colors.success }]}>司机已接单！</Text>
          <Text style={[styles.acceptedSub, { color: colors.mutedForeground }]}>
            {req.route.from} → {req.route.to} · {timeAgo(info.acceptedAt)}接单
          </Text>
        </View>
      </View>

      {/* Driver info */}
      <View style={[styles.driverInfoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.driverInfoRow}>
          <Feather name="user" size={14} color={colors.mutedForeground} />
          <Text style={[styles.driverInfoLabel, { color: colors.mutedForeground }]}>司机</Text>
          <Text style={[styles.driverInfoVal, { color: colors.foreground }]}>{info.driverName}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.driverInfoRow}>
          <Feather name="truck" size={14} color={colors.mutedForeground} />
          <Text style={[styles.driverInfoLabel, { color: colors.mutedForeground }]}>车辆</Text>
          <Text style={[styles.driverInfoVal, { color: colors.foreground }]}>
            {info.driverCar}  {info.driverPlate}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.acceptedActions}>
        <TouchableOpacity
          style={[styles.callBtn, { backgroundColor: colors.success }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Linking.openURL(`tel:${info.driverPhone}`);
          }}
          activeOpacity={0.85}
        >
          <Feather name="phone" size={16} color="#fff" />
          <Text style={styles.callBtnText}>立即联系司机</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewTripBtn, { borderColor: colors.success + "60" }]}
          onPress={() => router.push({ pathname: "/trip-success", params: { tripId: info.tripId } })}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewTripText, { color: colors.success }]}>查看行程详情</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MyTripsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { myBookings, myTrips, myPassengerRequests, isDriverMode } = useApp();
  const [mode, setMode] = useState<ViewMode>(isDriverMode ? "driver" : "passenger");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = (Platform.OS === "web" ? 84 : 62) + insets.bottom + 16;

  // Passenger requests that have been accepted by a driver
  const acceptedRequests = myPassengerRequests.filter((r) => !!r.acceptedBy);

  const statusLabel = (s: string) => {
    if (s === "waiting") return { text: "等待接单", bg: colors.soonLight ?? colors.muted, color: colors.soon };
    if (s === "confirmed") return { text: "已接单", bg: colors.successLight ?? colors.muted, color: colors.success };
    if (s === "rejected") return { text: "被拒绝", bg: colors.immediateLight ?? colors.muted, color: colors.immediate };
    return { text: s, bg: colors.muted, color: colors.mutedForeground };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.foreground }]}>我的行程</Text>
          {acceptedRequests.length > 0 && mode === "passenger" && (
            <View style={[styles.notifDot, { backgroundColor: colors.success }]}>
              <Text style={styles.notifDotText}>{acceptedRequests.length}</Text>
            </View>
          )}
        </View>
        <View style={[styles.modeSwitch, { backgroundColor: colors.muted }]}>
          {(["passenger", "driver"] as ViewMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, mode === m && { backgroundColor: colors.card }]}
              onPress={() => {
                Haptics.selectionAsync();
                setMode(m);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  { color: mode === m ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {m === "passenger" ? "乘客" : "司机"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {mode === "passenger" ? (
        <FlatList
          data={myBookings}
          keyExtractor={(item) => item.tripId + item.bookedAt}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
          ListHeaderComponent={
            acceptedRequests.length > 0 ? (
              <View style={styles.notifSection}>
                <View style={styles.notifLabelRow}>
                  <View style={[styles.notifPulse, { backgroundColor: colors.success }]} />
                  <Text style={[styles.notifLabel, { color: colors.success }]}>
                    有司机接了你的求拼需求
                  </Text>
                </View>
                {acceptedRequests.map((req) => (
                  <AcceptedCard key={req.id} req={req} />
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const sl = statusLabel(item.status);
            return (
              <View
                style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.bookingTop}>
                  <TimeTag timeType={item.trip.timeType} scheduledTime={item.trip.scheduledTime} />
                  <View style={[styles.statusTag, { backgroundColor: sl.bg }]}>
                    <Text style={[styles.statusText, { color: sl.color }]}>{sl.text}</Text>
                  </View>
                </View>
                <View style={styles.routeRow}>
                  <Text style={[styles.routeText, { color: colors.foreground }]}>
                    {item.trip.route.from}
                  </Text>
                  <Feather name="arrow-right" size={18} color={colors.mutedForeground} />
                  <Text style={[styles.routeText, { color: colors.foreground }]}>
                    {item.trip.route.to}
                  </Text>
                </View>
                <View style={styles.pointsRow}>
                  <View style={styles.pointItem}>
                    <View style={[styles.dot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.pointText, { color: colors.foreground }]} numberOfLines={1}>
                      {item.pickupPoint}
                    </Text>
                  </View>
                  <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  <View style={styles.pointItem}>
                    <View style={[styles.dot, { backgroundColor: colors.immediate }]} />
                    <Text style={[styles.pointText, { color: colors.foreground }]} numberOfLines={1}>
                      {item.dropoffPoint}
                    </Text>
                  </View>
                </View>
                {item.status === "confirmed" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.scheduled }]}
                    onPress={() =>
                      router.push({ pathname: "/trip-success", params: { tripId: item.tripId } })
                    }
                    activeOpacity={0.8}
                  >
                    <Feather name="phone" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>查看司机信息</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            acceptedRequests.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="map-pin" size={56} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>还没有行程记录</Text>
                <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                  去拼车大厅找一辆车，或者发布求拼需求
                </Text>
                <TouchableOpacity
                  style={[styles.emptyBtn, { backgroundColor: colors.scheduled }]}
                  onPress={() => router.push("/(tabs)/passenger-publish")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyBtnText}>发布求拼需求</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={myTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
          renderItem={({ item }) => (
            <View
              style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.bookingTop}>
                <TimeTag timeType={item.timeType} scheduledTime={item.scheduledTime} />
                <Text style={[styles.seatsText, { color: colors.mutedForeground }]}>
                  余 {item.remainingSeats}/{item.totalSeats} 座
                </Text>
              </View>
              <View style={styles.routeRow}>
                <Text style={[styles.routeText, { color: colors.foreground }]}>{item.route.from}</Text>
                <Feather name="arrow-right" size={18} color={colors.mutedForeground} />
                <Text style={[styles.routeText, { color: colors.foreground }]}>{item.route.to}</Text>
              </View>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.scheduled, flex: 1 }]}
                  onPress={() => router.push("/driver-board")}
                  activeOpacity={0.8}
                >
                  <Feather name="list" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>接客看板</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.immediate, flex: 1 }]}
                  onPress={() =>
                    router.push({ pathname: "/share-card", params: { tripId: item.id } })
                  }
                  activeOpacity={0.8}
                >
                  <Feather name="share-2" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>分享卡片</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="truck" size={56} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>今天还没出车哦</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                去发布常用路线，快速拼满一车
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.immediate }]}
                onPress={() => router.push("/driver-publish")}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyBtnText}>一键发布路线</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  notifDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  notifDotText: { color: "#fff", fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  modeSwitch: { flexDirection: "row", borderRadius: 10, padding: 3 },
  modeBtn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 7 },
  modeBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  list: { padding: 16, gap: 0 },

  // Notification section
  notifSection: { marginBottom: 16 },
  notifLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  notifPulse: { width: 8, height: 8, borderRadius: 4 },
  notifLabel: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },

  // Accepted card
  acceptedCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  acceptedHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  acceptedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptedTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  acceptedSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  driverInfoBox: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  driverInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  driverInfoLabel: { fontSize: 13, fontFamily: "Inter_400Regular", width: 28 },
  driverInfoVal: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", flex: 1 },
  divider: { height: 1 },
  acceptedActions: { gap: 8 },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  callBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  viewTripBtn: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 11,
    alignItems: "center",
  },
  viewTripText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  // Booking card
  bookingCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  bookingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusTag: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  seatsText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  routeText: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  pointsRow: { marginBottom: 12 },
  pointItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pointText: { fontSize: 16, fontFamily: "Inter_500Medium", flex: 1 },
  separator: { height: 1, marginLeft: 16, marginVertical: 2 },
  btnRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },

  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40, gap: 10 },
  emptyTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 8 },
  emptySub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  emptyBtn: { marginTop: 12, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
});

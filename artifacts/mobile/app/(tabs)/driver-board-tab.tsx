import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import PassengerCard from "@/components/PassengerCard";

export default function DriverBoardTabScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    myTrips,
    driverPassengers,
    confirmBoarded,
    removePassenger,
    updateSeatCount,
    simulatePassengerRequest,
  } = useApp();

  const topPad = insets.top + 16;
  const bottomPad = (88) + insets.bottom;
  const activeTrip = myTrips[0];
  const remainingSeats = activeTrip?.remainingSeats ?? 0;

  if (!activeTrip) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.titleBar, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.titleText, { color: colors.foreground }]}>接客看板</Text>
        </View>
        <View style={styles.noTrip}>
          <Feather name="truck" size={56} color={colors.mutedForeground} />
          <Text style={[styles.noTripTitle, { color: colors.foreground }]}>暂无进行中的行程</Text>
          <Text style={[styles.noTripSub, { color: colors.mutedForeground }]}>先去发布一个行程吧</Text>
          <TouchableOpacity
            style={[styles.publishBtn, { backgroundColor: colors.immediate }]}
            onPress={() => router.push("/driver-publish")}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.publishBtnText}>发布行程</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.titleBar, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.titleText, { color: colors.foreground }]}>接客看板</Text>
        <TouchableOpacity
          style={[styles.simBtn, { backgroundColor: colors.scheduledLight, borderColor: colors.scheduled }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); simulatePassengerRequest(); }}
          activeOpacity={0.8}
        >
          <Feather name="bell" size={14} color={colors.scheduled} />
          <Text style={[styles.simBtnText, { color: colors.scheduled }]}>模拟抢座</Text>
        </TouchableOpacity>
      </View>

      {/* Status bar */}
      <View style={[styles.statusBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.statusLeft}>
          <Text style={[styles.statusTitle, { color: colors.foreground }]}>
            {activeTrip.timeType === "scheduled" ? activeTrip.scheduledTime : "马上出发"}{"  "}
            {activeTrip.route.from} → {activeTrip.route.to}
          </Text>
          <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>
            共 {activeTrip.totalSeats} 座 · 候客 {driverPassengers.filter((p) => p.status !== "boarded").length} 人
          </Text>
        </View>
        <View style={styles.seatAdjust}>
          <TouchableOpacity
            style={[styles.adjustBtn, { backgroundColor: colors.muted }]}
            onPress={() => { Haptics.selectionAsync(); updateSeatCount(-1); }}
            activeOpacity={0.8}
          >
            <Feather name="minus" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.seatNumWrap}>
            <Text style={[styles.seatNum, { color: remainingSeats === 0 ? colors.immediate : colors.foreground }]}>
              {remainingSeats}
            </Text>
            <Text style={[styles.seatNumSub, { color: colors.mutedForeground }]}>余座</Text>
          </View>
          <TouchableOpacity
            style={[styles.adjustBtn, { backgroundColor: colors.muted }]}
            onPress={() => { Haptics.selectionAsync(); updateSeatCount(1); }}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={driverPassengers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        renderItem={({ item, index }) => (
          <PassengerCard
            passenger={item}
            index={index}
            onConfirmBoarded={confirmBoarded}
            onRemove={removePassenger}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="users" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>暂无乘客</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              乘客抢座后会出现在这里{"\n"}审核通过后开始计划接客
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  titleText: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  simBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  simBtnText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  statusLeft: { flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statusSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  seatAdjust: { flexDirection: "row", alignItems: "center", gap: 10 },
  adjustBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  seatNumWrap: { alignItems: "center" },
  seatNum: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  seatNumSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  list: { padding: 16 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  noTrip: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  noTripTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  noTripSub: { fontSize: 15, fontFamily: "Inter_400Regular" },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
  },
  publishBtnText: { color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
});

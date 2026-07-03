import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import PassengerCard from "@/components/PassengerCard";

export default function DriverBoardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    myTrips,
    driverPassengers,
    confirmBoarded,
    removePassenger,
    updateSeatCount,
  } = useApp();

  const activeTrip = myTrips[0];
  const remainingSeats = activeTrip?.remainingSeats ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "接客看板",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Feather name="arrow-left" size={24} color={colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Status bar */}
      {activeTrip && (
        <View style={[styles.statusBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.statusLeft}>
            <Text style={[styles.statusTitle, { color: colors.foreground }]}>
              {activeTrip.timeType === "scheduled" ? activeTrip.scheduledTime : "马上出发"}  {activeTrip.route.from} → {activeTrip.route.to}
            </Text>
            <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>
              共 {activeTrip.totalSeats} 座 · 候客 {driverPassengers.filter(p => p.status !== "boarded").length} 人
            </Text>
          </View>

          {/* Quick seat adjust */}
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
      )}

      <FlatList
        data={driverPassengers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 20 },
        ]}
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
  seatAdjust: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adjustBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  seatNumWrap: { alignItems: "center" },
  seatNum: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  seatNumSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  list: { padding: 16 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
});

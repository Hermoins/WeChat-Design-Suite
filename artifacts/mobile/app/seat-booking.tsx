import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { TimeTag } from "@/components/TripCard";

export default function SeatBookingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { trips, bookSeat, historyAddresses } = useApp();

  const trip = trips.find((t) => t.id === tripId);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [focusedField, setFocusedField] = useState<"pickup" | "dropoff" | null>(null);

  if (!trip) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 20 }}>行程不存在</Text>
      </View>
    );
  }

  const handleConfirm = () => {
    if (!pickup.trim() || !dropoff.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    bookSeat(trip.id, pickup.trim(), dropoff.trim());
    router.replace({ pathname: "/wait-confirm", params: { tripId: trip.id } });
  };

  const fillAddress = (addr: string) => {
    Haptics.selectionAsync();
    if (focusedField === "pickup" || !pickup) {
      setPickup(addr);
      setFocusedField("dropoff");
    } else {
      setDropoff(addr);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "确认占座",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trip summary */}
        <View style={[styles.tripSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TimeTag timeType={trip.timeType} scheduledTime={trip.scheduledTime} />
          <View style={styles.routeRow}>
            <Text style={[styles.routeText, { color: colors.foreground }]}>{trip.route.from}</Text>
            <Feather name="arrow-right" size={18} color={colors.mutedForeground} />
            <Text style={[styles.routeText, { color: colors.foreground }]}>{trip.route.to}</Text>
          </View>
          <View style={[styles.driverRow, { borderTopColor: colors.border }]}>
            <Feather name="user" size={14} color={colors.mutedForeground} />
            <Text style={[styles.driverText, { color: colors.mutedForeground }]}>{trip.driverName}</Text>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <Feather name="users" size={14} color={colors.mutedForeground} />
            <Text style={[styles.driverText, { color: colors.mutedForeground }]}>余 {trip.remainingSeats} 座</Text>
          </View>
        </View>

        {/* Input fields */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>精确填写上下车点</Text>
        <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
          请填写具体到小区门/路口，方便司机接你
        </Text>

        <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.inputRow}>
            <View style={[styles.inputDot, { backgroundColor: colors.success }]} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="上车点（具体到小区门）"
              placeholderTextColor={colors.mutedForeground}
              value={pickup}
              onChangeText={setPickup}
              onFocus={() => setFocusedField("pickup")}
              returnKeyType="next"
            />
            {pickup ? (
              <TouchableOpacity onPress={() => setPickup("")} activeOpacity={0.7}>
                <Feather name="x-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={[styles.inputSeparator, { backgroundColor: colors.border }]} />

          <View style={styles.inputRow}>
            <View style={[styles.inputDot, { backgroundColor: colors.immediate }]} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="下车点（具体到地点）"
              placeholderTextColor={colors.mutedForeground}
              value={dropoff}
              onChangeText={setDropoff}
              onFocus={() => setFocusedField("dropoff")}
              returnKeyType="done"
              onSubmitEditing={handleConfirm}
            />
            {dropoff ? (
              <TouchableOpacity onPress={() => setDropoff("")} activeOpacity={0.7}>
                <Feather name="x-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* History addresses */}
        {historyAddresses.length > 0 && (
          <>
            <Text style={[styles.historyLabel, { color: colors.mutedForeground }]}>
              <Feather name="clock" size={12} />  常用地址
            </Text>
            <View style={styles.historyRow}>
              {historyAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr}
                  style={[styles.historyChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => fillAddress(addr)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.historyChipText, { color: colors.foreground }]}>{addr}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Notice */}
        <View style={[styles.notice, { backgroundColor: colors.scheduledLight ?? colors.muted }]}>
          <Feather name="info" size={14} color={colors.scheduled} />
          <Text style={[styles.noticeText, { color: colors.scheduled }]}>
            确认占座后，司机有60秒时间审核。接单成功后将解锁司机联系方式。
          </Text>
        </View>
      </ScrollView>

      {/* Confirm button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: pickup.trim() && dropoff.trim() ? colors.immediate : colors.muted },
          ]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={!pickup.trim() || !dropoff.trim()}
        >
          <Text style={[styles.confirmBtnText, { color: pickup.trim() && dropoff.trim() ? "#fff" : colors.mutedForeground }]}>
            确认占座
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 8 },
  tripSummary: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  routeText: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  driverText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  dot: { width: 3, height: 3, borderRadius: 2 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  sectionHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  inputCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  inputDot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    padding: 0,
    margin: 0,
  },
  inputSeparator: { height: 1, marginLeft: 44 },
  historyLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 12,
    marginBottom: 8,
  },
  historyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  historyChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  historyChipText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  notice: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 12,
    alignItems: "flex-start",
  },
  noticeText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  confirmBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  confirmBtnText: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
});

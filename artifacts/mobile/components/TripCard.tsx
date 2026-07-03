import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Trip } from "@/context/AppContext";

interface Props {
  trip: Trip;
  onGrab: (trip: Trip) => void;
}

export function TimeTag({ timeType, scheduledTime }: { timeType: Trip["timeType"]; scheduledTime: string | null }) {
  const colors = useColors();
  const bgColor =
    timeType === "now"
      ? colors.immediate
      : timeType === "soon"
      ? colors.soon
      : colors.scheduled;

  const label =
    timeType === "now"
      ? "马上走"
      : timeType === "soon"
      ? "10分钟后"
      : scheduledTime ?? "预约";

  return (
    <View style={[styles.timeTag, { backgroundColor: bgColor }]}>
      <Text style={styles.timeTagText}>{label}</Text>
    </View>
  );
}

export default function TripCard({ trip, onGrab }: Props) {
  const colors = useColors();
  const isFull = trip.remainingSeats === 0;

  const handleGrab = () => {
    if (isFull) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGrab(trip);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <TimeTag timeType={trip.timeType} scheduledTime={trip.scheduledTime} />
        <View style={[styles.seatBadge, { backgroundColor: isFull ? colors.muted : colors.primaryForeground }]}>
          <Text style={[styles.seatIcon, { color: isFull ? colors.mutedForeground : colors.immediate }]}>
            <Feather name="users" size={13} />
          </Text>
          <Text style={[styles.seatText, { color: isFull ? colors.mutedForeground : colors.foreground }]}>
            {isFull ? "满座" : `余 ${trip.remainingSeats} 座`}
          </Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <Text style={[styles.routeFrom, { color: colors.foreground }]}>{trip.route.from}</Text>
        <View style={styles.arrowWrap}>
          <Feather name="arrow-right" size={20} color={colors.mutedForeground} />
        </View>
        <Text style={[styles.routeTo, { color: colors.foreground }]}>{trip.route.to}</Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.driverInfo}>
          <Feather name="user" size={14} color={colors.mutedForeground} />
          <Text style={[styles.driverName, { color: colors.mutedForeground }]}>{trip.driverName}</Text>
          <Text style={[styles.dot, { color: colors.border }]}>·</Text>
          <Feather name="lock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.hiddenPhone, { color: colors.mutedForeground }]}>  车牌/电话抢座后显示</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.grabBtn,
            {
              backgroundColor: isFull ? colors.muted : colors.immediate,
            },
          ]}
          onPress={handleGrab}
          disabled={isFull}
          activeOpacity={0.75}
        >
          <Text style={[styles.grabBtnText, { color: isFull ? colors.mutedForeground : "#fff" }]}>
            {isFull ? "满座" : "抢座"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeTag: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  timeTagText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  seatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  seatIcon: { fontSize: 13 },
  seatText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  routeFrom: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  arrowWrap: {
    marginHorizontal: 12,
  },
  routeTo: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  driverName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  dot: { fontSize: 16 },
  hiddenPhone: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  grabBtn: {
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  grabBtnText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});

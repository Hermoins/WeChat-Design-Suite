import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
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

export default function TripSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { trips, myBookings } = useApp();

  const trip = trips.find((t) => t.id === tripId) ?? trips[0];
  const booking = myBookings.find((b) => b.tripId === tripId);

  const callDriver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (Platform.OS !== "web" && trip?.driverPhone) {
      Linking.openURL(`tel:${trip.driverPhone}`);
    }
  };

  if (!trip) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.successLight ?? colors.background }]}>
      <Stack.Screen
        options={{
          title: "拼车成功",
          headerStyle: { backgroundColor: "transparent" },
          headerTransparent: true,
          headerTintColor: colors.success,
          headerShadowVisible: false,
        }}
      />

      <View style={[styles.content, { paddingTop: (insets.top || Platform.OS === "web" ? 80 : 60), paddingBottom: insets.bottom + 40 }]}>
        {/* Success icon */}
        <View style={[styles.successCircle, { backgroundColor: colors.success }]}>
          <Feather name="check" size={52} color="#fff" />
        </View>
        <Text style={[styles.successTitle, { color: colors.success }]}>拼车成功！</Text>
        <Text style={[styles.successSub, { color: colors.foreground }]}>等待接驾中</Text>

        {/* Trip info card */}
        <View style={[styles.card, { backgroundColor: "#fff", borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <TimeTag timeType={trip.timeType} scheduledTime={trip.scheduledTime} />
          </View>
          <View style={styles.routeRow}>
            <Text style={[styles.routeText, { color: colors.foreground }]}>{trip.route.from}</Text>
            <Feather name="arrow-right" size={20} color={colors.mutedForeground} />
            <Text style={[styles.routeText, { color: colors.foreground }]}>{trip.route.to}</Text>
          </View>

          {booking && (
            <View style={[styles.pointsSection, { borderTopColor: colors.border }]}>
              <View style={styles.pointRow}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <View>
                  <Text style={[styles.pointLabel, { color: colors.mutedForeground }]}>上车点</Text>
                  <Text style={[styles.pointValue, { color: colors.foreground }]}>{booking.pickupPoint}</Text>
                </View>
              </View>
              <View style={styles.pointRow}>
                <View style={[styles.dot, { backgroundColor: colors.immediate }]} />
                <View>
                  <Text style={[styles.pointLabel, { color: colors.mutedForeground }]}>下车点</Text>
                  <Text style={[styles.pointValue, { color: colors.foreground }]}>{booking.dropoffPoint}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Driver info - unlocked */}
          <View style={[styles.driverSection, { borderTopColor: colors.border, backgroundColor: colors.successLight ?? colors.muted }]}>
            <Text style={[styles.driverSectionLabel, { color: colors.success }]}>
              司机信息已解锁
            </Text>
            <View style={styles.driverRow}>
              <View style={styles.driverItem}>
                <Text style={[styles.driverItemLabel, { color: colors.mutedForeground }]}>司机</Text>
                <Text style={[styles.driverItemValue, { color: colors.foreground }]}>{trip.driverName}</Text>
              </View>
              <View style={styles.driverItem}>
                <Text style={[styles.driverItemLabel, { color: colors.mutedForeground }]}>车牌</Text>
                <Text style={[styles.driverItemValue, { color: colors.foreground }]}>{trip.driverPlate}</Text>
              </View>
              <View style={styles.driverItem}>
                <Text style={[styles.driverItemLabel, { color: colors.mutedForeground }]}>车型</Text>
                <Text style={[styles.driverItemValue, { color: colors.foreground }]}>{trip.driverCar}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Call button */}
        <TouchableOpacity
          style={[styles.callBtn, { backgroundColor: colors.success }]}
          onPress={callDriver}
          activeOpacity={0.85}
        >
          <Feather name="phone" size={24} color="#fff" />
          <Text style={styles.callBtnText}>一键拨打司机电话</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.8}
        >
          <Text style={[styles.backBtnText, { color: colors.mutedForeground }]}>返回大厅</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 32, fontWeight: "700", fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 18, fontFamily: "Inter_500Medium" },
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  cardHeader: { padding: 16, paddingBottom: 0 },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, paddingTop: 10 },
  routeText: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  pointsSection: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, gap: 10 },
  pointRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  pointLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  pointValue: { fontSize: 18, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  driverSection: { borderTopWidth: 1, padding: 16 },
  driverSectionLabel: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  driverRow: { flexDirection: "row", gap: 16 },
  driverItem: { flex: 1 },
  driverItemLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  driverItemValue: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginTop: 2 },
  callBtn: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  callBtnText: { color: "#fff", fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  backBtn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  backBtnText: { fontSize: 16, fontFamily: "Inter_500Medium" },
});

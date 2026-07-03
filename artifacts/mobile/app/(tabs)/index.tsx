import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import TripCard from "@/components/TripCard";
import DriverReviewSheet from "@/components/DriverReviewSheet";
import type { Trip } from "@/context/AppContext";

const ROUTES = [
  { key: "all", label: "全部" },
  { key: "to-daoyuan", label: "新城子 → 道义" },
  { key: "to-xinchengzi", label: "道义 → 新城子" },
];

export default function HallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    trips,
    routeFilter,
    setRouteFilter,
    reviewRequest,
    approvePassenger,
    rejectPassenger,
    dismissReview,
  } = useApp();

  const filtered = trips.filter((t) => {
    if (routeFilter === "to-daoyuan") return t.route.from === "新城子";
    if (routeFilter === "to-xinchengzi") return t.route.from === "道义商圈";
    return true;
  });

  const handleGrab = (trip: Trip) => {
    router.push({ pathname: "/seat-booking", params: { tripId: trip.id } });
  };

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>拼车大厅</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>沈北·新城子同城拼车</Text>
      </View>

      {/* Route filter */}
      <View style={[styles.filterWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {ROUTES.map((r) => {
            const active = routeFilter === r.key;
            return (
              <TouchableOpacity
                key={r.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.immediate : colors.muted,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setRouteFilter(r.key as any);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterText, { color: active ? "#fff" : colors.mutedForeground }]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Trip list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TripCard trip={item} onGrab={handleGrab} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: (Platform.OS === "web" ? 84 : 62) + insets.bottom + 16 },
        ]}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>当前没有车次</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              您可以发布出行需求，等候司机匹配
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.immediate }]}
              onPress={() => router.push("/driver-publish")}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyBtnText}>发布出行需求</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Driver review sheet */}
      <DriverReviewSheet
        request={reviewRequest}
        onApprove={approvePassenger}
        onReject={rejectPassenger}
        onDismiss={dismissReview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  filterWrap: {
    borderBottomWidth: 1,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    padding: 16,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
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
import type { Trip } from "@/context/AppContext";

function ShareCardView({ trip }: { trip: Trip }) {
  const isImmediate = trip.timeType === "now";
  const isSoon = trip.timeType === "soon";
  const isScheduled = trip.timeType === "scheduled";

  const accentColor = isScheduled ? "#1D6FA4" : isImmediate ? "#A93226" : "#C86820";
  const accentLight = isScheduled ? "#E8F4FD" : isImmediate ? "#FDF0F0" : "#FDF3E8";

  const timeLabel = isImmediate
    ? "马上走"
    : isSoon
    ? "10分钟后"
    : trip.scheduledTime ?? "预约";

  return (
    <View style={styles.card}>
      {/* Colored header band */}
      <View style={[styles.cardBand, { backgroundColor: accentColor }]}>
        <Text style={styles.seatCountBig}>[余{trip.remainingSeats}座]</Text>
        <View style={styles.timeTagBig}>
          <Text style={styles.timeTagBigText}>{timeLabel}</Text>
        </View>
      </View>

      {/* White body */}
      <View style={[styles.cardBody, { backgroundColor: "#FFFFFF" }]}>
        {/* Route — largest element */}
        <View style={styles.routeSection}>
          <Text style={[styles.routeCity, { color: "#111111" }]}>{trip.route.from}</Text>
          <View style={[styles.arrowBig, { backgroundColor: accentLight }]}>
            <Feather name="arrow-right" size={22} color={accentColor} />
          </View>
          <Text style={[styles.routeCity, { color: "#111111" }]}>{trip.route.to}</Text>
        </View>

        {/* Divider with dots */}
        <View style={styles.dividerRow}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={[styles.dividerDot, { backgroundColor: accentColor + "30" }]} />
          ))}
        </View>

        {/* CTA and driver info */}
        <View style={styles.cardFooter}>
          <View style={styles.ctaWrap}>
            <Text style={styles.ctaMain}>点击卡片立刻占座</Text>
            <Text style={styles.ctaSub}>上门接送 · 按时发车</Text>
          </View>
          <View style={[styles.ctaBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.ctaBadgeText}>抢座</Text>
            <Feather name="arrow-right" size={14} color="#fff" />
          </View>
        </View>

        {/* Bottom watermark */}
        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>沈北拼车 · 新城子↔道义商圈</Text>
        </View>
      </View>
    </View>
  );
}

export default function ShareCardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { trips } = useApp();

  const trip = trips.find((t) => t.id === tripId) ?? trips[0];

  if (!trip) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, padding: 20 }}>行程不存在</Text>
      </View>
    );
  }

  const handleShare = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "分享卡片",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        {/* Instruction */}
        <View style={[styles.instruction, { backgroundColor: colors.scheduledLight, borderColor: colors.scheduled }]}>
          <Feather name="info" size={15} color={colors.scheduled} />
          <Text style={[styles.instructionText, { color: colors.scheduled }]}>
            截图此卡片，发到微信群 / 朋友圈，乘客点击进入小程序即可一键抢座
          </Text>
        </View>

        {/* The card itself */}
        <ShareCardView trip={trip} />

        {/* Tip */}
        <Text style={[styles.tip, { color: colors.mutedForeground }]}>
          ↑ 长按卡片区域可截图保存
        </Text>
      </ScrollView>

      {/* Action buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.success }]}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Feather name="share-2" size={20} color="#fff" />
          <Text style={styles.shareBtnText}>分享到微信群</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.boardBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.replace("/driver-board")}
          activeOpacity={0.8}
        >
          <Feather name="list" size={18} color={colors.foreground} />
          <Text style={[styles.boardBtnText, { color: colors.foreground }]}>
            进入接客看板
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },

  instruction: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },

  // Share card
  card: {
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: { elevation: 6 },
      web: {
        boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
      } as any,
    }),
  },
  cardBand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 18,
  },
  cardBody: {
    // white section
  },
  seatCountBig: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  timeTagBig: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  timeTagBigText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },

  routeSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 10,
    flexWrap: "nowrap",
  },
  routeCity: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    flexShrink: 1,
    textAlign: "center",
  },
  arrowBig: {
    borderRadius: 20,
    padding: 8,
  },

  dividerRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 5,
    marginBottom: 16,
    flexWrap: "nowrap",
    overflow: "hidden",
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 14,
  },
  ctaWrap: { flex: 1 },
  ctaMain: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  ctaSub: {
    color: "#888888",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  ctaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  ctaBadgeText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },

  watermark: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  watermarkText: {
    color: "#BBBBBB",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  tip: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: -4,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    gap: 10,
  },
  shareBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  shareBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  boardBtn: {
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  boardBtnText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
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

interface MenuItemProps {
  icon: string;
  label: string;
  sub?: string;
  badge?: string;
  badgeColor?: string;
  onPress: () => void;
  iconColor?: string;
}

function MenuItem({ icon, label, sub, badge, badgeColor, onPress, iconColor }: MenuItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: (iconColor ?? colors.immediate) + "18" }]}>
        <Feather name={icon as any} size={20} color={iconColor ?? colors.immediate} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color: colors.foreground }]}>{label}</Text>
        {sub && <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{sub}</Text>}
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor ?? colors.immediate }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userRole, savedRoutes, removeSavedRoute, simulatePassengerRequest } = useApp();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = (Platform.OS === "web" ? 84 : 62) + insets.bottom + 16;

  const isDriver = userRole === "driver";
  const roleColor = isDriver ? colors.immediate : colors.scheduled;
  const roleLabel = isDriver ? "司机" : "乘客";
  const roleIcon = isDriver ? "truck" : "users";

  const handleSwitchRole = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push("/role-select");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1C1C1E" }]}>
        <View style={styles.avatarWrap}>
          <Feather name="user" size={40} color="#fff" />
        </View>
        <Text style={styles.userName}>用户_12345</Text>
        <Text style={styles.userSub}>沈北新城子 · 拼车用户</Text>
        <View style={[styles.rolePill, { backgroundColor: roleColor + "30" }]}>
          <Feather name={roleIcon as any} size={13} color={roleColor} />
          <Text style={[styles.rolePillText, { color: roleColor }]}>{roleLabel}端</Text>
        </View>
      </View>

      {/* Switch role banner */}
      <TouchableOpacity
        style={[styles.switchBanner, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={handleSwitchRole}
        activeOpacity={0.85}
      >
        <View style={[styles.switchIcon, { backgroundColor: roleColor + "18" }]}>
          <Feather name="refresh-cw" size={18} color={roleColor} />
        </View>
        <View style={styles.switchText}>
          <Text style={[styles.switchTitle, { color: colors.foreground }]}>切换身份</Text>
          <Text style={[styles.switchSub, { color: colors.mutedForeground }]}>
            当前：{roleLabel}端 · 点击切换为{isDriver ? "乘客" : "司机"}端
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      {/* Demo: simulate passenger request (driver only) */}
      {isDriver && (
        <TouchableOpacity
          style={[styles.simulateBtn, { backgroundColor: colors.scheduledLight, borderColor: colors.scheduled }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            simulatePassengerRequest();
          }}
          activeOpacity={0.8}
        >
          <Feather name="bell" size={18} color={colors.scheduled} />
          <Text style={[styles.simulateBtnText, { color: colors.scheduled }]}>
            模拟乘客抢座请求（演示）
          </Text>
        </TouchableOpacity>
      )}

      {/* Saved routes */}
      {savedRoutes.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>常用路线</Text>
          {savedRoutes.map((route, i) => (
            <View
              key={i}
              style={[styles.savedRouteRow, { borderBottomColor: colors.border }]}
            >
              <Feather name="navigation" size={16} color={roleColor} />
              <Text style={[styles.savedRouteText, { color: colors.foreground }]}>
                {route.from} → {route.to}
              </Text>
              <TouchableOpacity
                onPress={() => { Haptics.selectionAsync(); removeSavedRoute(i); }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Menu sections */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>出行</Text>
        {!isDriver && (
          <MenuItem
            icon="navigation"
            label="我的行程"
            sub="查看历史拼车记录"
            onPress={() => router.push("/(tabs)/my-trips")}
            iconColor={colors.scheduled}
          />
        )}
        <MenuItem
          icon="star"
          label="常用地址"
          sub="管理常用上下车点"
          onPress={() => Haptics.selectionAsync()}
          iconColor={colors.soon}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>我的</Text>
        <MenuItem
          icon="shield"
          label="实名认证"
          badge="未认证"
          badgeColor={colors.soon}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          iconColor={colors.success}
        />
        <MenuItem
          icon="settings"
          label="设置"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          iconColor={colors.mutedForeground}
        />
        <MenuItem
          icon="help-circle"
          label="帮助与反馈"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          iconColor={colors.mutedForeground}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: "center",
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  userSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  rolePillText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  switchBanner: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  switchIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  switchText: { flex: 1 },
  switchTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  switchSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  simulateBtn: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  simulateBtnText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  savedRouteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  savedRouteText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: "500", fontFamily: "Inter_500Medium" },
  menuSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import type { UserRole } from "@/context/AppContext";

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();
  const { setUserRole } = useApp();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleSelect = (role: UserRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(role);
  };

  const handleConfirm = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setUserRole(selected);
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>沈北拼车</Text>
        <Text style={styles.title}>你是司机还是乘客？</Text>
        <Text style={styles.sub}>选择后进入对应界面，如需切换请重新登录</Text>
      </View>

      {/* Role cards */}
      <View style={styles.cards}>
        {/* Passenger */}
        <TouchableOpacity
          style={[
            styles.card,
            selected === "passenger" && styles.cardSelected,
            selected === "passenger" && { borderColor: "#1D6FA4" },
          ]}
          onPress={() => handleSelect("passenger")}
          activeOpacity={0.85}
        >
          <View style={[styles.iconWrap, { backgroundColor: selected === "passenger" ? "#E8F4FD" : "#F2F2F7" }]}>
            <Feather name="users" size={36} color={selected === "passenger" ? "#1D6FA4" : "#999"} />
          </View>
          <Text style={[styles.roleTitle, selected === "passenger" && { color: "#1D6FA4" }]}>
            我是乘客
          </Text>
          <Text style={styles.roleSub}>浏览拼车大厅{"\n"}一键抢座出行</Text>
          {selected === "passenger" && (
            <View style={[styles.checkmark, { backgroundColor: "#1D6FA4" }]}>
              <Feather name="check" size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Driver */}
        <TouchableOpacity
          style={[
            styles.card,
            selected === "driver" && styles.cardSelected,
            selected === "driver" && { borderColor: "#A93226" },
          ]}
          onPress={() => handleSelect("driver")}
          activeOpacity={0.85}
        >
          <View style={[styles.iconWrap, { backgroundColor: selected === "driver" ? "#FDF0F0" : "#F2F2F7" }]}>
            <Feather name="truck" size={36} color={selected === "driver" ? "#A93226" : "#999"} />
          </View>
          <Text style={[styles.roleTitle, selected === "driver" && { color: "#A93226" }]}>
            我是司机
          </Text>
          <Text style={styles.roleSub}>发布行程接乘客{"\n"}赚取顺路油费</Text>
          {selected === "driver" && (
            <View style={[styles.checkmark, { backgroundColor: "#A93226" }]}>
              <Feather name="check" size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirm button */}
      <TouchableOpacity
        style={[
          styles.confirmBtn,
          !selected && styles.confirmBtnDisabled,
          selected === "driver" && { backgroundColor: "#A93226" },
          selected === "passenger" && { backgroundColor: "#1D6FA4" },
        ]}
        onPress={handleConfirm}
        activeOpacity={0.85}
        disabled={!selected}
      >
        <Text style={styles.confirmText}>
          {selected ? `进入${selected === "driver" ? "司机" : "乘客"}端` : "请先选择身份"}
        </Text>
        {selected && <Feather name="arrow-right" size={20} color="#fff" />}
      </TouchableOpacity>

      <Text style={styles.tip}>同一账号可以既是司机也是乘客{"\n"}切换请重新进入本页面选择</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  appName: {
    fontSize: 15,
    color: "#999",
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 10,
  },
  sub: {
    fontSize: 14,
    color: "#888",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  cards: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 36,
    width: "100%",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "transparent",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 3 },
      web: { boxShadow: "0 2px 12px rgba(0,0,0,0.08)" } as any,
    }),
    position: "relative",
  },
  cardSelected: {
    ...Platform.select({
      ios: { shadowOpacity: 0.15, shadowRadius: 16 },
      android: { elevation: 6 },
      web: { boxShadow: "0 4px 20px rgba(0,0,0,0.12)" } as any,
    }),
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#333",
    marginBottom: 8,
  },
  roleSub: {
    fontSize: 13,
    color: "#888",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  checkmark: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtn: {
    width: "100%",
    backgroundColor: "#ccc",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  confirmBtnDisabled: {
    backgroundColor: "#D0D0D8",
  },
  confirmText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  tip: {
    fontSize: 12,
    color: "#AAAAAA",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
});

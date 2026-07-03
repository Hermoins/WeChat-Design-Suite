import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Passenger } from "@/context/AppContext";

interface Props {
  passenger: Passenger;
  index: number;
  onConfirmBoarded: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function PassengerCard({ passenger, index, onConfirmBoarded, onRemove }: Props) {
  const colors = useColors();
  const isBoarded = passenger.status === "boarded";

  const callPassenger = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS !== "web") {
      Linking.openURL(`tel:${passenger.phone}`);
    }
  };

  const navigate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS !== "web") {
      Linking.openURL(
        `maps://app?daddr=${encodeURIComponent(passenger.pickupPoint)}`
      );
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isBoarded ? colors.muted : colors.card,
          borderColor: isBoarded ? colors.border : colors.border,
          opacity: isBoarded ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.indexBadge}>
        <Text style={[styles.indexText, { color: colors.mutedForeground }]}>
          #{index + 1}
        </Text>
      </View>

      <View style={styles.main}>
        <View style={styles.pointRow}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={[styles.pointText, { color: colors.foreground }]} numberOfLines={1}>
            {passenger.pickupPoint}
          </Text>
        </View>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <View style={styles.pointRow}>
          <View style={[styles.dot, { backgroundColor: colors.immediate }]} />
          <Text style={[styles.pointText, { color: colors.foreground }]} numberOfLines={1}>
            {passenger.dropoffPoint}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.scheduledLight ?? colors.muted }]}
          onPress={callPassenger}
          activeOpacity={0.7}
        >
          <Feather name="phone" size={20} color={colors.scheduled} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.successLight ?? colors.muted }]}
          onPress={navigate}
          activeOpacity={0.7}
        >
          <Feather name="navigation" size={20} color={colors.success} />
        </TouchableOpacity>
      </View>

      <View style={styles.statusRow}>
        {!isBoarded ? (
          <TouchableOpacity
            style={[styles.boardedBtn, { backgroundColor: colors.success }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onConfirmBoarded(passenger.id);
            }}
            activeOpacity={0.8}
          >
            <Feather name="check" size={14} color="#fff" />
            <Text style={styles.boardedBtnText}>确认上车</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.boardedTag, { backgroundColor: colors.successLight ?? colors.muted }]}>
            <Text style={[styles.boardedTagText, { color: colors.success }]}>已上车</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onRemove(passenger.id);
          }}
          activeOpacity={0.7}
          style={styles.removeBtn}
        >
          <Feather name="user-x" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  indexBadge: { marginBottom: 8 },
  indexText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  main: { marginBottom: 12 },
  pointRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pointText: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold", flex: 1 },
  line: { width: 2, height: 12, marginLeft: 4, marginVertical: 2 },
  actions: { flexDirection: "row", gap: 10, marginBottom: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  boardedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flex: 1,
    justifyContent: "center",
  },
  boardedBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  boardedTag: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  boardedTagText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  removeBtn: { padding: 10 },
});

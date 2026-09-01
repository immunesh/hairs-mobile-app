import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { colors } from "@/theme/colors";
import type { MainTabParamList } from "@/core/navigation/types";

type Props = {
  navigation: BottomTabScreenProps<MainTabParamList, "Home">["navigation"];
};

export function TryOnPromo({ navigation }: Props) {
  return (
    <LinearGradient
      colors={["#8B5CF6", "#4C1D95"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.badge}>
        <Ionicons name="flash" size={12} color="#FACC15" />
        <Text style={styles.badgeText}>AI-Powered Feature</Text>
      </View>

      <Text style={styles.title}>Try Before You Buy</Text>
      <Text style={styles.description}>
        Our revolutionary virtual try-on uses AI to overlay any wig on your live camera feed. See
        exactly how you'll look before adding to your bag.
      </Text>

      <Pressable
        onPress={() => navigation.navigate("TryOn")}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Ionicons name="flash" size={15} color={colors.purple.DEFAULT} />
        <Text style={styles.primaryButtonText}>Try On Free Now</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("TryOn")}
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryButtonText}>Learn More</Text>
      </Pressable>

      <View style={styles.previewBox}>
        <Text style={styles.previewDegree}>
          360<Text style={styles.previewDegreeSymbol}>°</Text>
        </Text>
        <Text style={styles.previewTitle}>Product View</Text>
        <Text style={styles.previewSubtitle}>Drag to rotate</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 32,
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 24,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.85,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 18,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 22,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 14,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: colors.purple.DEFAULT,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 999,
    paddingVertical: 14,
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  previewBox: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: "center",
  },
  previewDegree: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.white,
  },
  previewDegreeSymbol: {
    fontSize: 18,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  previewSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginTop: 4,
  },
});

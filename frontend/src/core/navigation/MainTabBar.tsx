import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { colors } from "@/theme/colors";

const TAB_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; center?: boolean }> = {
  Home: { label: "Home", icon: "home" },
  Categories: { label: "Categories", icon: "grid-outline" },
  TryOn: { label: "Try On", icon: "sparkles", center: true },
  Cart: { label: "Cart", icon: "bag-outline" },
  Account: { label: "Account", icon: "person-outline" },
};

export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name];
        if (!config) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (config.center) {
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tabCenterItem}>
              <LinearGradient colors={[colors.purple.light, colors.purple.DEFAULT]} style={styles.tabCenterButton}>
                <Ionicons name={config.icon} size={20} color={colors.white} />
              </LinearGradient>
              <Text style={isFocused ? styles.tabLabelActive : styles.tabLabelInactive}>{config.label}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
            <Ionicons name={config.icon} size={20} color={isFocused ? colors.purple.DEFAULT : "#9CA3AF"} />
            <Text style={isFocused ? styles.tabLabelActive : styles.tabLabelInactive}>{config.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#EDE4F6",
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  tabCenterItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  tabCenterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    shadowColor: colors.purple.DEFAULT,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tabLabelActive: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.purple.DEFAULT,
  },
  tabLabelInactive: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
  },
});

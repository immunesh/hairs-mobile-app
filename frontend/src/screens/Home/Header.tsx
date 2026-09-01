import { useState, useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { HomeTabScreenProps } from "@/core/navigation/types";
import { colors } from "@/theme/colors";

type Navigation = HomeTabScreenProps<"Home">["navigation"];

const QUICK_ACTIONS = [
  {
    key: "tryOn",
    label: "Virtual Try on",
    icon: "scan-outline" as const,
    background: "#3B82F6",
  },
  {
    key: "360",
    label: "360degree feture",
    icon: "sync-outline" as const,
    background: "#16A34A",
  },
  {
    key: "cart",
    label: "Cart",
    icon: "cart-outline" as const,
    background: colors.purple.DEFAULT,
  },
  {
    key: "shopNow",
    label: "Shop Now",
    icon: "bag-handle-outline" as const,
    background: "#D97706",
  },
] as const;

type Props = {
  navigation: Navigation;
};

export function Header({ navigation }: Props) {
  const [deliveryLocation, setDeliveryLocation] = useState("New Delhi, India");

  const loadLocation = async () => {
    try {
      const loc = await AsyncStorage.getItem("selected_delivery_location");
      if (loc) {
        setDeliveryLocation(loc);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLocation();

    // Listen for address selection updates on Web mockups
    if (Platform.OS === "web") {
      const handler = () => loadLocation();
      window.addEventListener("selected_delivery_location_changed", handler);
      return () => {
        window.removeEventListener("selected_delivery_location_changed", handler);
      };
    }
  }, []);

  const handleQuickAction = (key: (typeof QUICK_ACTIONS)[number]["key"]) => {
    if (key === "tryOn" || key === "360") {
      navigation.navigate("TryOn");
    } else if (key === "shopNow") {
      navigation.navigate("Categories");
    }
  };

  const handleSearchSubmit = (text: string) => {
    if (text.trim()) {
      navigation.navigate("ProductList", { searchQuery: text.trim() });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.quickActionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.key}
            onPress={() => handleQuickAction(action.key)}
            style={({ pressed }) => [
              styles.quickActionCard,
              { backgroundColor: action.background },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.quickActionOverlay}>
              {action.key === "360" ? (
                <Text style={styles.quickAction360Text}>360°</Text>
              ) : (
                <Ionicons name={action.icon} size={26} color={colors.white} />
              )}
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.locationRow}>
        <Ionicons name="location-sharp" size={16} color="#1F1233" />
        <Text style={styles.locationText}>{deliveryLocation}</Text>
        <Pressable onPress={() => navigation.navigate("Address")} style={styles.locationLink} hitSlop={8}>
          <Text style={styles.locationLinkText}>Select delivery location</Text>
          <Ionicons name="chevron-forward" size={16} color="#2563EB" />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#2563EB" />
        <TextInput
          placeholder="Search for Products"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={(e) => handleSearchSubmit(e.nativeEvent.text)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  quickActionOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 6,
  },
  quickAction360Text: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F1233",
  },
  locationLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginLeft: "auto",
  },
  locationLinkText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F1233",
    padding: 0,
  },
});

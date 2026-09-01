import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

export type SortOption = "newest" | "priceLow" | "priceHigh" | "topRated";

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest First",
  priceLow: "Price: Low to High",
  priceHigh: "Price: High to Low",
  topRated: "Top Rated",
};

const SORT_OPTIONS = Object.keys(SORT_LABELS) as SortOption[];

export function sortOptionToParams(option: SortOption): { sort: string; order: "asc" | "desc" } {
  switch (option) {
    case "priceLow":
      return { sort: "basePrice", order: "asc" };
    case "priceHigh":
      return { sort: "basePrice", order: "desc" };
    case "topRated":
      return { sort: "rating", order: "desc" };
    default:
      return { sort: "createdAt", order: "desc" };
  }
}

type Props = {
  visible: boolean;
  selected: SortOption;
  onSelect: (option: SortOption) => void;
  onClose: () => void;
};

export function SortModal({ visible, selected, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <Text style={styles.title}>Sort By</Text>

        {SORT_OPTIONS.map((option) => (
          <Pressable
            key={option}
            onPress={() => {
              onSelect(option);
              onClose();
            }}
            style={styles.optionRow}
          >
            <Text style={[styles.optionLabel, option === selected && styles.optionLabelSelected]}>
              {SORT_LABELS[option]}
            </Text>
            {option === selected ? (
              <Ionicons name="checkmark" size={18} color={colors.purple.DEFAULT} />
            ) : null}
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F1233",
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1E6FB",
  },
  optionLabel: {
    fontSize: 14,
    color: "#3F3350",
  },
  optionLabelSelected: {
    color: colors.purple.DEFAULT,
    fontWeight: "700",
  },
});

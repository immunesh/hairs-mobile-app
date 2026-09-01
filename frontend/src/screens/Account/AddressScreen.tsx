import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, Pressable, Modal, TextInput, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { colors } from "@/theme/colors";
import { addAddress, deleteAddress, getAddresses, updateAddress, Address } from "@/services/api/address.api";
import { queryKeys } from "@/services/query/keys";
import { getApiErrorMessage } from "@/services/api/client";

export function AddressScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [name, setName] = useState("Aditya SHARMA");
  const [phone, setPhone] = useState("8954274893");
  const [address, setAddress] = useState("Rb, Mathura");
  const [city, setCity] = useState("Mathura");
  const [state, setState] = useState("UP");
  const [pincode, setPincode] = useState("281001");

  const { data: addresses, isFetching, isError } = useQuery<Address[]>({
    queryKey: queryKeys.addresses,
    queryFn: getAddresses,
  });

  const createAddressMutation = useMutation({
    mutationFn: (payload: Parameters<typeof addAddress>[0]) => addAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
      resetAddressForm();
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateAddress>[1] }) =>
      updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
      resetAddressForm();
    },
  });

  const removeAddressMutation = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
    onError: (error: any) => {
      console.warn("Address delete failed:", error);
      const msg = getApiErrorMessage(error, "Failed to delete address. It may be linked to an existing order.");
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Error", msg);
      }
    },
  });

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setName("");
    setPhone("");
    setAddress("");
    setCity("");
    setState("");
    setPincode("");
  };

  const openNewAddress = () => {
    resetAddressForm();
    setModalVisible(true);
  };

  const openEditAddress = (addressItem: Address) => {
    setEditingAddressId(addressItem.id);
    setName(addressItem.fullName ?? "");
    setPhone(addressItem.phone ?? "");
    setAddress(addressItem.line1 ?? "");
    setCity(addressItem.city ?? "");
    setState(addressItem.state ?? "");
    setPincode(addressItem.pincode ?? "");
    setModalVisible(true);
  };

  const saveAddress = () => {
    const payload = {
      fullName: name,
      phone,
      line1: address,
      city,
      state,
      pincode,
      country: "India",
      type: "HOME",
      isDefault: true,
    };

    if (editingAddressId) {
      updateAddressMutation.mutate({ id: editingAddressId, payload });
    } else {
      createAddressMutation.mutate(payload);
    }

    setModalVisible(false);
  };

  const removeAddress = (id: string) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to delete this address?");
      if (confirmed) {
        console.log("removeAddress", id);
        removeAddressMutation.mutate(id);
      }
    } else {
      Alert.alert(
        "Delete Address",
        "Are you sure you want to delete this address?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              console.log("removeAddress", id);
              removeAddressMutation.mutate(id);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.purple.DEFAULT} />
        </Pressable>
        <Text style={styles.heading}>Saved Addresses</Text>
        <Pressable style={styles.addButton} onPress={openNewAddress}>
          <Ionicons name="add" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.addButtonText}>Add New</Text>
        </Pressable>
      </View>

      {isError ? (
        <View style={styles.card}>
          <Text style={styles.errorText}>Unable to load addresses.</Text>
        </View>
      ) : isFetching ? (
        <View style={styles.card}>
          <Text style={styles.cardText}>Loading addresses...</Text>
        </View>
      ) : addresses?.length ? (
        <ScrollView contentContainerStyle={styles.list}>
          {addresses.map((addressItem) => (
            <Pressable
              key={addressItem.id}
              style={styles.card}
              onPress={async () => {
                try {
                  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
                  const displayStr = `${addressItem.city}, ${addressItem.state}`;
                  await AsyncStorage.setItem("selected_delivery_location", displayStr);
                  // Dispatch a custom event to notify Header of address updates on Web
                  if (Platform.OS === "web") {
                    window.dispatchEvent(new Event("selected_delivery_location_changed"));
                  }
                  navigation.navigate("Home", { screen: "Home" });
                } catch (e) {
                  console.error("Failed to select address:", e);
                }
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{addressItem.fullName}</Text>
                <View style={styles.addressLabel}>
                  <Text style={styles.addressLabelText}>{addressItem.type ?? "HOME"}</Text>
                </View>
              </View>
              <Text style={styles.cardText}>{addressItem.line1}</Text>
              {addressItem.line2 ? <Text style={styles.cardText}>{addressItem.line2}</Text> : null}
              <Text style={styles.cardText}>{addressItem.city}, {addressItem.state} — {addressItem.pincode}</Text>
              <Text style={[styles.cardText, styles.phoneText]}>{addressItem.phone}</Text>
              <View style={styles.cardActions}>
                <Pressable style={styles.editAction} onPress={(e) => { e.stopPropagation(); openEditAddress(addressItem); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.removeAction}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={(e) => { e.stopPropagation(); removeAddress(addressItem.id); }}
                >
                  <Text style={styles.removeText}>Delete</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardText}>No saved address yet.</Text>
        </View>
      )}

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingAddressId ? "Edit Address" : "Add Address"}</Text>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <TextInput value={name} onChangeText={setName} placeholder="Full Name" placeholderTextColor="#9CA3AF" style={styles.modalInput} />
              <TextInput value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#9CA3AF" keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"} style={styles.modalInput} />
              <TextInput value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor="#9CA3AF" style={styles.modalInput} />
              <TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#9CA3AF" style={styles.modalInput} />
              <TextInput value={state} onChangeText={setState} placeholder="State" placeholderTextColor="#9CA3AF" style={styles.modalInput} />
              <TextInput value={pincode} onChangeText={setPincode} placeholder="Pincode" placeholderTextColor="#9CA3AF" keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"} style={styles.modalInput} />
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalOutlineButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalOutlineText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSaveButton} onPress={saveAddress}>
                <Text style={styles.modalSaveText}>{editingAddressId ? "Update" : "Save"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2, marginRight: 12 },
  heading: { fontSize: 20, fontWeight: "700", color: "#111827" },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: colors.purple.DEFAULT, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, elevation: 3 },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 18, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 20, elevation: 3, marginBottom: 16 },
  list: { paddingBottom: 32 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  addressLabel: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  addressLabelText: { color: "#6B21A8", fontWeight: "700", fontSize: 12 },
  cardText: { color: "#374151", fontSize: 14, lineHeight: 22, marginBottom: 4 },
  phoneText: { marginTop: 8 },
  cardActions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 12, gap: 12 },
  editAction: {},
  editText: { color: colors.purple.DEFAULT, fontWeight: "700" },
  removeAction: {},
  removeText: { color: "#E11D48", fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.25)", justifyContent: "center", alignItems: "center", padding: 16 },
  modalCard: { width: "100%", maxWidth: 520, backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 24, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 18 },
  modalForm: { gap: 12 },
  modalInput: { backgroundColor: "#F8FAFC", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", paddingVertical: 16, paddingHorizontal: 16, fontSize: 15, color: "#111827" },
  errorText: { color: "#DC2626", textAlign: "center", marginBottom: 16 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 18 },
  modalOutlineButton: { flex: 1, borderWidth: 1, borderColor: colors.purple.DEFAULT, borderRadius: 999, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  modalOutlineText: { color: colors.purple.DEFAULT, fontWeight: "700" },
  modalSaveButton: { flex: 1, backgroundColor: colors.purple.DEFAULT, borderRadius: 999, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  modalSaveText: { color: "#fff", fontWeight: "700" },
});

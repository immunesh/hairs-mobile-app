import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";

import * as ImagePicker from "expo-image-picker";

import { colors } from "@/theme/colors";
import { updateProfile } from "@/services/api/user.api";
import { getOrders } from "@/services/api/order.api";
import { getWishlist } from "@/services/api/wishlist.api";
import { getMyReviews } from "@/services/api/reviews.api";
import { uploadImage } from "@/services/api/upload.api";
import { resolveAssetUrl } from "@/services/api/client";
import { queryKeys } from "@/services/query/keys";
import { useAuth, useLogout } from "@/features/auth/hooks";
import { signedIn } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/store/hooks";

export function AccountScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const [firstName, setFirstName] = useState(user?.firstName ?? "Aditya");
  const [lastName, setLastName] = useState(user?.lastName ?? "Sharma");
  const [email, setEmail] = useState(user?.email ?? "adityasharmajn@gmail.com");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [modalVisible, setModalVisible] = useState(false);
  const [draftFirst, setDraftFirst] = useState(firstName);
  const [draftLast, setDraftLast] = useState(lastName);
  const [draftPhone, setDraftPhone] = useState(phone);

  const ordersQuery = useQuery({
    queryKey: queryKeys.orders,
    queryFn: getOrders,
    enabled: !!user,
  });

  const wishlistQuery = useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: getWishlist,
    enabled: !!user,
  });

  const reviewsQuery = useQuery({
    queryKey: queryKeys.myReviews,
    queryFn: getMyReviews,
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "Aditya");
      setLastName(user.lastName ?? "Sharma");
      setEmail(user.email ?? "adityasharmajn@gmail.com");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      setFirstName(updatedUser.firstName ?? "");
      setLastName(updatedUser.lastName ?? "");
      setPhone(updatedUser.phone ?? "");
      setEmail(updatedUser.email ?? "");
      dispatch(signedIn({ ...user!, ...updatedUser }));
    },
  });

  const handleEditAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to upload your profile image!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        const localUri = selectedImage.uri;
        const filename = localUri.split("/").pop() || "profile.jpg";

        // Convert the URI to a Blob (works on both native and web)
        const response = await fetch(localUri);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append("image", blob, filename);

        const uploadRes = await uploadImage(formData);
        if (uploadRes.success && uploadRes.url) {
          profileMutation.mutate({ avatar: uploadRes.url });
        }
      }
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      alert("Failed to upload image. Please try again.");
    }
  };

  const saveDrafts = () => {
    setFirstName(draftFirst);
    setLastName(draftLast);
    setPhone(draftPhone);
    setModalVisible(false);
    profileMutation.mutate({ firstName: draftFirst, lastName: draftLast, phone: draftPhone });
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.wrapper}>
      <View style={styles.headerCardGradient}>
        <View style={styles.decorativeCircle} />
        <View style={styles.headerInner}>
          <View style={styles.avatarWrapGradient}>
            <Image
              source={
                user?.avatar
                  ? { uri: resolveAssetUrl(user.avatar) }
                  : { uri: "https://i.pravatar.cc/150?img=12" }
              }
              style={styles.avatarImage}
            />
            <TouchableOpacity style={styles.avatarEdit} activeOpacity={0.8} onPress={handleEditAvatar}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfoMain}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.nameLarge}>{firstName} {lastName}</Text>
              <View style={styles.verifiedBadge}><Ionicons name="checkmark" size={12} color="#059669" /><Text style={styles.verifiedText}>Verified</Text></View>
            </View>
            <Text style={styles.emailLarge}>{email}</Text>
          </View>

          <TouchableOpacity style={styles.chev} onPress={() => { setDraftFirst(firstName); setDraftLast(lastName); setDraftPhone(phone); setModalVisible(true); }}>
            <Ionicons name="chevron-forward" size={22} color="#6B21A8" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRowCard}>
          <View style={styles.statCardContainer}>
            <View style={styles.statCardInner}>
              <View style={styles.statIcon}><Ionicons name="bag-handle" size={18} color={colors.purple.DEFAULT} /></View>
              <Text style={styles.statNumberCard}>{ordersQuery.data?.length ?? 0}</Text>
              <Text style={styles.statLabelCard}>Orders</Text>
            </View>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.statCardContainer}>
            <View style={styles.statCardInner}>
              <View style={styles.statIcon}><Ionicons name="heart" size={18} color={colors.purple.DEFAULT} /></View>
              <Text style={styles.statNumberCard}>{wishlistQuery.data?.length ?? 0}</Text>
              <Text style={styles.statLabelCard}>Wishlist</Text>
            </View>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.statCardContainer}>
            <View style={styles.statCardInner}>
              <View style={styles.statIcon}><Ionicons name="star" size={18} color={colors.purple.DEFAULT} /></View>
              <Text style={styles.statNumberCard}>{reviewsQuery.data?.length ?? 0}</Text>
              <Text style={styles.statLabelCard}>Reviews</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <MenuRow icon="person" label="My Profile" onPress={() => navigation.navigate("Profile" as never)} />
        <MenuRow icon="location" label="My Addresses" onPress={() => navigation.navigate("Address" as never)} />

        <MenuRow icon="notifications" label="Notifications" onPress={() => navigation.navigate("NotificationPreferences" as never)} />
        <MenuRow icon="star" label="My Reviews" onPress={() => navigation.navigate("Review" as never)} />
        <MenuRow icon="bag-handle" label="My Orders" onPress={() => navigation.navigate("Order" as never)} />
        <MenuRow icon="heart" label="Wishlist" onPress={() => navigation.navigate("Wishlist" as never)} />
        <MenuRow
          icon="log-out"
          label="Sign Out"
          destructive
          onPress={() => {
            logoutMutation.mutate(undefined, {
              onSuccess: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" as never }],
                });
              },
            });
          }}
        />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.sheet}>
            <Text style={modalStyles.title}>Edit Personal Details</Text>
            <Text style={modalStyles.label}>First name</Text>
            <TextInput value={draftFirst} onChangeText={setDraftFirst} style={modalStyles.input} />
            <Text style={modalStyles.label}>Last name</Text>
            <TextInput value={draftLast} onChangeText={setDraftLast} style={modalStyles.input} />
            <Text style={modalStyles.label}>Phone</Text>
            <TextInput value={draftPhone} onChangeText={setDraftPhone} keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"} style={modalStyles.input} />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
              <Pressable style={modalStyles.btnOutline} onPress={() => setModalVisible(false)}>
                <Text style={modalStyles.btnOutlineText}>Cancel</Text>
              </Pressable>
              <Pressable style={modalStyles.btnPrimary} onPress={saveDrafts}>
                <Text style={modalStyles.btnPrimaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  title: { fontSize: 16, fontWeight: "700", color: colors.purple.dark, marginBottom: 12 },
  label: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  input: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 8, marginBottom: 12 },
  btnPrimary: { backgroundColor: colors.purple.DEFAULT, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnOutline: { borderColor: "#E5E7EB", borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginRight: 8 },
  btnOutlineText: { color: "#374151" },
});

const styles = StyleSheet.create({
  wrapper: { backgroundColor: colors.white },
  scroll: { padding: 16, gap: 16 },
  headerCardGradient: { borderRadius: 12, overflow: "hidden", backgroundColor: "#F8F5FF" },
  headerInner: { padding: 16, flexDirection: "row", alignItems: "center" },
  avatarWrapGradient: { width: 76, height: 76, borderRadius: 40, overflow: "hidden", backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6 },
  avatarImage: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, borderColor: "#111827" },
  avatarEdit: { position: "absolute", right: 8, bottom: 8, backgroundColor: colors.purple.DEFAULT, padding: 8, borderRadius: 16, elevation: 3, borderWidth: 0 },
  profileInfoMain: { flex: 1, marginLeft: 12 },
  nameLarge: { fontSize: 18, fontWeight: "700", color: colors.purple.dark },
  emailLarge: { fontSize: 13, color: "#6B7280", marginTop: 6 },
  chev: { padding: 8 },

  decorativeCircle: { position: "absolute", right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: colors.purple.light, opacity: 0.12 },
  statsRowCard: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 8, backgroundColor: "transparent", alignItems: "center" },
  statCardContainer: { flex: 1, paddingHorizontal: 6 },
  statCardInner: { backgroundColor: "#fff", borderRadius: 20, paddingVertical: 16, paddingHorizontal: 10, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(139,92,246,0.16)", alignItems: "center", justifyContent: "center" },
  statNumberCard: { fontSize: 18, fontWeight: "700", color: colors.purple.DEFAULT, marginTop: 10 },
  statLabelCard: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  verticalDivider: { width: 1, height: 70, backgroundColor: "rgba(15,23,42,0.08)", marginHorizontal: 6 },

  menuContainer: { backgroundColor: "#fff", marginTop: 12, borderRadius: 12, paddingVertical: 6, paddingHorizontal: 6, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6 },

  formCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, marginTop: 12 },
  formTitle: { fontSize: 16, fontWeight: "700", color: colors.purple.dark, marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  rowSingle: { marginTop: 8 },
  inputWrap: { flex: 1 },
  inputFull: { width: "100%" },
  label: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  input: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 8, fontSize: 14, color: "#111827" },
  inputDisabled: { opacity: 0.6 },
  hint: { fontSize: 11, color: "#9CA3AF", marginTop: 6 },
  saveButton: { marginTop: 16, backgroundColor: colors.purple.DEFAULT, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  verifiedBadge: { marginLeft: 8, backgroundColor: "rgba(110,231,183,0.08)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, flexDirection: "row", alignItems: "center" },
  verifiedText: { color: "#065F46", fontSize: 12, marginLeft: 6 },
});

const menuStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  active: { backgroundColor: "rgba(139,92,246,0.06)" },
  iconWrap: { width: 32, alignItems: "center", justifyContent: "center" },
  label: { marginLeft: 6, color: "#374151", fontSize: 14 },
});

function MenuRow({ icon, label, active, destructive, onPress }: { icon: string; label: string; active?: boolean; destructive?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity style={[menuStyles.row, active && menuStyles.active]} activeOpacity={0.7} onPress={onPress}>
      <View style={menuStyles.iconWrap}>
        <Ionicons name={icon as any} size={18} color={destructive ? "#E11D48" : colors.purple.DEFAULT} />
      </View>
      <Text style={[menuStyles.label, destructive && { color: "#E11D48" }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: "auto" }} />
    </TouchableOpacity>
  );
}

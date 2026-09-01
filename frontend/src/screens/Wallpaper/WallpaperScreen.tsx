import { Image, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/core/navigation/types";

const wallpaper = require("../../../assets/images/Startings.png");

type Props = NativeStackScreenProps<RootStackParamList, "Wallpaper">;

export function WallpaperScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image source={wallpaper} resizeMode="stretch" style={styles.image} />

      <View style={styles.buttonRow}>
        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={({ pressed }) => [styles.button, styles.loginButton, pressed && styles.pressed]}
        >
          <Text style={styles.loginText}>Login</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={({ pressed }) => [styles.button, styles.registerButton, pressed && styles.pressed]}
        >
          <Text style={styles.registerText}>Register</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  buttonRow: {
    position: "absolute",
    top: "56%",
    left: 32,
    right: 32,
    flexDirection: "column",
    gap: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  loginButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.purple.DEFAULT,
  },
  loginText: {
    color: colors.purple.DEFAULT,
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: colors.purple.DEFAULT,
  },
  registerText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

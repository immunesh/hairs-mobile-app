import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { WallpaperScreen } from "@/screens/Wallpaper/WallpaperScreen";
import { LoginScreen } from "@/screens/Login/LoginScreen";
import { RegisterScreen } from "@/screens/Register/RegisterScreen";
import { ProductDetailScreen } from "@/screens/ProductDetail/ProductDetailScreen";
import { ProductListScreen } from "@/screens/ProductList/ProductListScreen";
import { ProfileScreen } from "@/screens/Account/ProfileScreen";
import { AddressScreen } from "@/screens/Account/AddressScreen";
import { ChangePasswordScreen } from "@/screens/Account/ChangePasswordScreen";
import { NotificationPreferencesScreen } from "@/screens/Account/NotificationPreferencesScreen";
import { ReviewScreen } from "@/screens/Account/ReviewScreen";
import { OrderScreen } from "@/screens/Account/OrderScreen";
import { WishlistScreen } from "@/screens/Account/WishlistScreen";
import { CheckoutScreen } from "@/screens/Cart/CheckoutScreen";
import { OrderConfirmedScreen } from "@/screens/Cart/OrderConfirmedScreen";
import { OrderTrackingScreen } from "@/screens/Cart/OrderTrackingScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Wallpaper" component={WallpaperScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={MainTabNavigator} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Address" component={AddressScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Order" component={OrderScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="ProductList" component={ProductListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

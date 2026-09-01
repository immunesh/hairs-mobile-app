import type { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Wallpaper: undefined;
  Login: undefined;
  Register: undefined;
  Home: NavigatorScreenParams<MainTabParamList> | undefined;
  Profile: undefined;
  Address: undefined;
  ChangePassword: undefined;
  NotificationPreferences: undefined;
  Review: undefined;
  Order: undefined;
  Wishlist: undefined;
  Checkout: { appliedCoupon?: string } | undefined;
  OrderConfirmed: { order: any };
  OrderTracking: { order: any } | undefined;
  ProductDetail: { id: string };
  ProductList: { categorySlug?: string; categoryName?: string; newArrival?: boolean; bestSeller?: boolean; featured?: boolean; searchQuery?: string };
  BlogDetail: { id: string };
  BlogList: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  TryOn: { productId?: string } | undefined;
  Cart: undefined;
  Account: undefined;
};

/** Navigation prop for screens nested in a Home tab that also need to reach root-stack routes (e.g. ProductDetail). */
export type HomeTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

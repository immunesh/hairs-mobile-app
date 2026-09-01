import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { HomeScreen } from "@/screens/Home/HomeScreen";
import { CategoriesScreen } from "@/screens/Categories/CategoriesScreen";
import { TryOnScreen } from "@/screens/TryOn/TryOnScreen";
import { CartScreen } from "@/screens/Cart/CartScreen";
import { AccountScreen } from "@/screens/Account/AccountScreen";
import { MainTabBar } from "./MainTabBar";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <MainTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="TryOn" component={TryOnScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

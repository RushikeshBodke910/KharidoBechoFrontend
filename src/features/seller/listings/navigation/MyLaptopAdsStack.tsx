// src/navigation/stacks/MyLaptopAdsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyLaptopAdsListScreen from '@features/seller/listings/screens/laptop/MyLaptopAdsListScreen';
import LaptopDetailsScreen from '@features/seller/listings/screens/laptop/LaptopDetailsScreen';
import UpdateLaptopScreen from '@features/seller/listings/screens/laptop/UpdateLaptopScreen';

//  ADD THESE IMPORTS
import SellerRequestListScreen from '@features/seller/chat/screens/SellerRequestListScreen';
import SellerChatThreadScreen from '@features/seller/chat/screens/SellerChatThreadScreen';

export type MyLaptopAdsStackParamList = {
  MyLaptopAdsList: undefined;
  LaptopDetails: { laptopId: number };
  UpdateLaptop: { laptopId: number };

  //  ADD TYPE SUPPORT FOR NAVIGATION
  SellerRequestList: { laptopId: number; laptopTitle?: string };
  SellerChatThread: {
    requestId: number;
    buyerId: number;
    laptopId?: number;
    laptopTitle?: string;
  };
};

const Stack = createNativeStackNavigator<MyLaptopAdsStackParamList>();

export default function MyLaptopAdsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MyLaptopAdsList"
        component={MyLaptopAdsListScreen}
      />

      <Stack.Screen
        name="LaptopDetails"
        component={LaptopDetailsScreen}
      />

      {/*  Laptop request list */}
      <Stack.Screen
        name="SellerRequestList"
        component={SellerRequestListScreen}
      />

      {/* Laptop chat thread */}
      <Stack.Screen
        name="SellerChatThread"
        component={SellerChatThreadScreen}
      />

      <Stack.Screen
        name="UpdateLaptop"
        component={UpdateLaptopScreen}
        options={{
          presentation: 'card',
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            // Hide bottom tab bar when editing laptop
            const tabNavigator = navigation.getParent()?.getParent()?.getParent();
            if (tabNavigator) {
              tabNavigator.setOptions({
                tabBarStyle: { display: 'none' },
              });
            }
          },
          blur: () => {
            const tabNavigator = navigation.getParent()?.getParent()?.getParent();
            if (tabNavigator) {
              tabNavigator.setOptions({
                tabBarStyle: undefined,
              });
            }
          },
        })}
      />
    </Stack.Navigator>
  );
}

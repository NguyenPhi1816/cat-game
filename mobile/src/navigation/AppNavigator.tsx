import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import HouseScreen from '../screens/HouseScreen';
import ShopScreen from '../screens/ShopScreen';
import CatsScreen from '../screens/CatsScreen';
import CatDetailScreen from '../screens/CatDetailScreen';
import CreateCatScreen from '../screens/CreateCatScreen';
import FeedCatScreen from '../screens/FeedCatScreen';
import CookScreen from '../screens/CookScreen';
import JobsScreen from '../screens/JobsScreen';

import type { AuthStackParamList, CatsStackParamList, MainTabParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const CatsStack = createNativeStackNavigator<CatsStackParamList>();

function CatsNavigator() {
  return (
    <CatsStack.Navigator>
      <CatsStack.Screen name="CatList" component={CatsScreen} options={{ title: 'My Cats' }} />
      <CatsStack.Screen name="CatDetail" component={CatDetailScreen} options={({ route }) => ({ title: route.params.catName })} />
      <CatsStack.Screen name="CreateCat" component={CreateCatScreen} options={{ title: 'Add Cat' }} />
      <CatsStack.Screen name="FeedCat" component={FeedCatScreen} options={{ title: 'Feed Cat' }} />
      <CatsStack.Screen name="Cook" component={CookScreen} options={{ title: 'Cook' }} />
      <CatsStack.Screen name="Jobs" component={JobsScreen} options={{ title: 'Jobs' }} />
    </CatsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="CatsStack" component={CatsNavigator} options={{ title: 'Cats', headerShown: false }} />
      <Tab.Screen name="House" component={HouseScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <MainTabs />
      ) : (
        <AuthStack.Navigator>
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
          <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

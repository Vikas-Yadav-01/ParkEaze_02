import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import AsyncStorage from '@react-native-async-storage/async-storage'

import SignUpScreen from '../screens/authScreens/SignUpScreen'
import LoginScreen from '../screens/authScreens/LoginScreen'
import HomeScreen from '../screens/mainScreens/HomeScreen'
import HistoryScreen from '../screens/mainScreens/HistoryScreen'
import MyParkingScreen from '../screens/mainScreens/MyParkingScreen'
import EarningScreen from '../screens/mainScreens/EarningScreen'
import ProfileScreen from '../screens/mainScreens/ProfileScreen'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import BookingHistoryScreen from '../screens/mainScreens/BookingHistoryScreen'
import ParkingHistoryScreen from '../screens/mainScreens/ParkingHistoryScreen'
import BookingHistoryDetailScreen from '../screens/mainScreens/BookingHistoryDetailScreen'
import ParkingHistoryDetailScreen from '../screens/mainScreens/ParkingHistoryDetailScreen'
import ParkingSetupScreen from '../screens/mainScreens/ParkingSetupScreen'
import ParkingInfoScreen from '../screens/mainScreens/ParkingInfoScreen'
import PersonalDetailScreen from '../screens/mainScreens/PersonalDetailScreen'
import BankDetailScreen from '../screens/mainScreens/BankDetailScreen'
import ParkingVerificationNavigator from './ParkingVerificationNavigator'
import BookingScreen from '../screens/mainScreens/BookingScreen'
import EntryTokenScreen from '../screens/mainScreens/EntryTokenScreen'
import ExitTokenScreen from '../screens/mainScreens/ExitTokenScreen'
import UpdateProfileScreen from '../screens/mainScreens/UpdateProfile'
import UpdateBankDetailsScreen from '../screens/mainScreens/UpdateBankDetailsScreen'
import UpdatePasswordScreen from '../screens/mainScreens/UpdatePasswordScreen'

const TopTab = createMaterialTopTabNavigator();

export const TopBar = () => {
  return (
    <TopTab.Navigator screenOptions={{
      tabBarActiveTintColor: 'white', tabBarStyle: { backgroundColor: '#0f0f0f' },
      tabBarIndicatorStyle: { backgroundColor: '#fff', height: 1, }, tabBarLabelStyle: { fontSize: 16 },
    }}>
      <TopTab.Screen name='BookingHistory' component={BookingHistoryScreen} />
      <TopTab.Screen name='ParkingHistory' component={ParkingHistoryScreen} />
    </TopTab.Navigator>
  )
}

const StackNavigator = () => {
  useEffect(() => {
    getToken()
  }, [])

  const [savedToken, setSavedToken] = useState("")

  const getToken = async () => {
    const data = await AsyncStorage.getItem("token")
    setSavedToken(data)
  }

  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();

  const AuthStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='SignUp' component={SignUpScreen} />
        <Stack.Screen name='Main' component={BottomTabs} />
      </Stack.Navigator>
    )
  }

  const BottomTabs = () => {
    return (
      <Tab.Navigator screenOptions={{
        tabBarActiveBackgroundColor: "black",
        tabBarInactiveBackgroundColor: "black",
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ddd"
      }}>
        <Tab.Screen name='Home' component={HomeScreen} options={{
          tabBarIcon: ({ focused }) =>
            focused ? (<Ionicons name="home" size={24} color="#fff" />) : (<Ionicons name="home-outline" size={24} color="#ddd" />),
        }} />
        <Tab.Screen name='History' component={HistoryScreen} options={{
          tabBarIcon: ({ focused }) =>
            focused ? (<AntDesign name="clockcircle" size={23} color="#fff" />) : (<AntDesign name="clockcircleo" size={23} color="#ddd" />)
        }} />
        <Tab.Screen name='My-Parking' component={ParkingVerificationNavigator} options={{
          tabBarIcon: ({ focused }) =>
            focused ? (<AntDesign name="pluscircle" size={24} color="#fff" />) : (<AntDesign name="pluscircleo" size={24} color="#ddd" />)
        }} />
        <Tab.Screen name='Earning' component={EarningScreen} options={{
          tabBarIcon: ({ focused }) =>
            focused ? (<AntDesign name="pay-circle1" size={24} color="#fff" />) : (<AntDesign name="pay-circle-o1" size={24} color="#ddd" />)
        }} />
        <Tab.Screen name='Profile' component={ProfileScreen} options={{
          tabBarIcon: ({ focused }) =>
            focused ? (<FontAwesome name="user" size={26} color="#fff" />) : (<FontAwesome name="user-o" size={22} color="#ddd" />)
        }} />
      </Tab.Navigator>
    )
  }

  const MainStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Main' component={BottomTabs} />
        <Stack.Screen name='Auth' component={AuthStack} />
        <Stack.Screen name='BookingHistoryDetail' component={BookingHistoryDetailScreen} />
        <Stack.Screen name='ParkingHistoryDetail' component={ParkingHistoryDetailScreen} />
        <Stack.Screen name='BookingScreen' component={BookingScreen} />
        <Stack.Screen name='BookingHistory' component={BookingHistoryScreen} />
        <Stack.Screen name='EntryToken' component={EntryTokenScreen} />
        <Stack.Screen name='ExitToken' component={ExitTokenScreen} />
        <Stack.Screen name='EditProfile' component={UpdateProfileScreen} />
        <Stack.Screen name='Profile' component={ProfileScreen} />
        <Stack.Screen name='UpdateBank' component={UpdateBankDetailsScreen} />
        <Stack.Screen name='UpdatePassword' component={UpdatePasswordScreen} />

        <Stack.Screen name='ParkingVerification' component={ParkingVerificationNavigator} />
        <Stack.Screen name='ParkingSetup' component={ParkingSetupScreen} />
        <Stack.Screen name='ParkingDetails' component={ParkingInfoScreen} />
        <Stack.Screen name='PersonalDetails' component={PersonalDetailScreen} />
        <Stack.Screen name='BankDetails' component={BankDetailScreen} />
      </Stack.Navigator>
    )
  }

  return (
    <NavigationContainer>
      {savedToken === "" || savedToken === null ? <AuthStack /> : <MainStack />}
    </NavigationContainer>
  )
}

export default StackNavigator
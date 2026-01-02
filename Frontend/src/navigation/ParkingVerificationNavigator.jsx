import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MyParkingScreen from '../screens/mainScreens/MyParkingScreen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import ParkingSetupScreen from '../screens/mainScreens/ParkingSetupScreen';
import ParkingInfoScreen from '../screens/mainScreens/ParkingInfoScreen';
import PersonalDetailScreen from '../screens/mainScreens/PersonalDetailScreen';
import BankDetailScreen from '../screens/mainScreens/BankDetailScreen';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const ParkingVerificationNavigator = () => {
  const [parkingData, setParkingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://192.168.0.100:5000/parkings/parking', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
            setParkingData(response.data.parking);   
        }
      } catch {
        Alert.alert('error', 'Network connection error')
      }finally {
        setLoading(false);
      }
    };
    fetchParkingData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!parkingData?.verification && <Stack.Screen name="ParkingDetails" component={ParkingInfoScreen} />}
      {parkingData?.verification === 'process-2' && <Stack.Screen name="ParkingSetup" component={ParkingSetupScreen} />}
      {parkingData?.verification === 'process-3' && <Stack.Screen name="PersonalDetails" component={PersonalDetailScreen} />}
      {parkingData?.verification === 'process-4' && <Stack.Screen name="BankDetails" component={BankDetailScreen} />}
      {parkingData?.verification === 'completed' && <Stack.Screen name="MyParking" component={MyParkingScreen} />}
    </Stack.Navigator>
  );
};

export default ParkingVerificationNavigator;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f'
  },
})
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const googleMapsDarkTheme = [{
  "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }]
}, {
  "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }]
}, {
  "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }]
}, {
  "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }]
}, {
  "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#64779e" }]
}, {
  "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }]
}, {
  "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }]
}, {
  "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#023e58" }]
}, {
  "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }]
}, {
  "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }]
}, {
  "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }]
}, {
  "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#023e58" }]
}, {
  "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#3C7680" }]
}, {
  "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }]
}, {
  "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }]
}, {
  "featureType": "road", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }]
}, {
  "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }]
}, {
  "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#255763" }]
}, {
  "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#b0d5ce" }]
}, {
  "featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [{ "color": "#023e58" }]
}, {
  "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }]
}, {
  "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }]
}, {
  "featureType": "transit.line", "elementType": "geometry.fill", "stylers": [{ "color": "#283d6a" }]
}, {
  "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#3a4762" }]
}, {
  "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }]
}, {
  "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }]
}]

const ParkingInfoScreen = ({ navigation }) => {
  const [parkingName, setParkingName] = useState('');
  const [address, setAddress] = useState('Select The Location On Map');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ parkingName: '', address: '' });
  const [modalMessage, setModalMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const mapRef = useRef(null);

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    try {
      setLatitude(latitude);
      setLongitude(longitude);
      setAddress('Fetching address...');

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      setAddress(data.display_name || 'Address not found');
    } catch (error) {
      setModalMessage('Failed to fetch address. Please try again.');
      setModalVisible(true);
      setAddress('Address not available');
    }
  };

  const validateInputs = () => {
    const errors = {};
    if (!parkingName.trim()) errors.parkingName = "Parking name is required!";
    if (!address.trim() || address === 'Select The Location On Map') errors.address = "Address is required!";

    setError(errors);
    if (Object.keys(errors).length > 0) {
      setTimeout(() => setError({}), 3000);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;
    if (!latitude || !longitude) {
      setModalMessage('Please select a location on the map');
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        'http://192.168.0.100:5000/parkings/create-parking',
        { parkingName, address, latitude: latitude.toString(), longitude: longitude.toString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        navigation.navigate('ParkingSetup');
      }
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Network Error. Please try again.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
      <Icon name='clipboard-edit-outline' size={24} color="#fff" />
        <Text style={styles.title}>Parking Deatils</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <Icon name='square-edit-outline' size={22} color="#aaa" />
            <Text style={styles.inputLabel}>Parking Name</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder='Enter Your Parking Name'
            placeholderTextColor='#aaa'
            value={parkingName}
            onChangeText={setParkingName}
          />
          {error.parkingName ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color="#FF3B30" />
              <Text style={styles.errorText}>{error.parkingName}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <Entypo name='address' size={22} color="#aaa" />
            <Text style={styles.inputLabel}>Address</Text>
          </View>
          <TouchableOpacity
            style={styles.addressInput}
            onPress={() => mapRef.current?.animateToRegion({
              latitude: latitude || 19.0760,
              longitude: longitude || 72.8777,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }, 1000)}
          >
            <Text style={styles.addressText} numberOfLines={2}> {address} </Text>
            <Icon name="crosshairs-gps" size={20} color="#4CAF50" style={styles.gpsIcon} />
          </TouchableOpacity>
          {error.address ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color="#FF3B30" />
              <Text style={styles.errorText}>{error.address}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <Icon name='map-marker-star' size={22} color="#aaa" />
            <Text style={styles.inputLabel}>Location</Text>
          </View>
          <View style={styles.coordinateRow}>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Latitude</Text>
              <Text style={styles.coordinateText}>
                {latitude ? latitude.toFixed(6) : 'Not Selected'}
              </Text>
            </View>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Longitude</Text>
              <Text style={styles.coordinateText}>
                {longitude ? longitude.toFixed(6) : 'Not Selected'}
              </Text>
            </View>
          </View>
        </View>

          <Text style={styles.mapLabel}>Select Your Parking Location</Text>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: 19.0760,
              longitude: 72.8777,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
            customMapStyle={googleMapsDarkTheme}
          >
            {latitude && longitude && (
              <Marker coordinate={{ latitude, longitude }}>
                <View style={styles.marker}>
                  <Icon name="map-marker" size={40} color="#4CAF50" />
                  <View style={styles.markerPulse} />
                </View>
              </Marker>
            )}
          </MapView>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <View style={styles.buttonContent}>
              <Icon name="check-circle" size={24} color="#FFF" />
              <Text style={styles.buttonText}>Create Parking Space</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Icon
              name={modalMessage.includes('success') ? "check-circle" : "alert-circle"}
              size={50}
              color={modalMessage.includes('success') ? "#4CAF50" : "#FF3B30"}
            />
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  header: {
    flexDirection:'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    justifyContent:'center',
    gap: 5,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  formContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    color: '#ccc',
    fontSize: 18,
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 13,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  addressInput: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  addressText: {
    color: '#FFF',
    fontSize: 16,
    flex: 1,
  },
  gpsIcon: {
    marginLeft: 10,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateItem: {
    backgroundColor: '#333',
    padding: 13,
    borderRadius: 10,
    width: '48%',
    borderWidth: 1,
    borderColor: '#555'
  },
  coordinateLabel: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 5,
  },
  coordinateText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '600',
  },
  mapContainer: {
    marginTop: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  mapLabel: {
    color: '#aaa',
    fontSize: 16,
    paddingLeft: 5,
  },
  map: {
    height: 280,
    borderRadius: 15,
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  submitButton: {
    marginTop: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1F1F1F',
    width: 300,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 20,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ParkingInfoScreen;
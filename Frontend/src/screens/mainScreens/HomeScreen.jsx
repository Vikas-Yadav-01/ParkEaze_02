import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform, PermissionsAndroid, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

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

const HomeScreen = ({ navigation }) => {

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      error => {
        Alert.alert(
          'Error',
          `Failed to get your location: ${error.message}` +
          ' Make sure your location is enabled.',
        );
      }
    );
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentLocation();
          } else {
            Alert.alert(
              'Permission Denied',
              'Location permission is required.',
            );
            setLoading(false);
          }
        } catch (err) {
          console.warn(err);
          setRegion({ latitude: 18.5204, longitude: 73.8567, latitudeDelta: 0.01, longitudeDelta: 0.01 });
          setLoading(false);
        }
      } else {
        getCurrentLocation();
      }
    };

    requestLocationPermission();
  }, []);

  const [region, setRegion] = useState(null);
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get("http://192.168.0.101:5000/parkings/find-parking", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setParkings(response.data.parkings);
        }
      } catch (error) {
        setErrorMessage(error.response.data.message || 'No Parking Available Nearby!')
      } finally {
        setLoading(false);
      }
    };
    fetchParking();
  }, []);

  const renderVehicleIcons = (rates) => {
    return Object.entries(rates).map(([type, rate]) => {
      if (rate <= 0) return null;

      let iconName;
      switch (type) {
        case '2-wheeler': iconName = 'bike'; break;
        case '4-wheeler': iconName = 'car'; break;
        case 'heavy-vehicle': iconName = 'truck'; break;
        default: iconName = 'help-circle';
      }

      return (
        <View key={type} style={styles.rateContainer}>
          <Icon name={iconName} size={20} color="#fff" />
          <Text style={styles.rate}>{rate} ₹/h</Text>
        </View>
      );
    });
  };

  const renderParkingCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BookingScreen', { parking: item })}
    >
      <Text style={styles.cardTitle}>{item.parkingName} <View style={styles.rating}><Text style={{ color: "white" }}>5★</Text></View></Text>
      <Text style={styles.cardSubtitle} numberOfLines={1} ellipsizeMode='tail'>{item.address}</Text>
      <View style={styles.rates}>
        {renderVehicleIcons(item.hourlyRates)}
      </View>
    </TouchableOpacity>
  );

  const renderLoadingCard = () => (
    <TouchableOpacity style={[styles.card, styles.loadingCard]}>
      <ActivityIndicator size="large" color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={googleMapsDarkTheme}
        initialRegion={region}
        showsUserLocation={true}
      >
        {parkings.map((item) => (
          <Marker
            key={item._id}
            coordinate={{ latitude: Number(item.location?.latitude), longitude: Number(item.location?.longitude) }}
            title={item.parkingName}
            description={item.address}
          />
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.appName}>PARKBOOK</Text>
        <View style={styles.searchBar}>
          <AntDesign name="search1" size={22} color="#999" style={styles.searchIcon} />
          <TextInput placeholder="Search for parking" placeholderTextColor="#999" style={styles.input} />
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={()=>navigation.navigate('Inbox')}>
            <Icon name="message-processing-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        {
          <FlatList
            horizontal
            data={loading ? [{}] : parkings}
            keyExtractor={(item, index) => loading ? `loading-${index}` : item._id}
            renderItem={loading ? renderLoadingCard : renderParkingCard}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.noParkingText}>{errorMessage || 'No parking available nearby!'}</Text>
            }
          />
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  header: {
    flexDirection: 'column',
    padding: 10,
    height: 95,
    backgroundColor: '#0f0f0f',
  },
  appName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 10,
    top: 3
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 10,
    borderWidth: 0.8,
    borderColor: "#555"
  },
  searchIcon: {
    marginHorizontal: 5,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    position: 'absolute',
    right: 30,
    top: 10,
  },
  iconSpacing: {
    marginLeft: 15,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  noParkingText: {
    color: 'red',
    fontSize: 16,
    marginTop: 50,
    marginLeft: 85
  },
  cardsContainer: {
    position: 'absolute',
    bottom: 0,
    paddingVertical: 8,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    margin: 10,
    borderColor: "#666",
    borderWidth: 1,
    height: 140,
    width: 345,
    justifyContent: "center",
  },
  card: {
    backgroundColor: '#212121',
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 20,
    width: 285,
    borderColor: "#555",
    borderWidth: 1,
  },
  rating: {
    backgroundColor: 'green',
    padding: 1,
    height: 18,
    width: 30,
    alignItems: "center",
    borderRadius: 5,
  },
  address: {
    color: '#ccc',
    fontSize: 14,
  },
  rates: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  rate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#d1d1d1',
    marginBottom: 5,
    width: 250,
    overflow: 'hidden',
  },
  rateContainer: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  loadingCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
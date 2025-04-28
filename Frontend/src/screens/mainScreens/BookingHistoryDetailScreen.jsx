import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';

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

const BookingHistoryDetailScreen = (item) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingDetails } = route.params;
  const handleNavigateBack = () => navigation.navigate("BookingHistory");
  const handleContactSupport = () => Linking.openURL('tel:+911234567890');

  const StatusBadge = ({ status }) => (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
      <Icon name={getStatusIcon(status)} size={20} color="#fff" />
      <Text style={styles.statusText}>{status.toUpperCase()}</Text>
    </View>
  );

  const DetailRow = ({ icon, title, value }) => (
    <View style={styles.detailRow}>
      <Icon name={icon} size={24} color="#ddd" />
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <TouchableOpacity onPress={handleContactSupport}>
          <Icon name="headset" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.statusSection}>
          <StatusBadge status={bookingDetails.status} />
          <Text style={styles.bookingId}>Booking ID: {bookingDetails._id}</Text>
        </View>

        <View style={styles.mapStyle}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            customMapStyle={googleMapsDarkTheme}
            initialRegion={{
              latitude: Number(bookingDetails.parking.location?.latitude),
              longitude: Number(bookingDetails.parking.location?.longitude),
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
          >
            <Marker coordinate={{
              latitude: Number(bookingDetails.parking.location?.latitude), longitude: Number(bookingDetails.parking.location?.longitude)
            }} />
          </MapView>
        </View>

        <View style={styles.card}>
          <DetailRow icon="parking" title="Parking Name" value={bookingDetails.parking.parkingName} />
          <DetailRow icon="map-marker" title="Address" value={bookingDetails.parking.address} />
          <DetailRow icon={getVehicleIcon(bookingDetails.vehicleType)} title="Vehicle Type" value={bookingDetails.vehicleType} />
          <DetailRow icon="license" title="Vehicle Number" value={bookingDetails.vehicleNumber.toUpperCase()} />
        </View>

        <View style={styles.card}>
          <DetailRow icon="clock" title="Start Time" value={formatDateTime(bookingDetails.startTime)} />
          <DetailRow icon="clock-end" title="End Time" value={formatDateTime(bookingDetails.endTime)} />
          <DetailRow icon="timer" title="Total Duration" value={`${Math.round(bookingDetails.duration) || 'Calculating'} hours`} />
        </View>

        <View style={styles.card}>
          <DetailRow icon="currency-inr" title="Total Amount" value={`₹ ${Math.round(bookingDetails.bill?.totalAmount) || 'Calculating...'}`} />
          <DetailRow icon="cash" title="Parking Amount" value={`₹ ${Math.round(bookingDetails.bill?.parkingAmount) || 'Calculating...'}`} />
          <DetailRow icon="chart-bar" title="Platform Fees" value={`₹ ${Math.round(bookingDetails.bill?.platformFees) || 'Calculating...'}`} />
        </View>

        {bookingDetails.entryToken && (
          <View style={styles.card}>
            <DetailRow icon="wallet" title="Entry Token" value={bookingDetails.entryToken} />
            <DetailRow icon="receipt" title="Exit Token" value={bookingDetails.exitToken || 'Not Found'} />
          </View>
        )}

        <TouchableOpacity style={styles.supportCard} onPress={handleContactSupport}>
          <Icon name="headset" size={32} color="#ddd" />
          <View style={styles.supportText}>
            <Text style={styles.supportHeading}>Need Help?</Text>
            <Text style={styles.supportSubtext}>Contact our 24/7 customer support</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ddd" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completed': return '#4CAF50';
    case 'active': return '#FF9800';
    case 'cancelled': return '#F44336';
    default: return '#9E9E9E';
  }
};

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'check-circle';
    case 'pending': return 'clock';
    case 'cancelled': return 'close-circle';
    default: return 'alert-circle';
  }
};

const getVehicleIcon = (type) => {
  switch (type.toLowerCase()) {
    case '2-wheeler': return 'bike';
    case '4-wheeler': return 'car';
    case 'heavy-vehicle': return 'truck';
    default: return 'help-circle';
  }
};

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0f0f0f',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 14,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  bookingId: {
    color: '#bbb',
    fontSize: 12,
  },
  mapStyle: {
    borderRadius: 20,
    backgroundColor: "#17263d",
    height: 185,
    marginBottom: 16,
    padding: 12,
  },
  map: {
    height: 160,
  },
  card: {
    backgroundColor: '#282828',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  detailTitle: {
    color: '#bbb',
    fontSize: 12,
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  supportText: {
    flex: 1,
    marginLeft: 16,
  },
  supportHeading: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportSubtext: {
    color: '#bbb',
    fontSize: 14,
    marginTop: 4,
  },
});

export default BookingHistoryDetailScreen;
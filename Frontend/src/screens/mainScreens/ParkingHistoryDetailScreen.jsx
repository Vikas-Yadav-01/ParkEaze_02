import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ParkingHistoryDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { parkingDetails } = route.params;
  const handleNavigateBack = () => navigation.goBack();
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
        <Text style={styles.headerTitle}>Parking Details</Text>
        <TouchableOpacity onPress={handleContactSupport}>
          <Icon name="headset" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.statusSection}>
          <StatusBadge status={parkingDetails.status} />
          <Text style={styles.bookingId}>Booking ID: {parkingDetails._id}</Text>
        </View>

        <View style={styles.card}>
          <DetailRow icon="account" title="Customer Name" value={parkingDetails.user?.name || 'Anonymous'} />
          <DetailRow icon={getVehicleIcon(parkingDetails.vehicleType)} title="Vehicle Type" value={parkingDetails.vehicleType} />
          <DetailRow icon="license" title="Vehicle Number" value={parkingDetails.vehicleNumber.toUpperCase()} />
        </View>

        <View style={styles.card}>
          <DetailRow icon="clock" title="Start Time" value={formatDateTime(parkingDetails.startTime)} />
          <DetailRow icon="clock-end" title="End Time" value={formatDateTime(parkingDetails.endTime)} />
          <DetailRow icon="timer" title="Duration" value={`${Math.round(parkingDetails.duration) || 'Calculating'} hours`} />
        </View>

        <View style={styles.card}>
          <DetailRow icon="currency-inr" title="Total Earnings" value={`₹ ${Math.round(parkingDetails.bill?.totalAmount) || 'Calculating...'}`} />
          <DetailRow icon="cash" title="Payment Method" value={`₹ ${Math.round(parkingDetails.bill?.parkingAmount) || 'Calculating...'}`} />
          <DetailRow icon="chart-bar" title="Hourly Rate" value={`₹ ${Math.round(parkingDetails.bill?.platformFees) || 'Calculating...'}`} />
        </View>

        <TouchableOpacity style={styles.supportCard} onPress={handleContactSupport}>
          <Icon name="headset" size={32} color="#ddd" />
          <View style={styles.supportText}>
            <Text style={styles.supportHeading}>Need Help?</Text>
            <Text style={styles.supportSubtext}>Contact our 24/7 business support</Text>
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
    case 'active': return 'clock';
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

export default ParkingHistoryDetailScreen;
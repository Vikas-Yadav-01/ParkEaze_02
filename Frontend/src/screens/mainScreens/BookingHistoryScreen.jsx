import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookingHistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMesssage] = useState('')

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://192.168.0.103:5000/users/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setBookings(response.data.History);
        }
      } catch (error) {
        setErrorMesssage(error.response.data.message || 'No Booking History Available')
      } finally {
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [bookings]);

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('BookingHistoryDetail', { bookingDetails: item })} >
      <View style={styles.card}>
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) }]}>
          <Icon
            name={getStatusIcon(item.status)}
            size={16}
            color="#fff"
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>

        <View style={styles.row}>
          <Icon name="calendar" size={20} color="#eee" />
          <Text style={styles.detailText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>

          <Icon name="clock" size={20} color="#eee" style={styles.iconSpacing} />
          <Text style={styles.detailText}>
            {item.endTime || item.startTime ? new Date(item.endTime || item.startTime).toLocaleTimeString() : 'Processing...'}
          </Text>
        </View>

        <View style={styles.row}>
          <Icon name={getVehicleIcon(item.vehicleType)} size={20} color="#eee" />
          <Text style={styles.detailText}>{item.vehicleNumber.toUpperCase()}</Text>

          <Icon name="timer-sand" size={20} color="#eee" style={styles.iconSpacing} />
          <Text style={styles.detailText}>{calculateDuration(item) === "-" ? "Calculating..." : `${calculateDuration(item)} hours`}</Text>
        </View>

        <View style={styles.divider} />

        <View style={[styles.row, styles.totalContainer]}>
          <Text style={styles.totalLabel}>Total Amount Paid :</Text>
          <Text style={styles.totalAmount}>₹ {item.bill?.totalAmount ? Math.round(item.bill.totalAmount) : 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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

  const calculateDuration = (booking) => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    return Math.round((end - start) / (1000 * 60 * 60)) || '-'
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{errorMessage || 'No Booking History Available'}</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818'
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#282828',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#454545'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#eee',
    marginLeft: 6,
  },
  iconSpacing: {
    marginLeft: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#666',
    marginVertical: 10,
  },
  totalContainer: {
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#ddd',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 16,
    marginTop: 32,
  },
});

export default BookingHistoryScreen;
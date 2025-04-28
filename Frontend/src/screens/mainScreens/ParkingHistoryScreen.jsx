import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParkingHistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMesssage] = useState('')

  useEffect(() => {
    const fetchParkingHistory = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://192.168.0.103:5000/parkings/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setHistory(response.data.History);
        }
      } catch (error) {
        setErrorMesssage(error.response.data.message || 'No Parking History Available');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingHistory();
  }, [history]);

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ParkingHistoryDetail', {parkingDetails:item })}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) }]}>
            <Icon
              name={getStatusIcon(item.status)}
              size={16}
              color="#fff"
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>

          <View style={styles.vehicleInfo}>
            <Icon name={getVehicleIcon(item.vehicleType)} size={20} color="#eee" />
            <Text style={styles.detailText}>{item.vehicleNumber.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailColumn}>
            <Icon name="calendar" size={18} color="#eee" />
            <Text style={styles.smallText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailColumn}>
            <Icon name="clock" size={18} color="#eee" />
            <Text style={styles.smallText}>
              {calculateDuration(item) === "-" ? "Calculating..." : `${calculateDuration(item)} hours`}
            </Text>
          </View>

          <View style={styles.detailColumn}>
            <Icon name="cash" size={18} color="#eee" />
            <Text style={styles.smallText}>
              ₹ {item.bill?.totalAmount ? Math.round(item.bill.totalAmount) : 0}
            </Text>
          </View>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {new Date(item.startTime).toLocaleTimeString()}
          </Text>
          <Icon name="arrow-right" size={18} color="#666" />
          <Text style={styles.timeText}>
            {item.endTime ? new Date(item.endTime).toLocaleTimeString() : "Processing..."}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Total Earnings:</Text>
          <Text style={styles.earningsAmount}>₹ {item.bill?.totalAmount ? Math.round(item.bill.totalAmount) : 0}</Text>
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
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{errorMessage || 'No Parking History Available'}</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#eee',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  detailColumn: {
    alignItems: 'center',
    flex: 1,
  },
  smallText: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  timeText: {
    color: '#999',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#666',
    marginVertical: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 16,
    color: '#ddd',
  },
  earningsAmount: {
    fontSize: 18,
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

export default ParkingHistoryScreen;
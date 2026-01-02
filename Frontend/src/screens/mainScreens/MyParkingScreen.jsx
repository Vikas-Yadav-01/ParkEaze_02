import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyParkingScreen = ({ navigation }) => {
  const [parkingData, setParkingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://192.168.0.100:5000/parkings/parking', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParkingData(response.data.parking);
      } catch (error) {
        setModalMessage(error.response?.data?.message || 'Network Error. Please try again.');
        setModalVisible(true);
      } finally {
        setLoading(false);
      }
    };
    fetchParkingData();
  }, []);

  const toggleStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const newStatus = parkingData.status === 'open' ? 'close' : 'open';
      const response = await axios.patch(
        'http://your-api-endpoint/toggle-status',
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParkingData(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!parkingData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to fetch parking data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.parkingName}>{parkingData.parkingName}</Text>

          <View style={styles.addressContainer}>
            <Icon name="map-marker" size={20} color="#4CAF50" />
            <Text style={styles.addressText}>{parkingData.address}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Icon name="star" size={20} color="#FFD700" />
            <Icon name="star" size={20} color="#FFD700" />
            <Icon name="star" size={20} color="#FFD700" />
            <Icon name="star" size={20} color="#FFD700" />
            <Icon name="star" size={20} color="#FFD700" />
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, parkingData.status === 'close' && styles.closedStatus]}>
              {parkingData.status.toUpperCase()}
            </Text>
            <Switch
              value={parkingData.status === 'open'}
              onValueChange={toggleStatus}
              thumbColor={parkingData.status === 'open' ? "#4CAF50" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#4CAF5050" }}
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Allowed Vehicles</Text>
            <View style={styles.cardHeaderBorder}></View>
            {Object.entries(parkingData.vehicleTypes).map(([type, enabled]) => (
              enabled && (
                <View key={type} style={styles.vehicleRow}>
                  <Icon
                    name={type === '2-wheeler' ? 'bike' : type === '4-wheeler' ? 'car' : 'truck'}
                    size={24}
                    color="#ddd"
                  />
                  <Text style={styles.vehicleText}>
                    {type.replace('-', ' ')} - ₹{parkingData.hourlyRates[type]}/hr
                  </Text>
                </View>
              )
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Monthly Service</Text>
              <Switch
                value={parkingData.monthlyService}
                thumbColor={parkingData.monthlyService ? "#4CAF50" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#4CAF5050" }}
              />
            </View>
            <View style={styles.cardHeaderBorder}></View>
            {parkingData.monthlyService && (
              <>
                {Object.entries(parkingData.monthlyRates).map(([type, rate]) => (
                  parkingData.vehicleTypes[type] && (
                    <View key={type} style={styles.rateRow}>
                      <Text style={styles.rateText}>{type.replace('-', ' ')}</Text>
                      <Text style={styles.rateAmount}>₹{rate}/month</Text>
                    </View>
                  )
                ))}
              </>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.watchmanHeader}>
                <Icon name="security" size={24} color="#4CAF50" />
                <Text style={styles.cardTitle}>Watchman</Text>
              </View>
              <Text style={styles.watchmanStatus}>
                {parkingData.security ? 'Available' : 'Not Available'}
              </Text>
            </View>
            <View style={styles.cardHeaderBorder}></View>
            {parkingData.security && (
              <View style={styles.tokenButtons}>
                <TouchableOpacity style={[styles.button, styles.tokenButton]} onPress={() => navigation.navigate('EntryToken')}>
                  <Text style={styles.buttonText}>Entry Token</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.tokenButton]} onPress={() => navigation.navigate('ExitToken')}>
                  <Text style={styles.buttonText}>Exit Token</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.button, styles.editButton]}>
              <Icon name="pencil" size={20} color="#fff" />
              <Text style={styles.buttonText}>Edit Parking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.historyButton]}>
              <Icon name="clock" size={20} color="#fff" />
              <Text style={styles.buttonText}>View History</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, styles.verificationCard]}>
            <Icon name="shield-check" size={24} color="#4CAF50" />
            <Text style={styles.verificationText}>Verification Completed</Text>
          </View>
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
    backgroundColor: '#0f0f0f',
    paddingTop: 18,
  },
  content: {
    padding: 18,
    backgroundColor: '#181818',
    borderTopWidth: 1,
    borderColor: '#383838'
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  parkingName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    height: 55,
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#353535'
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  closedStatus: {
    color: '#FF4444',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addressContainer: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%'
  },
  addressText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#444'
  },
  cardTitle: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingTop: 6
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderBorder: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 10,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  vehicleText: {
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 16,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  rateText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  rateAmount: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  watchmanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  watchmanStatus: {
    color: '#4CAF50',
    fontSize: 16,
  },
  tokenButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  tokenButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#4CAF50',
    height: 50,
    justifyContent: 'center',
    borderRadius: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#4CAF50',
    flex: 1,
    marginRight: 8,
    height: 50,
    justifyContent: 'center',
    borderRadius: 15,
  },
  historyButton: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 8,
    height: 50,
    justifyContent: 'center',
    borderRadius: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b291c',
  },
  verificationText: {
    color: '#4CAF50',
    marginLeft: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f'
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    padding: 20
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


export default MyParkingScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EarningsScreen = ({ navigation }) => {
  const [earnings, setEarnings] = useState();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(()=>{
  const fetchEarnings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.0.103:5000/earnings/todays-earning', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selectedDate }
      });
      if (response.data.success) {
        setEarnings(response.data); 
      }
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Failed to fetch earnings');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };
  fetchEarnings()
}, [])

  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  const EarningsCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="calendar" size={20} color="#4CAF50" />
        <Text style={styles.dateText}>
          {new Date(item.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </Text>
      </View>

      <View style={styles.earningRow}>
        <View style={styles.earningItem}>
          <Text style={styles.earningLabel}>Day Earnings</Text>
          <Text style={styles.earningValue}>{formatCurrency(item.dayEarning)}</Text>
        </View>
        <View style={styles.earningItem}>
          <Text style={styles.earningLabel}>App Commission</Text>
          <Text style={[styles.earningValue, styles.commissionText]}>
            -{formatCurrency(item.appCommision)}
          </Text>
        </View>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Net Earnings</Text>
        <Text style={styles.totalValue}>{formatCurrency(item.totalEarning)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="currency-inr" size={28} color="#fff" />
        <Text style={styles.title}>Earnings Report</Text>
      </View>

      <FlatList
        data={earnings}
        renderItem={({ item }) => <EarningsCard item={item} />}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chart-bar" size={60} color="#444" />
            <Text style={styles.emptyText}>No earnings records found</Text>
          </View>
        }
      />

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Icon
              name="alert-circle"
              size={50}
              color="#FF3B30"
            />
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 15
  },
  dateText: {
    color: '#4CAF50',
    fontSize: 16,
    marginLeft: 10
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  earningItem: {
    width: '45%'
  },
  earningLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 10,
  },
  earningValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  commissionText: {
    color: '#FF3B30'
  },
  totalContainer: {
    marginTop: 15,
    paddingRight: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
    alignItems: 'flex-end',
  },
  totalLabel: {
    color: '#4CAF50',
    fontSize: 16
  },
  totalValue: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCard: {
    backgroundColor: '#1F1F1F',
    width: 300,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center'
  },
  modalText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 20
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default EarningsScreen;
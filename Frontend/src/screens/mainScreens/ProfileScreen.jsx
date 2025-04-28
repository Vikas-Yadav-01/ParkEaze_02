import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    setLoading(true)
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://192.168.0.104:5000/users/current-user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setUserData(response.data.user);
        }
      } catch (error) {
        setModalMessage(error.response.data.message || 'Failed to load profile');
        setModalVisible(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleContactSupport = (method) => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:support@parkbook.com');
        break;
      case 'phone':
        Linking.openURL('tel:+911234567890');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/+911234567890');
        break;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token')
    navigation.navigate('Auth')
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to fetch parking data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Icon name="account" size={28} color="#4CAF50" />
        <Text style={styles.title}>{userData.userName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{userData.role}</Text>
        </View>
        <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => navigation.navigate('EditProfile')}>
          <Icon name="square-edit-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Icon name="account-details" size={22} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Account Details</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="phone" size={20} color="#888" />
          <Text style={styles.detailText}>{userData.phoneNumber}</Text>
        </View>

        {userData.role === 'Parking Owner' && (
          <>
            <View style={styles.detailRow}>
              <Icon name="shield-account" size={20} color="#888" />
              <Text style={styles.detailText}>
                Aadhar Verified: {userData.documents?.aadharNumber ? 'Yes' : 'No'}
              </Text>
            </View>

            {userData.bankDetails?.accountNumber && (
              <View style={styles.detailRow}>
                <Icon name="bank" size={20} color="#888" />
                <Text style={styles.detailText}>
                  {userData.bankDetails.bankName} ••••{userData.bankDetails.accountNumber.slice(-4)}
                </Text>
                <TouchableOpacity style={{ marginLeft: 170 }} onPress={() => navigation.navigate('UpdateBank')}>
                  <Icon name="square-edit-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Icon name="headset" size={22} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Support Care</Text>
        </View>

        <TouchableOpacity
          style={styles.supportOption}
          onPress={() => handleContactSupport('email')}
        >
          <Icon name="email" size={20} color="#888" />
          <Text style={styles.supportText}>Email Support</Text>
          <Icon name="chevron-right" size={20} color="#4CAF50" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportOption}
          onPress={() => handleContactSupport('phone')}
        >
          <Icon name="phone" size={20} color="#888" />
          <Text style={styles.supportText}>Call Support</Text>
          <Icon name="chevron-right" size={20} color="#4CAF50" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportOption}
          onPress={() => handleContactSupport('whatsapp')}
        >
          <Icon name="whatsapp" size={20} color="#888" />
          <Text style={styles.supportText}>WhatsApp Chat</Text>
          <Icon name="chevron-right" size={20} color="#4CAF50" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportOption}
          onPress={() => navigation.navigate('FAQ')}
        >
          <Icon name="help-circle" size={20} color="#888" />
          <Text style={styles.supportText}>FAQ & Help Center</Text>
          <Icon name="chevron-right" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.actionButton} onPress={()=>navigation.navigate('UpdatePassword')}>
          <Icon name="lock-reset" size={20} color="#4CAF50" />
          <Text style={styles.actionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={logout}>
          <Icon name="logout" size={20} color="#FF3B30" />
          <Text style={[styles.actionText, { color: '#FF3B30' }]}>Log Out</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
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
    padding: 20,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1
  },
  roleBadge: {
    backgroundColor: '#333',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#555'
  },
  roleText: {
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 10
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8
  },
  detailText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 5
  },
  logoutButton: {
    margin: 20,
    alignItems: 'center'
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    padding: 20
  },
  historyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  historyText: {
    color: '#fff',
    fontSize: 16
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  supportText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginLeft: 10
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 15
  },
  actionText: {
    color: '#fff',
    fontSize: 16
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
  },
});

export default ProfileScreen;
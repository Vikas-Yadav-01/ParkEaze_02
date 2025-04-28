import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';

const UpdateProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const roles = [
    { label: 'Book Parking', value: 'Book Parking' },
    { label: 'Parking Owner', value: 'Parking Owner' },
  ];

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(
        'http://192.168.0.105:5000/users/update-profile',
        { userName, phoneNumber, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setSuccessVisible(true)
      }
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Failed to update profile');
      setModalVisible(true)
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Icon name="account-edit" size={28} color="#4CAF50" />
        <Text style={styles.title}>Update Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Icon name="account-details" size={22} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Edit Profile Details</Text>
        </View>

        <View style={styles.inputContainer}>
          <Icon name="account" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            value={userName}
            onChangeText={setUserName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="phone" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#888"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="account-switch" size={20} color="#888" style={styles.inputIcon} />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={styles.itemTextStyle}
            data={roles}
            labelField="label"
            valueField="value"
            placeholder="Select Role"
            value={role}
            onChange={item => setRole(item.value)}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Icon name="check" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Update Profile</Text>
            </>
          )}
        </TouchableOpacity>
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Icon name="alert-circle" size={50} color="#ff3b30" />
              <Text style={styles.modalTitle}>Error!</Text>
              <Text style={styles.modalText}>{modalMessage}</Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.modalButtonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={successVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Icon name="check-circle" size={50} color="#4CAF50" />
              <Text style={styles.modalTitle}>Success!</Text>
              <Text style={styles.modalText}>{successMessage}</Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setSuccessVisible(false),
                    navigation.navigate('Main')
                }}
              >
                <Text style={styles.modalButtonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  contentContainer: {
    paddingBottom: 30,
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
    flex: 1,
  },
  backButton: {
    marginLeft: 'auto',
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
    paddingBottom: 10,
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    marginVertical: 8,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  dropdown: {
    flex: 1,
    paddingVertical: 12,
  },
  placeholderStyle: {
    color: '#888',
    fontSize: 16,
  },
  selectedTextStyle: {
    color: '#FFF',
    fontSize: 16,
  },
  itemTextStyle: {
    color: '#000',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    gap: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1F1F1F',
    width: '85%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalText: {
    color: '#AAA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    color: '#888',
    fontSize: 16,
  },
  detailValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdateProfileScreen;
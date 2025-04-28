import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BankDetailScreen = ({ navigation }) => {
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', ifscCode: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const validateIFSC = (ifsc) => {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  };

  const validateAccountNumber = (number) => {
    return /^\d{9,18}$/.test(number);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!bankDetails.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }
    if (!validateAccountNumber(bankDetails.accountNumber)) {
      newErrors.accountNumber = 'Invalid account number (9-18 digits)';
    }
    if (!validateIFSC(bankDetails.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC format (e.g. ABCD0123456)';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => setErrors({}), 3000);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post('http://192.168.0.101:5000/users/bank-details', bankDetails, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', }
      });

      if (response.data.success) {
        navigation.navigate('MyParking');
      }
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Submission failed');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon name="bank" size={24} color="#fff" />
          <Text style={styles.title}>Bank Details</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Icon name="bank-outline" size={22} color="#aaa" />
              <Text style={styles.inputLabel}>Bank Name</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter bank name"
              placeholderTextColor="#aaa"
              value={bankDetails.bankName}
              onChangeText={text => setBankDetails({ ...bankDetails, bankName: text })}
            />
            {errors.bankName && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#FF3B30" />
                <Text style={styles.errorText}>{errors.bankName}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Icon name="card-account-details-outline" size={22} color="#aaa" />
              <Text style={styles.inputLabel}>Account Number</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter account number"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={bankDetails.accountNumber}
              onChangeText={text => setBankDetails({ ...bankDetails, accountNumber: text })}
            />
            {errors.accountNumber && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#FF3B30" />
                <Text style={styles.errorText}>{errors.accountNumber}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Icon name="barcode-scan" size={22} color="#aaa" />
              <Text style={styles.inputLabel}>IFSC Code</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter IFSC code"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
              value={bankDetails.ifscCode}
              onChangeText={text => setBankDetails({ ...bankDetails, ifscCode: text.toUpperCase() })}
            />
            {errors.ifscCode && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#FF3B30" />
                <Text style={styles.errorText}>{errors.ifscCode}</Text>
              </View>
            )}
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
                <Icon name="shield-check" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Save Bank Details</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    justifyContent: 'center',
    gap: 5,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  formContainer: {
    paddingHorizontal: 15,
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

export default BankDetailScreen;
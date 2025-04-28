import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExitTokenScreen = ({ navigation }) => {
  const [exitToken, setExitToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const validateInputs = () => {
    if (exitToken.length !== 4) {
      setError('Please enter a valid 4-digit exit token');
      setTimeout(() => setError(''), 3000);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setModalMessage('Authentication error. Please log in again.');
        setModalVisible(true);
        setLoading(false);
        return;
      }
      
      const response = await axios.post('http://192.168.0.103:5000/parkings/exit-token',
        { exitToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setBooking(response.data.booking);
      }
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Invalid exit token');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Icon name="exit-run" size={28} color="#FF3B30" />
        <Text style={styles.title}>Exit Token</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.instructionText}>Enter your 4-digit exit token</Text>
          <View style={styles.inputContainer}>
            <Icon name="form-textbox-password" size={24} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="4-digit token"
              placeholderTextColor="#888"
              value={exitToken}
              onChangeText={setExitToken}
              maxLength={4}
              keyboardType="numeric"
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Submit</Text>}
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={!!booking} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Icon name="check-circle" size={50} color="#4CAF50" />
            <Text style={styles.modalTitle}>Exit Recorded!</Text>
            <Text style={styles.modalText}>Exit time has been successfully recorded.</Text>
            <Text style={styles.modalToken}>Total Amount: ₹{Math.round(booking?.bill?.totalAmount)}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setBooking(null);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Icon name="alert-circle" size={50} color="#FF3B30" />
            <Text style={styles.modalTitle}>Error</Text>
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
      backgroundColor: '#181818',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#0f0f0f',
      padding: 15,
      justifyContent:'center',
    },
    title: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    card: {
      backgroundColor: '#282828',
      borderRadius: 15,
      padding: 25,
      width: '100%',
      alignItems: 'center',
    },
    instructionText: {
      color: '#aaa',
      fontSize: 16,
      marginBottom: 15,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#444',
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: 15,
      width: '100%',
      borderWidth: 1,
      borderColor: '#666',
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      color: '#FFF',
      fontSize: 18,
      paddingVertical: 12,
    },
    submitButton: {
      backgroundColor: '#4CAF50',
      borderRadius: 15,
      paddingVertical: 14,
      width: '100%',
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
      marginBottom: 10,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCard: {
      backgroundColor: '#1F1F1F',
      width: '80%',
      borderRadius: 20,
      padding: 25,
      alignItems: 'center',
    },
    modalTitle: {
      color: '#4CAF50',
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 10,
    },
    modalText: {
      color: '#AAA',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 10,
    },
    modalToken: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    modalButton: {
      backgroundColor: '#4CAF50',
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 30,
      width: '100%',
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default ExitTokenScreen;

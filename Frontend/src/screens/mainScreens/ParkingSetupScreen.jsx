import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParkingSetupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    vehicleTypes: {
      '2-wheeler': false,
      '4-wheeler': false,
      'heavy-vehicle': false
    },
    hourlyRates: {
      '2-wheeler': '',
      '4-wheeler': '',
      'heavy-vehicle': ''
    },
    monthlyService: false,
    monthlyRates: {
      '2-wheeler': '',
      '4-wheeler': '',
      'heavy-vehicle': ''
    },
    security: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const vehicleTypeIcons = {
    '2-wheeler': 'bike',
    '4-wheeler': 'car',
    'heavy-vehicle': 'truck'
  };

  const toggleVehicleType = (type) => {
    setFormData(prev => ({
      ...prev,
      vehicleTypes: {
        ...prev.vehicleTypes,
        [type]: !prev.vehicleTypes[type]
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!Object.values(formData.vehicleTypes).some(v => v)) {
      newErrors.vehicleTypes = 'At least one vehicle type must be selected';
    }

    Object.entries(formData.vehicleTypes).forEach(([type, isSelected]) => {
      if (isSelected) {
        if (!formData.hourlyRates[type]) {
          newErrors[`hourly-${type}`] = 'Hourly rate required';
        }
        if (formData.monthlyService && !formData.monthlyRates[type]) {
          newErrors[`monthly-${type}`] = 'Monthly rate required';
        }
      }
    });

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
      const response = await axios.post(
        'http://192.168.0.101:5000/parkings/parking-setup',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        navigation.navigate('PersonalDetails');
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
          <Icon name="view-dashboard-edit-outline" size={24} color="#fff" />
          <Text style={styles.title}>Parking Setup</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Vehicle Types</Text>
            {Object.entries(formData.vehicleTypes).map(([type, isSelected]) => (
              <View key={type} style={styles.vehicleTypeRow}>
                <View style={styles.vehicleTypeLeft}>
                  <Icon
                    name={vehicleTypeIcons[type]}
                    size={24}
                    color={isSelected ? "#fff" : "#888"}
                  />
                  <Text style={[styles.vehicleTypeText, isSelected && styles.activeVehicleType]}>
                    {type.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
                <Switch
                  value={isSelected}
                  onValueChange={() => toggleVehicleType(type)}
                  thumbColor={isSelected ? "#fff" : "#f4f3f4"}
                  trackColor={{ false: "#767577", true: "#4CAF50" }}
                />
              </View>
            ))}
            {errors.vehicleTypes && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#FF3B30" />
                <Text style={styles.errorText}>{errors.vehicleTypes}</Text>
              </View>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Hourly Rates</Text>
            {Object.entries(formData.vehicleTypes).map(([type, isSelected]) => (
              isSelected && (
                <View key={`hourly-${type}`} style={styles.rateInputContainer}>
                  <Icon name="clock-outline" size={20} color="#4CAF50" />
                  <TextInput
                    style={styles.rateInput}
                    placeholder={`${type} rate`}
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.hourlyRates[type]}
                    onChangeText={text => setFormData(prev => ({
                      ...prev,
                      hourlyRates: { ...prev.hourlyRates, [type]: text }
                    }))}
                  />
                  <Text style={styles.currencySymbol}>₹/hr</Text>
                  {errors[`hourly-${type}`] && (
                    <Icon name="alert-circle" size={16} color="#FF3B30" />
                  )}
                </View>
              )
            ))}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.sectionTitle}>Monthly Service</Text>
              <Switch
                value={formData.monthlyService}
                onValueChange={val => setFormData(prev => ({
                  ...prev, monthlyService: val
                }))}
                thumbColor={formData.monthlyService ? "#fff" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#4CAF50" }}
              />
            </View>

            {formData.monthlyService && Object.entries(formData.vehicleTypes).map(([type, isSelected]) => (
              isSelected && (
                <View key={`monthly-${type}`} style={styles.rateInputContainer}>
                  <Icon name="calendar-month" size={20} color="#4CAF50" />
                  <TextInput
                    style={styles.rateInput}
                    placeholder={`${type} monthly rate`}
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.monthlyRates[type]}
                    onChangeText={text => setFormData(prev => ({
                      ...prev,
                      monthlyRates: { ...prev.monthlyRates, [type]: text }
                    }))}
                  />
                  <Text style={styles.currencySymbol}>₹/month</Text>
                  {errors[`monthly-${type}`] && (
                    <Icon name="alert-circle" size={16} color="#FF3B30" />
                  )}
                </View>
              )
            ))}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.sectionTitle}>Security Available</Text>
              <Switch
                value={formData.security}
                onValueChange={val => setFormData(prev => ({
                  ...prev, security: val
                }))}
                thumbColor={formData.security ? "#fff" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#4CAF50" }}
              />
            </View>
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
                <Icon name="check-circle" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Save Configuration</Text>
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
    borderBottomColor: '#444',
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
  sectionContainer: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  vehicleTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  vehicleTypeLeft: {
    gap: 5,
  },
  vehicleTypeText: {
    color: '#999',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  activeVehicleType: {
    color: '#fff',
    fontWeight: '500',
  },
  rateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  rateInput: {
    flex: 1,
    backgroundColor: '#333',
    color: '#FFF',
    borderRadius: 15,
    padding: 12,
    fontSize: 16,
  },
  currencySymbol: {
    color: '#999',
    width: 60,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default ParkingSetupScreen;
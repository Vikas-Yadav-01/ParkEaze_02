import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';

const PersonalDetailScreen = ({ navigation }) => {
  const [aadharNumber, setAadharNumber] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const validateAadhar = (number) => {
    return /^\d{12}$/.test(number);
  };

  const handleImagePick = async (setImage) => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        mediaType: 'photo',
      });
      setImage(image.path);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        setModalMessage('Error selecting image');
        setModalVisible(true);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateAadhar(aadharNumber)) {
      newErrors.aadhar = 'Invalid Aadhar Number (12 digits required)';
    }
    if (!frontImage) newErrors.frontImage = 'Front image required';
    if (!backImage) newErrors.backImage = 'Back image required';

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
      const formData = new FormData();
      formData.append('aadharNumber', aadharNumber);
      formData.append('aadharFrontImage', {
        uri: frontImage,
        type: 'image/jpeg',
        name: 'front.jpg'
      });
      formData.append('aadharBackImage', {
        uri: backImage,
        type: 'image/jpeg',
        name: 'back.jpg'
      });

      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        'http://192.168.0.101:5000/users/documents',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.data.success) {
        navigation.navigate('BankDetails');
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
          <Icon name="card-account-details-outline" size={24} color="#fff" />
          <Text style={styles.title}>Personal Verification</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Icon name="smart-card-outline" size={22} color="#aaa" />
              <Text style={styles.inputLabel}>Aadhar Number</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter 12-digit Aadhar Number"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              maxLength={12}
              value={aadharNumber}
              onChangeText={setAadharNumber}
            />
            {errors.aadhar && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#FF3B30" />
                <Text style={styles.errorText}>{errors.aadhar}</Text>
              </View>
            )}
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.uploadTitle}>Aadhar Card Front Side</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleImagePick(setFrontImage)}
            >
              {frontImage ? (
                <Image source={{ uri: frontImage }} style={styles.imagePreview} />
              ) : (
                <View style={styles.uploadContent}>
                  <Icon name="camera-plus" size={40} color="#4CAF50" />
                  <Text style={styles.uploadText}>Tap to upload front image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.frontImage && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#FF3B30" />
                <Text style={styles.errorText}>{errors.frontImage}</Text>
              </View>
            )}
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.uploadTitle}>Aadhar Card Back Side</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleImagePick(setBackImage)}
            >
              {backImage ? (
                <Image source={{ uri: backImage }} style={styles.imagePreview} />
              ) : (
                <View style={styles.uploadContent}>
                  <Icon name="camera-plus" size={40} color="#4CAF50" />
                  <Text style={styles.uploadText}>Tap to upload back image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.backImage && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#FF3B30" />
                <Text style={styles.errorText}>{errors.backImage}</Text>
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
                <Text style={styles.buttonText}>Verify Identity</Text>
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
    height: 50
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
  uploadSection: {
    marginBottom: 25,
  },
  uploadTitle: {
    color: '#4CAF50',
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    height: 180,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContent: {
    alignItems: 'center',
    gap: 10,
  },
  uploadText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
});

export default PersonalDetailScreen;
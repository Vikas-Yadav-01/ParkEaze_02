import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';

const roleOptions = [
  { label: 'Book Parking', value: 'Book Parking' },
  { label: 'Parking Owner', value: 'Parking Owner' }
];

const SignUpScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(null);
  const [hidePassword, setHidePassword] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ userName: '', phoneNumber: '', password: '', role: '' });

  const validateInputs = () => {
    let errors = {};
    if (!userName) {
      errors.userName = "User name is required!";
    }
    if (!phoneNumber) {
      errors.phoneNumber = "Phone number is required!";
    } else if (phoneNumber.length !== 10) {
      errors.phoneNumber = "Enter a valid 10-digit number!";
    }
    if (!password) {
      errors.password = "Password is required!";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters!";
    }
    if (!role) {
      errors.role = "Role is required!";
    }
    setError(errors);
    if (Object.keys(errors).length > 0) {
      setTimeout(() => setError({}), 3000);
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const response = await axios.post("http://192.168.0.100:5000/users/sign-up", { userName, phoneNumber, password, role });
      const token = response.data.token
      await AsyncStorage.setItem("token", token)
      setLoading(false);

      if (response.data.success) {
        setModalMessage(response.data.message || "Sign up successful!");
        navigation.navigate("Main")
      }
      setModalVisible(true)
    } catch (error) {
      setLoading(false);
      setModalMessage(error.response.data.message || 'Network Error. Please try again.');
      setModalVisible(true);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/AuthScreen.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require('../../assets/logo.jpg')}
          style={styles.logo}
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to continue</Text>

        <View style={styles.inputContainer}>
          <Icon name="account" size={22} color="#bbb" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="User Name"
            placeholderTextColor="#bbb"
            value={userName}
            onChangeText={setUserName}
          />
        </View>
        {error.userName ? <Text style={styles.errorText}>{error.userName}</Text> : null}

        <View style={styles.inputContainer}>
          <Icon name="phone" size={22} color="#bbb" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#bbb"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>
        {error.phoneNumber ? <Text style={styles.errorText}>{error.phoneNumber}</Text> : null}

        <View style={styles.inputContainer}>
          <Icon name="lock" size={22} color="#bbb" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#bbb"
            secureTextEntry={hidePassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
            <Icon name={hidePassword ? "eye-off" : "eye"} size={22} color="#bbb" />
          </TouchableOpacity>
        </View>
        {error.password ? <Text style={styles.errorText}>{error.password}</Text> : null}

        <View style={styles.dropdownContainer}>
          <Icon name="account-circle" size={22} color="#bbb" style={styles.icon} />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={roleOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Role"
            value={role}
            onChange={item => {
              setRole(item.value);
            }}
            renderItem={(item) => (
              <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
              </View>
            )}
          />
        </View>
        {error.role ? <Text style={styles.errorText}>{error.role}</Text> : null}

        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.signupText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={{ color: "#1ee817", fontWeight: "bold" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        animationType="none"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 150,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 10,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    width: "100%",
    borderWidth: 1,
    borderColor: '#444',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  signupButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
  signupText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#ddd',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#444',
  },
  dropdown: {
    flex: 1,
    height: 42,
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#bbb'
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#fff'
  },
  iconStyle: {
    width: 20,
    height: 20,
    tintColor: '#fff'
  },
  item: {
    padding: 15,
    backgroundColor: '#333',
    borderBottomColor: '#444',
    borderBottomWidth: 1,
  },
  textItem: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 25,
    padding: 30,
    width: '85%',
    alignItems: 'center',
  },
  modalText: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    marginVertical: 25,
  },
  modalButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 35,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignUpScreen;
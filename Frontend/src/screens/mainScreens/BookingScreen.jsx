import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Image, } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BookingScreen = ({ route, navigation }) => {
    const { parking } = route.params;
    const [selectedVehicleType, setSelectedVehicleType] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [bookingResult, setBookingResult] = useState(null);
    const [modalMessage, setModalMessage] = useState('')
    const [modalVisible, setModalVisible] = useState(false)

    const vehicleTypes = [
        { type: '2-wheeler', icon: 'bike' },
        { type: '4-wheeler', icon: 'car' },
        { type: 'heavy-vehicle', icon: 'truck' },
    ];

    const validateInputs = () => {
        let errors = {}
        if (!selectedVehicleType) {
            errors.selectedVehicleType = 'Please select vehicle type';
        }
        if (!vehicleNumber.trim()) {
            errors.vehicleNumber = 'Vehicle number is required';
        }
        if (!parking.security && !duration) {
            errors.duration = 'Duration is required';
        }
        setError(errors)
        if (Object.keys(errors).length > 0) {
            setTimeout(() => setError({}), 3000);
            return false;
        }
        return true;
    };

    const handleBooking = async () => {
        if (!validateInputs()) return;

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.post('http://192.168.0.100:5000/bookings/book-parking', {
                parkingId: parking._id,
                vehicleType: selectedVehicleType,
                vehicleNumber,
                duration: parking.security ? undefined : Number(duration),
            }, { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setBookingResult(response.data.booking);
            }
        } catch (error) {
            setModalMessage(error.response?.data?.message || 'Booking failed');
            setModalVisible(true)
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Booking Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri:
                                parking?.imageUrl ||
                                'https://via.placeholder.com/400x200.png?text=Parking+Image',
                        }}
                        style={styles.parkingImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Parking Info */}
                <View style={styles.parkingInfoContainer}>
                    <Text style={styles.parkingName}>{parking.parkingName}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.rowItem}>
                            <Icon name="star" size={16} color="#FFD700" />
                            <Text style={styles.rowItemText}>4.7</Text>
                        </View>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.rowItemText}>{parking.address}</Text>
                    </View>

                    <View style={[styles.statsRow, { marginTop: 8 }]}>
                        <Text style={styles.subStat}>4 slots left</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.subStat}>1.2 km</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.subStat}>500 cars</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Vehicle</Text>
                    <View style={styles.vehicleTypeContainer}>
                        {vehicleTypes.map(({ type, icon }) => {
                            if (!parking.vehicleTypes[type]) return null;
                            const isSelected = selectedVehicleType === type;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.vehicleTypeButton,
                                        isSelected && styles.vehicleTypeButtonSelected,
                                    ]}
                                    onPress={() => setSelectedVehicleType(type)}
                                >
                                    <Icon
                                        name={icon}
                                        size={24}
                                        color={isSelected ? '#fff' : '#4CAF50'}
                                    />
                                    <Text
                                        style={[
                                            styles.vehicleTypeText,
                                            isSelected && styles.vehicleTypeTextSelected,
                                        ]}
                                    >
                                        {type.replace('-', ' ')}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.vehicleRate,
                                            isSelected && styles.vehicleRateSelected,
                                        ]}
                                    >
                                        ₹{parking.hourlyRates[type]}/hr
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {error.selectedVehicleType ? <View style={styles.errorContainer}>
                        <Icon name="alert-circle" size={16} color="#FF3B30" />
                        <Text style={styles.errorText}>{error.selectedVehicleType}</Text>
                    </View> : null}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Booking Details</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Vehicle Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="E.g. MH01AB1234"
                            placeholderTextColor="#666"
                            value={vehicleNumber}
                            onChangeText={(text) => setVehicleNumber(text.toUpperCase())}
                            autoCapitalize="characters"
                        />
                    </View>
                    {error.vehicleNumber ? <View style={styles.errorContainer}>
                        <Icon name="alert-circle" size={16} color="#FF3B30" />
                        <Text style={styles.errorText}>{error.vehicleNumber}</Text>
                    </View> : null}

                    {!parking.security && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Duration (hours)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter duration in hours"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={duration}
                                onChangeText={setDuration}
                            />
                        </View>
                    )}
                    {error.duration ? <View style={styles.errorContainer}>
                        <Icon name="alert-circle" size={16} color="#FF3B30" />
                        <Text style={styles.errorText}>{error.duration}</Text>
                    </View> : null}

                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={handleBooking}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.bookButtonText}>
                                {parking.security ? 'Generate Parking Pass' : 'Confirm Booking'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={!!bookingResult} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Icon name="check-circle" size={50} color="#4CAF50" />
                        <Text style={styles.modalTitle}>Booking Confirmed!</Text>

                        {parking.security ? (
                            <>
                                <DetailItem
                                    label="Entry Token"
                                    value={bookingResult?.entryToken}
                                />
                                <DetailItem
                                    label="Exit Token"
                                    value={bookingResult?.exitToken}
                                />
                            </>
                        ) : (
                            <>
                                <DetailItem
                                    label="Duration"
                                    value={`${bookingResult?.duration} hours`}
                                />
                                <DetailItem
                                    label="Total Amount"
                                    value={`₹${bookingResult?.bill?.totalAmount}`}
                                />
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => navigation.navigate("BookingHistoryDetail", { bookingDetails: bookingResult })}
                        >
                            <Text style={styles.modalButtonText}>View Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.modalButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        </View>
    );
};

const DetailItem = ({ label, value }) => (
    <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#181818',
    },
    header: {
        backgroundColor: '#0f0f0f',
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderColor: '#333'
    },
    headerTitle: {
        fontSize: 20,
        color: '#FFF',
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingVertical: 20,
    },
    imageContainer: {
        width: '90%',
        height: 200,
        backgroundColor: '#333',
        alignSelf: 'center',
        borderRadius: 15,
    },
    parkingImage: {
        width: '100%',
        height: '100%',
    },
    parkingInfoContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    parkingName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 6,
    },
    rowItemText: {
        color: '#AAAAAA',
        marginLeft: 4,
        fontSize: 14,
    },
    dotSeparator: {
        color: '#888',
        marginHorizontal: 6,
    },
    subStat: {
        color: '#888',
        fontSize: 14,
    },
    section: {
        backgroundColor: '#222',
        marginHorizontal: 15,
        marginVertical: 10,
        borderRadius: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    sectionTitle: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    vehicleTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    vehicleTypeButton: {
        width: '30%',
        backgroundColor: '#2f2f2f',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    vehicleTypeButtonSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    vehicleTypeText: {
        marginTop: 5,
        fontSize: 14,
        color: '#4CAF50',
    },
    vehicleTypeTextSelected: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    vehicleRate: {
        marginTop: 2,
        fontSize: 14,
        color: '#4CAF50',
    },
    vehicleRateSelected: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        color: '#AAAAAA',
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#2f2f2f',
        color: '#FFF',
        borderRadius: 15,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#444',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginLeft: 8,
    },
    bookButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 5,
    },
    bookButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
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

export default BookingScreen;
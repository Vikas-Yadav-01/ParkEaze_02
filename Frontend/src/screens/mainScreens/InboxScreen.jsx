import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const InboxScreen = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Uncomment below to simulate incoming messages
    /*
    setMessages([
      { id: '1', title: 'Booking Request', content: 'Someone wants to book your parking spot.' },
      { id: '2', title: 'Reminder', content: 'Payment is due tomorrow.' },
    ]);
    */
  }, []);

  const renderMessage = ({ item }) => (
    <View style={styles.messageCard}>
      <Text style={styles.messageTitle}>{item.title}</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name='email-outline' size={24} color="#fff" />
        <Text style={styles.title}>Inbox</Text>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="email-outline" size={48} color="#777" />
          <Text style={styles.noMessageText}>No message</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  listContent: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  messageTitle: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  messageContent: {
    color: '#ccc',
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMessageText: {
    marginTop: 10,
    color: '#aaa',
    fontSize: 18,
  },
});

export default InboxScreen;
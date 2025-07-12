import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const FirebaseTestScreen = () => {
  const [status, setStatus] = useState({
    auth: 'Checking...',
    firestore: 'Checking...',
    user: null,
  });

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      // Test Auth
      const currentUser = auth().currentUser;
      setStatus(prev => ({
        ...prev,
        auth: currentUser ? 'Connected (User logged in)' : 'Connected (No user)',
        user: currentUser?.uid,
      }));

      // Test Firestore
      const testDoc = await firestore()
        .collection('test')
        .doc('connection')
        .get();
      
      setStatus(prev => ({
        ...prev,
        firestore: 'Connected successfully',
      }));
    } catch (error) {
      console.error('Firebase test error:', error);
      setStatus(prev => ({
        ...prev,
        auth: error.message.includes('auth') ? `Error: ${error.message}` : prev.auth,
        firestore: error.message.includes('firestore') ? `Error: ${error.message}` : prev.firestore,
      }));
    }
  };

  const testAnonymousLogin = async () => {
    try {
      const userCredential = await auth().signInAnonymously();
      Alert.alert('Success', `Anonymous user: ${userCredential.user.uid}`);
      testFirebaseConnection();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const testFirestoreWrite = async () => {
    try {
      const docRef = await firestore()
        .collection('test')
        .add({
          message: 'Hello from React Native 0.74.5!',
          timestamp: firestore.FieldValue.serverTimestamp(),
          device: 'Android',
        });
      
      Alert.alert('Success', `Document written with ID: ${docRef.id}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Auth Status:</Text>
        <Text style={[styles.statusValue, status.auth.includes('Connected') && styles.success]}>
          {status.auth}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Firestore Status:</Text>
        <Text style={[styles.statusValue, status.firestore.includes('Connected') && styles.success]}>
          {status.firestore}
        </Text>
      </View>

      {status.user && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>User ID:</Text>
          <Text style={styles.statusValue}>{status.user}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={testAnonymousLogin}>
        <Text style={styles.buttonText}>Test Anonymous Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testFirestoreWrite}>
        <Text style={styles.buttonText}>Test Firestore Write</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testFirebaseConnection}>
        <Text style={styles.buttonText}>Refresh Status</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 14,
    color: '#666',
  },
  success: {
    color: '#4CAF50',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FirebaseTestScreen;

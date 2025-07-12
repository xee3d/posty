import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING } from '../utils/constants';

interface FirebaseAuthTestProps {
  onBack?: () => void;
}

const FirebaseAuthTest: React.FC<FirebaseAuthTestProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth().currentUser);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123456');
  const [testResults, setTestResults] = useState<{[key: string]: string}>({
    auth: 'Not tested',
    firestore: 'Not tested',
    anonymous: 'Not tested',
    email: 'Not tested',
  });

  useEffect(() => {
    // Auth state listener
    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      console.log('Auth state changed:', currentUser?.uid);
    });

    // Initial connection test
    testFirebaseConnection();

    return unsubscribe;
  }, []);

  const testFirebaseConnection = async () => {
    try {
      // Test Auth connection
      const authTest = auth().app ? '✅ Connected' : '❌ Not connected';
      
      // Test Firestore connection
      let firestoreTest = '❌ Not connected';
      try {
        await firestore().collection('test').doc('ping').set({
          timestamp: firestore.FieldValue.serverTimestamp(),
          test: true,
        });
        firestoreTest = '✅ Connected';
      } catch (error) {
        firestoreTest = `❌ Error: ${error.message}`;
      }

      setTestResults(prev => ({
        ...prev,
        auth: authTest,
        firestore: firestoreTest,
      }));
    } catch (error) {
      console.error('Connection test error:', error);
    }
  };

  const testAnonymousLogin = async () => {
    setLoading(true);
    try {
      if (user) {
        await auth().signOut();
      }
      
      const userCredential = await auth().signInAnonymously();
      setTestResults(prev => ({
        ...prev,
        anonymous: `✅ Success: ${userCredential.user.uid}`,
      }));
      Alert.alert('Success', `Anonymous login successful!\nUID: ${userCredential.user.uid}`);
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        anonymous: `❌ Error: ${error.message}`,
      }));
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testEmailLogin = async () => {
    setLoading(true);
    try {
      if (user) {
        await auth().signOut();
      }

      // Try to create account first
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        setTestResults(prev => ({
          ...prev,
          email: `✅ Account created: ${userCredential.user.email}`,
        }));
        Alert.alert('Success', 'Account created successfully!');
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          // Try to sign in
          const userCredential = await auth().signInWithEmailAndPassword(email, password);
          setTestResults(prev => ({
            ...prev,
            email: `✅ Signed in: ${userCredential.user.email}`,
          }));
          Alert.alert('Success', 'Signed in successfully!');
        } else {
          throw createError;
        }
      }
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        email: `❌ Error: ${error.message}`,
      }));
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testFirestoreWrite = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const docRef = await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          email: user.email || 'anonymous',
          lastLogin: firestore.FieldValue.serverTimestamp(),
          testData: {
            platform: 'React Native 0.74.5',
            timestamp: new Date().toISOString(),
          },
        });

      Alert.alert('Success', 'Data written to Firestore!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testFirestoreRead = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const doc = await firestore()
        .collection('users')
        .doc(user.uid)
        .get();

      if (doc.exists) {
        Alert.alert('Success', `Data: ${JSON.stringify(doc.data(), null, 2)}`);
      } else {
        Alert.alert('Info', 'No data found for this user');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await auth().signOut();
      setTestResults(prev => ({
        ...prev,
        anonymous: 'Not tested',
        email: 'Not tested',
      }));
      Alert.alert('Success', 'Signed out successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back button */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
          <Text style={styles.backText}>Back to Settings</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.header}>
        <Icon name="local-fire-department" size={40} color={COLORS.warning} />
        <Text style={styles.title}>Firebase Auth Test</Text>
        <Text style={styles.subtitle}>React Native 0.74.5</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Auth Service:</Text>
          <Text style={styles.statusValue}>{testResults.auth}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Firestore:</Text>
          <Text style={styles.statusValue}>{testResults.firestore}</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={testFirebaseConnection}>
          <Text style={styles.buttonText}>Refresh Connection</Text>
        </TouchableOpacity>
      </View>

      {/* Current User */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User</Text>
        {user ? (
          <>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>UID:</Text>
              <Text style={styles.statusValue}>{user.uid}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Email:</Text>
              <Text style={styles.statusValue}>{user.email || 'Anonymous'}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Provider:</Text>
              <Text style={styles.statusValue}>
                {user.providerData.length > 0 ? user.providerData[0].providerId : 'anonymous'}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.noUserText}>No user logged in</Text>
        )}
      </View>

      {/* Authentication Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication Tests</Text>
        
        {/* Anonymous Login */}
        <View style={styles.testItem}>
          <Text style={styles.testLabel}>Anonymous Login:</Text>
          <Text style={styles.testResult}>{testResults.anonymous}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={testAnonymousLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Anonymous Login</Text>
        </TouchableOpacity>

        {/* Email Login */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.testItem}>
          <Text style={styles.testLabel}>Email Login:</Text>
          <Text style={styles.testResult}>{testResults.email}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={testEmailLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Email Login</Text>
        </TouchableOpacity>
      </View>

      {/* Firestore Tests */}
      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firestore Tests</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.halfButton]} 
              onPress={testFirestoreWrite}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Write Data</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.halfButton]} 
              onPress={testFirestoreRead}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Read Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sign Out */}
      {user && (
        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]} 
          onPress={signOut}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.large,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.small,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  section: {
    backgroundColor: COLORS.white,
    margin: SPACING.medium,
    padding: SPACING.medium,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statusValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  testItem: {
    marginBottom: SPACING.small,
  },
  testLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  testResult: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  noUserText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    paddingVertical: SPACING.medium,
  },
  button: {
    backgroundColor: COLORS.lightBackground,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
    margin: SPACING.medium,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: SPACING.tiny,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: SPACING.small,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  inputContainer: {
    marginVertical: SPACING.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginBottom: SPACING.small,
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginTop: SPACING.small,
  },
  backText: {
    marginLeft: SPACING.small,
    fontSize: 16,
    color: COLORS.text,
  },
});

export default FirebaseAuthTest;

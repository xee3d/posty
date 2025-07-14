import React from 'react';
import { SafeAreaView } from 'react-native';
import APITestScreen from './src/screens/APITestScreen';

const TestApp = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <APITestScreen />
    </SafeAreaView>
  );
};

export default TestApp;

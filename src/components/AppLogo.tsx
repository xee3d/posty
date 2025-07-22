import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface AppLogoProps {
  size?: number;
  showText?: boolean;
  variant?: 'primary' | 'white';
}

const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 100, 
  showText = false,
  variant = 'primary' 
}) => {
  const isWhite = variant === 'white';
  
  return (
    <View style={styles.container}>
      {isWhite ? (
        <View style={[styles.logoBox, { width: size, height: size }, styles.whiteLogoBox]}>
          <Text style={[styles.logoText, { fontSize: size * 0.5 }, styles.whiteLogoText]}>P</Text>
        </View>
      ) : (
        <LinearGradient
          colors={['#7C3AED', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.logoBox, { width: size, height: size }]}
        >
          <Text style={[styles.logoText, { fontSize: size * 0.5 }]}>P</Text>
        </LinearGradient>
      )}
      
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.appName, isWhite && styles.whiteAppName]}>Posty</Text>
          <Text style={[styles.tagline, isWhite && styles.whiteTagline]}>AI가 쓰고, 나는 빛나고</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoBox: {
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  whiteLogoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
  },
  logoText: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  whiteLogoText: {
    color: '#7C3AED',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: -1,
    marginBottom: 4,
  },
  whiteAppName: {
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    letterSpacing: -0.3,
  },
  whiteTagline: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default AppLogo;

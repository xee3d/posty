import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

// Memoize dimensions to prevent unnecessary re-calculations
const SCREEN_DIMENSIONS = {
  width: 120,
  height: 120
};

const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onAnimationComplete }) => {
  // 애니메이션 없이 1초 후 완료
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 1000); // 1초 동안 표시
    
    return () => {
      clearTimeout(timer);
    };
  }, [onAnimationComplete]);

  return (
    <>
      <StatusBar 
        backgroundColor="#FFFFFF" 
        barStyle="dark-content" 
      />
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* 아이콘 제거 - 깔끔한 흰 배경만 표시 */}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: SCREEN_DIMENSIONS.width,
    height: SCREEN_DIMENSIONS.height,
  },
});

export default AnimatedSplashScreen;
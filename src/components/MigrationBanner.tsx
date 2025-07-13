import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';

interface MigrationBannerProps {
  onMigratePress: () => void;
  onDismiss: () => void;
}

const MigrationBanner: React.FC<MigrationBannerProps> = ({ onMigratePress, onDismiss }) => {
  const { colors } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    checkAndShowBanner();
  }, []);

  const checkAndShowBanner = async () => {
    try {
      // 배너를 이미 닫았는지 확인
      const dismissed = await AsyncStorage.getItem('MIGRATION_BANNER_DISMISSED');
      if (dismissed === 'true') return;

      // 마이그레이션이 필요한지 확인
      const migrationStatus = await AsyncStorage.getItem('MIGRATION_COMPLETED_CONTENTS');
      if (migrationStatus === 'true') return;

      // 로컬 데이터가 있는지 확인
      const savedContents = await AsyncStorage.getItem('GENERATED_CONTENTS');
      if (!savedContents || JSON.parse(savedContents).length === 0) return;

      // 배너 표시
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error checking migration banner:', error);
    }
  };

  const handleDismiss = async () => {
    await AsyncStorage.setItem('MIGRATION_BANNER_DISMISSED', 'true');
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onDismiss();
    });
  };

  const styles = createStyles(colors);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Icon name="cloud-upload" size={24} color={colors.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>데이터 백업 가능</Text>
          <Text style={styles.description}>
            클라우드에 백업하여 안전하게 보관하세요
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissText}>나중에</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onMigratePress} style={styles.migrateButton}>
            <Text style={styles.migrateText}>백업하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 1000,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      paddingTop: SPACING.xl, // StatusBar 공간
    },
    textContainer: {
      flex: 1,
      marginLeft: SPACING.md,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    description: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    dismissButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    dismissText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    migrateButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
    },
    migrateText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.white,
    },
  });

export default MigrationBanner;

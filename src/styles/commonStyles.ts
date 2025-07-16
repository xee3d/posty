import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, CARD_THEME } from '../utils/constants';
import { getFontStyle, TEXT_STYLES } from '../utils/fonts';

// 공통 헤더 스타일
export const createHeaderStyles = (colors: typeof COLORS) => StyleSheet.create({
  headerSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...getFontStyle('xxl', 'bold'),
    fontSize: 28, // 커스텀 크기
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...getFontStyle('sm', 'regular'),
    fontSize: 15, // 커스텀 크기
    color: colors.text.secondary,
    lineHeight: 22,
  },
});

// 공통 섹션 스타일
export const createSectionStyles = (colors: typeof COLORS) => StyleSheet.create({
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...getFontStyle('lg', 'bold'),
    color: colors.text.primary,
    marginBottom: SPACING.md,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    ...getFontStyle('sm', 'regular'),
    color: colors.text.secondary,
    marginBottom: SPACING.md,
  },
});

// 공통 토큰 표시 스타일
export const createTokenStyles = (colors: typeof COLORS) => StyleSheet.create({
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tokenText: {
    ...getFontStyle('sm', 'medium'),
    color: colors.primary,
  },
  tokenTextEmpty: {
    color: colors.error,
  },
  tokenBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  tokenBalanceText: {
    ...getFontStyle('md', 'bold'),
    color: '#FFFFFF',
  },
});

// 공통 버튼 스타일
export const createButtonStyles = (colors: typeof COLORS) => StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...TEXT_STYLES.button,
    color: colors.white,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// 스타일 조합 헬퍼
export const combineStyles = (...styles: (ViewStyle | TextStyle | undefined)[]) => {
  return styles.filter(Boolean);
};
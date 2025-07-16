import { Platform } from 'react-native';

// 아이콘 이름 상수 정의 - 타입 안전성 보장
export const ICON_NAMES = {
  // 시간 관련
  TIME: Platform.select({ ios: 'time-outline', android: 'time-outline' }),
  TIME_FILLED: Platform.select({ ios: 'time', android: 'time' }),
  
  // 편집/작성 관련
  EDIT: Platform.select({ ios: 'create-outline', android: 'create-outline' }),
  EDIT_FILLED: Platform.select({ ios: 'create', android: 'create' }),
  PENCIL: Platform.select({ ios: 'pencil-outline', android: 'pencil-outline' }),
  
  // 이미지/카메라 관련
  IMAGE: Platform.select({ ios: 'image-outline', android: 'image-outline' }),
  CAMERA: Platform.select({ ios: 'camera-outline', android: 'camera-outline' }),
  IMAGES: Platform.select({ ios: 'images-outline', android: 'images-outline' }),
  ALBUMS: Platform.select({ ios: 'albums-outline', android: 'albums-outline' }),
  
  // 날씨 관련
  SUNNY: Platform.select({ ios: 'sunny-outline', android: 'sunny-outline' }),
  RAINY: Platform.select({ ios: 'rainy-outline', android: 'rainy-outline' }),
  UMBRELLA: Platform.select({ ios: 'umbrella-outline', android: 'umbrella-outline' }),
  WATER: Platform.select({ ios: 'water-outline', android: 'water-outline' }),
  
  // 캘린더/이벤트 관련
  CALENDAR: Platform.select({ ios: 'calendar-outline', android: 'calendar-outline' }),
  EVENT: Platform.select({ ios: 'calendar-outline', android: 'calendar-outline' }),
  
  // 감정/축하 관련
  HAPPY: Platform.select({ ios: 'happy-outline', android: 'happy-outline' }),
  STAR: Platform.select({ ios: 'star-outline', android: 'star-outline' }),
  TROPHY: Platform.select({ ios: 'trophy-outline', android: 'trophy-outline' }),
  
  // 자연/장소 관련
  LEAF: Platform.select({ ios: 'leaf-outline', android: 'leaf-outline' }),
  RESTAURANT: Platform.select({ ios: 'restaurant-outline', android: 'restaurant-outline' }),
  
  // 기타 UI 아이콘
  ADD_CIRCLE: Platform.select({ ios: 'add-circle-outline', android: 'add-circle-outline' }),
  BULB: Platform.select({ ios: 'bulb-outline', android: 'bulb-outline' }),
  CASH: Platform.select({ ios: 'cash-outline', android: 'cash-outline' }),
  FLAG: Platform.select({ ios: 'flag-outline', android: 'flag-outline' }),
  ROCKET: Platform.select({ ios: 'rocket-outline', android: 'rocket-outline' }),
  FLAME: Platform.select({ ios: 'flame-outline', android: 'flame-outline' }),
  HOURGLASS: Platform.select({ ios: 'hourglass-outline', android: 'hourglass-outline' }),
  PULSE: Platform.select({ ios: 'pulse-outline', android: 'pulse-outline' }),
  COLOR_WAND: Platform.select({ ios: 'color-wand-outline', android: 'color-wand-outline' }),
  
  // 트렌드/통계 관련
  TRENDING_UP: Platform.select({ ios: 'trending-up-outline', android: 'trending-up-outline' }),
  TRENDING_DOWN: Platform.select({ ios: 'trending-down-outline', android: 'trending-down-outline' }),
  
  // 내비게이션
  CHEVRON_UP: Platform.select({ ios: 'chevron-up', android: 'chevron-up' }),
  CHEVRON_DOWN: Platform.select({ ios: 'chevron-down', android: 'chevron-down' }),
  ARROW_FORWARD: Platform.select({ ios: 'arrow-forward', android: 'arrow-forward' }),
  
  // 소셜 미디어
  LOGO_INSTAGRAM: 'logo-instagram',
  LOGO_FACEBOOK: 'logo-facebook',
  LOGO_TWITTER: 'logo-twitter',
  GLOBE: 'globe',
} as const;

// Material Icons를 위한 별도 상수 (필요한 경우)
export const MATERIAL_ICON_NAMES = {
  ACCESS_TIME: 'access-time',
  EDIT: 'edit',
  AUTO_FIX_HIGH: 'auto-fix-high',
  IMAGE: 'image',
  MONETIZATION_ON: 'monetization-on',
  ANIMATION: 'animation',
  WORKSPACE_PREMIUM: 'workspace-premium',
  TIPS_AND_UPDATES: 'tips-and-updates',
  ADD_CIRCLE: 'add-circle',
  WB_SUNNY: 'wb-sunny',
  PHOTO_CAMERA: 'photo-camera',
  RESTAURANT: 'restaurant',
  EVENT: 'event',
  CELEBRATION: 'celebration',
  WEEKEND: 'weekend',
  PARK: 'park',
  WHATSHOT: 'whatshot',
  EDIT_NOTE: 'edit-note',
  PHOTO_LIBRARY: 'photo-library',
  COLLECTIONS: 'collections',
  EMOJI_EVENTS: 'emoji-events',
  GRADE: 'grade',
  ROCKET_LAUNCH: 'rocket-launch',
  WB_TWILIGHT: 'wb-twilight',
} as const;

// 타입 정의
export type IconName = typeof ICON_NAMES[keyof typeof ICON_NAMES];
export type MaterialIconName = typeof MATERIAL_ICON_NAMES[keyof typeof MATERIAL_ICON_NAMES];

// Material Icons에서 Ionicons로 매핑
export const ICON_MAPPING: Record<string, string> = {
  'access-time': ICON_NAMES.TIME!,
  'edit': ICON_NAMES.EDIT!,
  'auto-fix-high': ICON_NAMES.COLOR_WAND!,
  'image': ICON_NAMES.IMAGE!,
  'photo-camera': ICON_NAMES.CAMERA!,
  'monetization-on': ICON_NAMES.CASH!,
  'animation': ICON_NAMES.PULSE!,
  'workspace-premium': ICON_NAMES.STAR!,
  'tips-and-updates': ICON_NAMES.BULB!,
  'add-circle': ICON_NAMES.ADD_CIRCLE!,
  'wb-sunny': ICON_NAMES.SUNNY!,
  'restaurant': ICON_NAMES.RESTAURANT!,
  'event': ICON_NAMES.CALENDAR!,
  'celebration': ICON_NAMES.HAPPY!,
  'weekend': ICON_NAMES.CALENDAR!,
  'park': ICON_NAMES.LEAF!,
  'umbrella': ICON_NAMES.UMBRELLA!,
  'water': ICON_NAMES.WATER!,
  'flag': ICON_NAMES.FLAG!,
  'rocket-launch': ICON_NAMES.ROCKET!,
  'emoji-events': ICON_NAMES.TROPHY!,
  'grade': ICON_NAMES.STAR!,
  'photo-library': ICON_NAMES.IMAGES!,
  'collections': ICON_NAMES.ALBUMS!,
  'whatshot': ICON_NAMES.FLAME!,
  'edit-note': ICON_NAMES.EDIT!,
  'hourglass': ICON_NAMES.HOURGLASS!,
  'wb-twilight': ICON_NAMES.SUNNY!,
  'sunny': ICON_NAMES.SUNNY!,
};

// 헬퍼 함수: Material Icon 이름을 Ionicon 이름으로 변환
export function getIonIconName(materialIconName: string): string {
  return ICON_MAPPING[materialIconName] || materialIconName;
}

// 사용 예시:
// import { ICON_NAMES } from './constants/iconConstants';
// <Icon name={ICON_NAMES.TIME} size={24} color="#000" />

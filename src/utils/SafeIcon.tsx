import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// Ionicons에 실제로 존재하는 기본 아이콘 목록 (일부)
const VALID_IONICONS = [
  'home', 'home-outline', 'home-sharp',
  'create', 'create-outline', 'create-sharp',
  'camera', 'camera-outline', 'camera-sharp',
  'star', 'star-outline', 'star-half',
  'heart', 'heart-outline', 'heart-sharp',
  'calendar', 'calendar-outline', 'calendar-sharp',
  'time', 'time-outline', 'time-sharp',
  'settings', 'settings-outline', 'settings-sharp',
  'person', 'person-outline', 'person-sharp',
  'notifications', 'notifications-outline', 'notifications-sharp',
  'search', 'search-outline', 'search-sharp',
  'add', 'add-outline', 'add-circle', 'add-circle-outline',
  'checkmark', 'checkmark-outline', 'checkmark-circle', 'checkmark-circle-outline',
  'close', 'close-outline', 'close-circle', 'close-circle-outline',
  'arrow-back', 'arrow-forward', 'chevron-back', 'chevron-forward',
  'chevron-up', 'chevron-down', 'chevron-up-outline', 'chevron-down-outline',
  'menu', 'menu-outline', 'ellipsis-horizontal', 'ellipsis-vertical',
  'image', 'images', 'play', 'pause', 'stop',
  'share', 'share-outline', 'copy', 'copy-outline',
  'edit', 'trash', 'trash-outline', 'refresh', 'refresh-outline',
  'information-circle', 'information-circle-outline',
  'warning', 'warning-outline', 'alert-circle', 'alert-circle-outline',
  'help-circle', 'help-circle-outline',
  'location', 'location-outline', 'map', 'map-outline',
  'mail', 'mail-outline', 'call', 'call-outline',
  'globe', 'globe-outline', 'wifi', 'wifi-outline',
  'battery-full', 'battery-half', 'battery-dead',
  'sunny', 'moon', 'cloudy', 'rainy', 'partly-sunny',
  'restaurant', 'restaurant-outline', 'car', 'car-outline',
  'airplane', 'airplane-outline', 'train', 'train-outline',
  'musical-notes', 'musical-notes-outline',
  'headset', 'headset-outline', 'volume-high', 'volume-low', 'volume-mute',
  'diamond', 'diamond-outline', 'trophy', 'trophy-outline',
  'gift', 'gift-outline', 'cash', 'cash-outline', 'card', 'card-outline',
  'business', 'business-outline', 'school', 'school-outline',
  'library', 'library-outline', 'book', 'book-outline',
  'bulb', 'bulb-outline', 'color-palette', 'color-palette-outline',
  'brush', 'brush-outline', 'color-wand', 'color-wand-outline',
  'sparkles', 'sparkles-outline', 'flash', 'flash-outline',
  'construct', 'construct-outline', 'hammer', 'hammer-outline',
  'telescope', 'telescope-outline', 'eye', 'eye-outline',
  'document', 'document-outline', 'document-text', 'document-text-outline',
  'folder', 'folder-outline', 'folder-open', 'folder-open-outline',
  'archive', 'archive-outline', 'download', 'download-outline',
  'cloud', 'cloud-outline', 'cloud-upload', 'cloud-download',
  'link', 'link-outline', 'unlink', 'unlink-outline',
  'lock-closed', 'lock-open', 'key', 'key-outline',
  'shield', 'shield-outline', 'shield-checkmark', 'shield-checkmark-outline',
  'pricetag', 'pricetag-outline', 'pricetags', 'pricetags-outline',
  'people', 'people-outline', 'person-add', 'person-remove',
  'chatbubble', 'chatbubble-outline', 'chatbubbles', 'chatbubbles-outline',
  'thumbs-up', 'thumbs-down', 'thumbs-up-outline', 'thumbs-down-outline',
  'trending-up', 'trending-down', 'stats-chart', 'stats-chart-outline',
  'pie-chart', 'pie-chart-outline', 'bar-chart', 'bar-chart-outline',
  'radio-button-on', 'radio-button-off', 'checkbox', 'checkbox-outline',
  'toggle', 'toggle-outline', 'options', 'options-outline',
  'filter', 'filter-outline', 'funnel', 'funnel-outline',
  'scan', 'scan-outline', 'qr-code', 'qr-code-outline',
  'fingerprint', 'fingerprint-outline', 'hand-left', 'hand-right'
];

interface SafeIconProps {
  name: string;
  size?: number;
  color?: string;
  type?: 'ionicons' | 'material' | 'material-community';
}

// 아이콘 이름 매핑 (Material Design Icons -> Ionicons)
const ICON_MAPPING: Record<string, { type: 'ionicons' | 'material' | 'material-community', name: string }> = {
  // Material Design Icons that might be used
  'wb-twilight': { type: 'ionicons', name: 'partly-sunny' },
  'wb-sunny': { type: 'ionicons', name: 'sunny' },
  'wb-cloudy': { type: 'ionicons', name: 'cloudy' },
  'brightness-4': { type: 'ionicons', name: 'moon' },
  'brightness-7': { type: 'ionicons', name: 'sunny' },
  'brightness-auto': { type: 'ionicons', name: 'contrast' },
  'access-time': { type: 'ionicons', name: 'time-outline' },
  'schedule': { type: 'ionicons', name: 'calendar-outline' },
  'access-alarm': { type: 'ionicons', name: 'alarm-outline' },
  'query-builder': { type: 'ionicons', name: 'time-outline' },
  'trending_up': { type: 'ionicons', name: 'trending-up' },
  'star_rate': { type: 'ionicons', name: 'star' },
  'access_time': { type: 'ionicons', name: 'time-outline' },
  'psychology': { type: 'ionicons', name: 'bulb' },
  'water': { type: 'ionicons', name: 'water' },
  'water_drop': { type: 'ionicons', name: 'water' },
  'local_drink': { type: 'ionicons', name: 'wine' },
  'spa': { type: 'ionicons', name: 'leaf' },
  'light-mode': { type: 'ionicons', name: 'sunny' },
  'dark-mode': { type: 'ionicons', name: 'moon' },
  // Common Material Design Icons to Ionicons mapping
  'edit': { type: 'ionicons', name: 'create' },
  'auto-fix-high': { type: 'ionicons', name: 'color-wand' },
  'photo-camera': { type: 'ionicons', name: 'camera' },
  'monetization-on': { type: 'ionicons', name: 'cash' },
  'animation': { type: 'ionicons', name: 'play-circle' },
  'workspace-premium': { type: 'ionicons', name: 'diamond' },
  'palette': { type: 'ionicons', name: 'color-palette' },
  'tips-and-updates': { type: 'ionicons', name: 'bulb' },
  'info-outline': { type: 'ionicons', name: 'information-circle-outline' },
  'info': { type: 'ionicons', name: 'information-circle' },
  'help-outline': { type: 'ionicons', name: 'help-circle-outline' },
  'error-outline': { type: 'ionicons', name: 'alert-circle-outline' },
  'warning-outline': { type: 'ionicons', name: 'warning-outline' },
  'check-circle-outline': { type: 'ionicons', name: 'checkmark-circle-outline' },
  'play-circle-outline': { type: 'ionicons', name: 'play-circle-outline' },
  'people-outline': { type: 'ionicons', name: 'people-outline' },
  'sync-outline': { type: 'ionicons', name: 'sync-outline' },
  'pencil-outline': { type: 'ionicons', name: 'pencil-outline' },
  'sparkles-outline': { type: 'ionicons', name: 'sparkles-outline' },
  'add-circle-outline': { type: 'ionicons', name: 'add-circle-outline' },
  'notifications-outline': { type: 'ionicons', name: 'notifications-outline' },
  'trophy-outline': { type: 'ionicons', name: 'trophy-outline' },
  'bulb-outline': { type: 'ionicons', name: 'bulb-outline' },
  'create-outline': { type: 'ionicons', name: 'create-outline' },
  'target': { type: 'ionicons', name: 'radio-button-on' },
  'pricetag': { type: 'ionicons', name: 'pricetag' },
  'construct': { type: 'ionicons', name: 'construct' },
  'document-text': { type: 'ionicons', name: 'document-text' },
  'public': { type: 'ionicons', name: 'globe' },
  'card-giftcard': { type: 'ionicons', name: 'gift' },
  'arrow-forward': { type: 'ionicons', name: 'arrow-forward' },
  'refresh': { type: 'ionicons', name: 'refresh' },
  'information-circle': { type: 'ionicons', name: 'information-circle' },
  'checkmark-circle': { type: 'ionicons', name: 'checkmark-circle' },
  'chevron-forward': { type: 'ionicons', name: 'chevron-forward' },
  'block': { type: 'ionicons', name: 'ban' },
  'auto-awesome': { type: 'ionicons', name: 'sparkles' },
  'event': { type: 'ionicons', name: 'calendar' },
  'check': { type: 'ionicons', name: 'checkmark' },
  'arrow-back': { type: 'ionicons', name: 'arrow-back' },
  'flight-takeoff': { type: 'ionicons', name: 'airplane' },
  'account-circle': { type: 'ionicons', name: 'person-circle' },
  'workspace-premium': { type: 'ionicons', name: 'diamond' },
  'account-balance-wallet': { type: 'ionicons', name: 'wallet' },
  
  // Add more mappings as needed
};

export const SafeIcon: React.FC<SafeIconProps> = ({ 
  name, 
  size = 24, 
  color = '#000000',
  type = 'ionicons' 
}) => {
  // Check if we have a mapping for this icon
  const mapping = ICON_MAPPING[name];
  
  if (mapping) {
    name = mapping.name;
    type = mapping.type;
  }

  // 아이콘 이름 검증 및 폴백 로직
  const validateAndRenderIcon = () => {
    try {
      switch (type) {
        case 'material':
          return <MaterialIcon name={name} size={size} color={color} />;
        case 'material-community':
          return <MaterialCommunityIcon name={name} size={size} color={color} />;
        case 'ionicons':
        default:
          // Ionicons의 경우 유효한 아이콘인지 먼저 검증
          if (!VALID_IONICONS.includes(name)) {
            console.warn(`⚠️ Invalid Ionicons name: "${name}". Using fallback icon "help-circle-outline".`);
            // 일반적인 폴백 매핑 시도
            const fallbackName = getFallbackIconName(name);
            if (VALID_IONICONS.includes(fallbackName)) {
              return <Icon name={fallbackName} size={size} color={color} />;
            }
            return <Icon name="help-circle-outline" size={size} color={color} />;
          }
          
          try {
            return <Icon name={name} size={size} color={color} />;
          } catch (iconError) {
            console.warn(`Error rendering icon "${name}". Using fallback.`, iconError);
            return <Icon name="help-circle-outline" size={size} color={color} />;
          }
      }
    } catch (error) {
      console.error(`Critical error rendering icon "${name}":`, error);
      return <Icon name="help-circle-outline" size={size} color={color} />;
    }
  };

  // 폴백 아이콘 이름을 추천하는 함수
  const getFallbackIconName = (iconName: string): string => {
    // 일반적인 패턴 매칭으로 적절한 폴백 찾기
    if (iconName.includes('event') || iconName.includes('calendar')) return 'calendar-outline';
    if (iconName.includes('star') || iconName.includes('rate')) return 'star-outline';
    if (iconName.includes('time') || iconName.includes('clock') || iconName.includes('schedule')) return 'time-outline';
    if (iconName.includes('photo') || iconName.includes('camera') || iconName.includes('image')) return 'camera-outline';
    if (iconName.includes('create') || iconName.includes('edit') || iconName.includes('write')) return 'create-outline';
    if (iconName.includes('person') || iconName.includes('user') || iconName.includes('account')) return 'person-outline';
    if (iconName.includes('info') || iconName.includes('information')) return 'information-circle-outline';
    if (iconName.includes('warning') || iconName.includes('alert')) return 'warning-outline';
    if (iconName.includes('check') || iconName.includes('done') || iconName.includes('success')) return 'checkmark-circle-outline';
    if (iconName.includes('home') || iconName.includes('house')) return 'home-outline';
    if (iconName.includes('setting') || iconName.includes('config')) return 'settings-outline';
    if (iconName.includes('search') || iconName.includes('find')) return 'search-outline';
    if (iconName.includes('mail') || iconName.includes('email') || iconName.includes('message')) return 'mail-outline';
    if (iconName.includes('location') || iconName.includes('place') || iconName.includes('map')) return 'location-outline';
    if (iconName.includes('share')) return 'share-outline';
    if (iconName.includes('copy')) return 'copy-outline';
    if (iconName.includes('heart') || iconName.includes('like') || iconName.includes('favorite')) return 'heart-outline';
    if (iconName.includes('play') || iconName.includes('video')) return 'play-outline';
    if (iconName.includes('music') || iconName.includes('audio') || iconName.includes('sound')) return 'musical-notes-outline';
    
    // 기본 폴백
    return 'help-circle-outline';
  };

  return validateAndRenderIcon();
};

// HOC to wrap existing Icon usage
export const withSafeIcon = (Component: React.ComponentType<any>) => {
  return React.forwardRef((props: any, ref: any) => {
    if (props.name === 'wb-twilight' || props.name?.startsWith('wb-')) {
      const mapping = ICON_MAPPING[props.name];
      if (mapping) {
        return <SafeIcon {...props} name={mapping.name} type={mapping.type} />;
      }
    }
    return <Component ref={ref} {...props} />;
  });
};

// Export wrapped versions
export const IoniconsIcon = withSafeIcon(Icon);
export const MaterialIcons = withSafeIcon(MaterialIcon);
export const MaterialCommunityIcons = withSafeIcon(MaterialCommunityIcon);

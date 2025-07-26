import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  // Validate and provide fallback
  const validateAndRenderIcon = () => {
    try {
      switch (type) {
        case 'material':
          return <MaterialIcon name={name} size={size} color={color} />;
        case 'material-community':
          return <MaterialCommunityIcon name={name} size={size} color={color} />;
        case 'ionicons':
        default:
          // For now, trust the icon names and let Ionicons handle validation
          // We'll catch errors and show fallback if needed
          try {
            return <Icon name={name} size={size} color={color} />;
          } catch (iconError) {
            console.warn(`Invalid icon name: ${name}. Using fallback icon.`);
            return <Icon name="help-circle-outline" size={size} color={color} />;
          }
      }
    } catch (error) {
      console.error(`Error rendering icon ${name}:`, error);
      return <Icon name="help-circle-outline" size={size} color={color} />;
    }
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

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
          // List of valid Ionicons names (partial list for common ones)
          const validIonicons = [
            'home', 'home-outline', 'person', 'person-outline', 'settings', 'settings-outline',
            'sunny', 'moon', 'contrast', 'partly-sunny', 'cloudy', 'create', 'create-outline',
            'trending-up', 'trending-up-outline', 'palette', 'notifications', 'notifications-outline',
            'star', 'star-outline', 'heart', 'heart-outline', 'camera', 'camera-outline',
            'image', 'image-outline', 'add', 'close', 'checkmark', 'chevron-forward', 'chevron-back',
          ];
          
          // Check if it's a valid ionicon
          const baseIconName = name.replace(/-outline|-sharp$/, '');
          const isValid = validIonicons.some(validName => {
            const validBase = validName.replace(/-outline|-sharp$/, '');
            return validBase === baseIconName;
          });
          
          if (!isValid) {
            console.warn(`Invalid icon name: ${name}. Using fallback icon.`);
            return <Icon name="help-circle-outline" size={size} color={color} />;
          }
          
          return <Icon name={name} size={size} color={color} />;
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

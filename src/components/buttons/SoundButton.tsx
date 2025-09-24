import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  StyleProp,
} from "react-native";
import { soundManager } from "../../utils/soundManager";

interface SoundButtonProps extends TouchableOpacityProps {
  soundType?:
    | "tap"
    | "success"
    | "error"
    | "generate"
    | "copy"
    | "celebration"
    | "none";
  hapticType?: "light" | "medium" | "heavy" | "none";
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * 터치 시 사운드와 진동을 제공하는 버튼 컴포넌트
 *
 * @example
 * <SoundButton
 *   soundType="tap"
 *   hapticType="light"
 *   onPress={handlePress}
 * >
 *   <Text>클릭</Text>
 * </SoundButton>
 */
export const SoundButton: React.FC<SoundButtonProps> = ({
  soundType = "tap",
  hapticType = "none",
  onPress,
  children,
  style,
  disabled,
  ...props
}) => {
  const handlePress = (event: any) => {
    if (!disabled) {
      // 사운드 재생
      if (soundType !== "none") {
        switch (soundType) {
          case "tap":
            soundManager.playTap();
            break;
          case "success":
            soundManager.playSuccess();
            break;
          case "error":
            soundManager.playError();
            break;
          case "generate":
            soundManager.playGenerate();
            break;
          case "copy":
            soundManager.playCopy();
            break;
          case "celebration":
            soundManager.playCelebration();
            break;
        }
      } else if (hapticType !== "none") {
        // soundType이 none이고 hapticType만 있는 경우
        soundManager.haptic(hapticType);
      }
    }

    // 원래 onPress 호출
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity
      style={style}
      onPress={handlePress}
      disabled={disabled}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export default SoundButton;

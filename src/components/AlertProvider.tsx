import React, { useState, useImperativeHandle, forwardRef } from "react";
import { CustomAlert, AlertManager } from "./CustomAlert";

interface AlertConfig {
  title?: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
  icon?: string;
  iconColor?: string;
}

export const AlertProvider = forwardRef(
  (props: { children: React.ReactNode }, ref) => {
    const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
    const [visible, setVisible] = useState(false);

    useImperativeHandle(
      ref,
      () => {
        const alertApi = {
          show: (config: AlertConfig) => {
            if (__DEV__) {
              console.log("AlertProvider.show called with:", {
                title: config.title,
                message:
                  config.message?.substring(0, 30) +
                  (config.message?.length > 30 ? "..." : ""),
                buttonsCount: config.buttons?.length || 0,
              });
            }
            setAlertConfig(config);
            setVisible(true);
          },
          hide: () => {
            setVisible(false);
            setTimeout(() => setAlertConfig(null), 300);
          },
        };

        // AlertManager에 즉시 설정
        setTimeout(() => {
          AlertManager.setAlertRef(alertApi);
        }, 0);

        return alertApi;
      },
      []
    );

    const handleButtonPress = (onPress?: () => void) => {
      setVisible(false);
      setTimeout(() => {
        onPress?.();
        setAlertConfig(null);
      }, 300);
    };

    return (
      <>
        {props.children}
        {alertConfig && (
          <CustomAlert
            visible={visible}
            title={alertConfig.title}
            message={alertConfig.message}
            buttons={
              alertConfig.buttons?.map((button) => ({
                ...button,
                onPress: () => handleButtonPress(button.onPress),
              })) || [{ text: "OK", onPress: () => handleButtonPress() }]
            }
            icon={alertConfig.icon}
            iconColor={alertConfig.iconColor}
          />
        )}
      </>
    );
  }
);

AlertProvider.displayName = "AlertProvider";

// 전역 Alert 함수
export const showAlert = (
  title: string | undefined,
  message: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>,
  options?: {
    icon?: string;
    iconColor?: string;
  }
) => {
  AlertManager.show(title, message, buttons, options);
};

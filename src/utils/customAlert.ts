import { AlertManager } from "../components/CustomAlert";
import { Alert as RNAlert } from "react-native";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
}

class CustomAlertHelper {
  static alert(
    title: string | undefined,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) {
    if (__DEV__) {
      console.log("CustomAlert.alert called:", {
        title,
        message,
        buttons: buttons?.length || 0,
      });
    }

    // 메시지가 없으면 title을 message로 사용
    const finalMessage = message || title || "";
    const finalTitle = message ? title : undefined;

    // 아이콘 결정 (제목이나 메시지 내용에 따라)
    let icon: string | undefined;
    let iconColor: string | undefined;

    const combinedText = `${finalTitle || ""} ${finalMessage}`.toLowerCase();

    if (combinedText.includes("성공") || combinedText.includes("완료")) {
      icon = "checkmark-circle";
      iconColor = "#10B981";
    } else if (combinedText.includes("오류") || combinedText.includes("실패")) {
      icon = "alert-circle";
      iconColor = "#EF4444";
    } else if (combinedText.includes("주의") || combinedText.includes("경고")) {
      icon = "warning";
      iconColor = "#F59E0B";
    } else if (combinedText.includes("질문") || combinedText.includes("?")) {
      icon = "help-circle";
      iconColor = "#3B82F6";
    } else {
      icon = "information-circle";
      iconColor = "#6366F1";
    }

    if (__DEV__) {
      console.log("Calling AlertManager.show with:", {
        title: finalTitle,
        message:
          finalMessage?.substring(0, 50) +
          (finalMessage?.length > 50 ? "..." : ""),
        buttonsCount: buttons?.length || 0,
      });
    }

    try {
      AlertManager.show(finalTitle, finalMessage, buttons, { icon, iconColor });
    } catch (error) {
      console.error(
        "CustomAlert failed, falling back to React Native Alert:",
        error
      );
      // Fallback to React Native Alert
      RNAlert.alert(finalTitle || "", finalMessage, buttons, options);
    }
  }
}

export const Alert = CustomAlertHelper;

// 다국어 사용 예시
import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

const ExampleScreen = () => {
  const { t } = useTranslation();
  
  return (
    <View>
      {/* 번역된 텍스트 사용 */}
      <Text>{t("aiWrite.title")}</Text>
      <Text>{t("aiWrite.buttons.generate")}</Text>

      {/* 동적 값과 함께 사용 */}
      <Text>{t("tokens.badge")}: 10</Text>
    </View>
  );
};

export default ExampleScreen;

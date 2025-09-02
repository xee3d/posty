import React from "react";
import { useAppTheme } from "../hooks/useAppTheme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // useAppTheme 훅은 이미 전역 상태를 관리하므로
  // 단순히 children을 반환합니다
  return <>{children}</>;
};

// 테마 컨텍스트를 위한 래퍼 컴포넌트
export const ThemedApp: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

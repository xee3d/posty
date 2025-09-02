import React from "react";
import ModernOnboardingScreen from "./ModernOnboardingScreen";

interface OnboardingScreenProps {
  onComplete?: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  return <ModernOnboardingScreen onComplete={onComplete} />;
};

export default OnboardingScreen;

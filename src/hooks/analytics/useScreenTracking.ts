import { useEffect } from 'react';
import analyticsService from '../../services/analytics/analyticsService';

export const useScreenTracking = (screenName: string, screenClass?: string) => {
  useEffect(() => {
    // 화면 진입 시 추적
    analyticsService.logScreenView(screenName, screenClass);
  }, [screenName, screenClass]);
};
import { useEffect } from 'react';
import serverAIService from '../services/serverAIService';

export const useWarmUpServer = () => {
  useEffect(() => {
    // 앱 시작 시 서버를 미리 깨워놓기
    const warmUp = async () => {
      try {
        console.log('Warming up server...');
        await serverAIService.checkHealth();
        console.log('Server is ready!');
      } catch (error) {
        console.log('Server warm-up failed, but will retry on actual request');
      }
    };
    
    warmUp();
    
    // 5분마다 health check (옵션)
    const interval = setInterval(warmUp, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
};

// src/utils/suppressWarnings.js
import { LogBox } from 'react-native';

/**
 * Firebase 마이그레이션 경고를 완전히 차단합니다.
 * index.js 최상단에서 import 하세요.
 */

// LogBox로 경고 숨기기
LogBox.ignoreLogs([
  // Firebase 관련 모든 경고
  /.*@react-native-firebase.*/,
  /.*firebase.*/i,
  /.*deprecated.*method.*/i,
  /.*will be removed.*/i,
  /.*Please use.*/i,
  /.*getApp.*/,
  /.*getAuth.*/,
  /.*getFirestore.*/,
  
  // 기타 일반적인 경고
  'Non-serializable values were found',
  'Require cycle:',
  'Remote debugger',
]);

// 개발 모드에서만 console.warn 오버라이드
if (__DEV__) {
  const originalWarn = console.warn;
  
  console.warn = (...args) => {
    try {
      const warningMessage = args.join(' ');
      
      // Firebase 경고 패턴 체크
      const firebasePatterns = [
        'deprecated',
        'firebase',
        'will be removed',
        'Please use',
        'getApp',
        'getAuth',
        'getFirestore',
        'method is deprecated',
        'namespaced API',
      ];
      
      const shouldSuppress = firebasePatterns.some(pattern => 
        warningMessage.toLowerCase().includes(pattern.toLowerCase())
      );
      
      // Firebase 경고가 아닌 경우에만 출력
      if (!shouldSuppress) {
        originalWarn.apply(console, args);
      }
    } catch (e) {
      // 오류 발생 시 원본 함수 호출
      originalWarn.apply(console, args);
    }
  };
}

export default {};
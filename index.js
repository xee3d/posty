// Prevent Object.prototype modification
const originalToString = Object.prototype.toString;
Object.freeze(Object.prototype);

// Firebase 경고 완전 차단 (가장 먼저 import)
import './src/utils/suppressWarnings';

import 'react-native-gesture-handler';
import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// 개발 환경에서 특정 로그 숨기기
if (__DEV__) {
  // Base64 문자열 패턴 무시 (긴 문자열)
  LogBox.ignoreLogs([
    /^[A-Za-z0-9+/]{100,}/,  // 100자 이상의 Base64 문자열 무시
  ]);
}

AppRegistry.registerComponent(appName, () => App);

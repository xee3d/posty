// Prevent Object.prototype modification
const originalToString = Object.prototype.toString;
Object.freeze(Object.prototype);

import 'react-native-gesture-handler';
import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Firebase v20 deprecation 경고 임시 숨김
LogBox.ignoreLogs([
  'This method is deprecated',
  'Method called was',
  'Please use `getApp()` instead',
]);

AppRegistry.registerComponent(appName, () => App);

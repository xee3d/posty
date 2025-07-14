// Prevent Object.prototype modification
const originalToString = Object.prototype.toString;
Object.freeze(Object.prototype);

// Firebase 경고 완전 차단 (가장 먼저 import)
import './src/utils/suppressWarnings';

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

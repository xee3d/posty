// Prevent Object.prototype modification
const originalToString = Object.prototype.toString;
Object.freeze(Object.prototype);

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

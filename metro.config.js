const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      keep_fnames: false,
      mangle: {
        keep_fnames: false,
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
      },
      output: {
        comments: false,
        ascii_only: true,
      },
    },
  },
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    blockList: [
      /node_modules\/.*\/android\/build\/.*/,
      /android\/build\/.*/,
      /android\/app\/build\/.*/,
      /\.gradle\/.*/,
      /\.git\/.*/,
    ],
    // Firebase Mock Aliasing (문서에서 언급한 방법)
    alias: {
      '@react-native-firebase/auth': './src/mocks/firebase-auth-mock.js',
      '@react-native-firebase/firestore': './src/mocks/firebase-firestore-mock.js',
      '@react-native-firebase/analytics': './src/mocks/firebase-analytics-mock.js',
      '@react-native-firebase/app': './src/mocks/firebase-app-mock.js',
    },
  },
  server: {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        if (req.url.includes('symbolicate')) {
          console.log('Symbolicate request:', req.url);
        }
        return middleware(req, res, next);
      };
    },
  },
  watchFolders: [],
  watcher: {
    useWatchman: false,
    crawlDelay: 300,
    ignore: [
      '**/android/build/**',
      '**/android/app/build/**',
      '**/android/.gradle/**',
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);

const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    minifierPath: "metro-minify-terser",
    minifierConfig: {
      keep_fnames: true, // 디버깅을 위해 함수명 유지
      mangle: {
        keep_fnames: true, // 함수명 난독화 방지
      },
      compress: {
        drop_console: false, // 개발 중에는 console 유지
        drop_debugger: false,
        pure_funcs: [], // 개발 중에는 pure 함수 제거하지 않음
      },
      output: {
        comments: true, // 주석 유지
        ascii_only: true,
      },
    },
    // JSCRuntime 메모리 누수 방지
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: ["jsx", "js", "ts", "tsx", "json"],
    blockList: [
      /node_modules\/.*\/android\/build\/.*/,
      /android\/build\/.*/,
      /android\/app\/build\/.*/,
      /\.gradle\/.*/,
      /\.git\/.*/,
    ],
    // Firebase Mock Aliasing (문서에서 언급한 방법)
    alias: {
      "@react-native-firebase/auth": "./src/mocks/firebase-auth-mock.js",
      "@react-native-firebase/firestore":
        "./src/mocks/firebase-firestore-mock.js",
      "@react-native-firebase/analytics":
        "./src/mocks/firebase-analytics-mock.js",
      "@react-native-firebase/app": "./src/mocks/firebase-app-mock.js",
    },
  },
  server: {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        if (req.url.includes("symbolicate")) {
          console.log("Symbolicate request:", req.url);
        }
        return middleware(req, res, next);
      };
    },
  },
  watchFolders: [],
  // 메모리 누수 방지를 위한 설정
  maxWorkers: 2,
  resetCache: true,
  cacheVersion: "1.0",
};

module.exports = mergeConfig(defaultConfig, config);

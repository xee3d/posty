const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // 에러 스택 트레이스 개선
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    // 빌드 디렉토리 제외
    blockList: [
      /node_modules\/.*\/android\/build\/.*/,
      /android\/build\/.*/,
      /\.gradle\/.*/,
    ],
  },
  server: {
    // 더 자세한 로그 출력
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
  // 빌드 폴더 무시
  watchOptions: {
    ignored: [
      '**/android/build/**',
      '**/android/.gradle/**',
      '**/node_modules/**/android/build/**',
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      // Terser 옵션으로 번들 크기 최적화
      keep_fnames: false,
      mangle: {
        keep_fnames: false,
      },
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
      },
      output: {
        comments: false, // 주석 제거
        ascii_only: true,
      },
    },
  },
  resolver: {
    // 에러 스택 트레이스 개선
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    // 빌드 디렉토리 제외
    blockList: [
      /node_modules\/.*\/android\/build\/.*/,
      /android\/build\/.*/,
      /android\/app\/build\/.*/,
      /\.gradle\/.*/,
      /\.git\/.*/,
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
  // File watcher 설정
  watchman: {
    // 빌드 폴더 무시
    ignore: [
      path.resolve(__dirname, 'android', 'build'),
      path.resolve(__dirname, 'android', 'app', 'build'),
      path.resolve(__dirname, 'android', '.gradle'),
      path.resolve(__dirname, 'node_modules', '**', 'android', 'build'),
      '**/android/build/**',
      '**/android/app/build/**',
      '**/android/.gradle/**',
      '**/node_modules/**/android/build/**',
    ],
  },
  // File watcher 설정
  watcher: {
    // Watchman 대신 Node watcher 사용 (더 안정적)
    useWatchman: false,
    // 파일 변경 감지 지연 시간
    crawlDelay: 300,
    // 빌드 폴더 무시
    ignore: [
      '**/android/build/**',
      '**/android/app/build/**',
      '**/android/.gradle/**',
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);
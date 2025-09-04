import "react-native-gesture-handler/jestSetup";

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-device-info", () => {
  return {
    getVersion: jest.fn(() => "1.0.0"),
    getBuildNumber: jest.fn(() => "1"),
    getUniqueId: jest.fn(() => "unique-id"),
  };
});

global.__reanimatedWorkletInit = jest.fn();

// React Navigation 모킹
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// React Native Vector Icons 모킹
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// AI 서비스 모킹
jest.mock('./src/services/openaiService', () => ({
  generateContent: jest.fn(() => Promise.resolve({
    content: '테스트 생성된 콘텐츠',
    success: true,
  })),
  validateApiKey: jest.fn(() => Promise.resolve(true)),
}));

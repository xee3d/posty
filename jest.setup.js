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

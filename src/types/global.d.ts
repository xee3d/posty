// Global type declarations for React Native environment

declare global {
  namespace NodeJS {
    interface Timeout {}
    interface Timer {}
  }

  // React Native timer types
  interface Timer {
    id?: number;
  }

  // Process object for React Native
  var process: {
    env: Record<string, string | undefined>;
  };

  // setTimeout, clearTimeout, setInterval, clearInterval return types
  function setTimeout(handler: () => void, timeout?: number): NodeJS.Timeout;
  function clearTimeout(handle?: NodeJS.Timeout): void;
  function setInterval(handler: () => void, timeout?: number): NodeJS.Timer;
  function clearInterval(handle?: NodeJS.Timer): void;
}

export {};
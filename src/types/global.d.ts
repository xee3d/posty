// Global type declarations for React Native environment

import React from 'react';
import { SafeIconProps } from '../utils/SafeIcon';
import { IconProps } from 'react-native-vector-icons/Icon';

declare global {
  var SafeIcon: React.FC<SafeIconProps>;
  var Icon: React.FC<IconProps>;
  
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

// Environment variables module declaration
declare module '@env' {
  export const API_URL: string;
  export const JWT_SECRET: string;
  export const OPENAI_API_KEY: string;
  export const OPENROUTER_API_KEY: string;
  export const NEWS_API_KEY: string;
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const NAVER_CONSUMER_KEY: string;
  export const NAVER_CONSUMER_SECRET: string;
  export const KAKAO_APP_KEY: string;
  export const FACEBOOK_APP_ID: string;
  export const FACEBOOK_APP_SECRET: string;
  export const FACEBOOK_CLIENT_TOKEN: string;
  export const ONESIGNAL_APP_ID: string;
  export const ONESIGNAL_REST_API_KEY: string;
  export const CRON_SECRET: string;
  export const NODE_ENV: string;
  export const ENVIRONMENT: string;
  export const DEBUG_MODE: string;
  export const LOG_LEVEL: string;
  export const APP_VERSION: string;
  export const VERCEL_URL: string;
  export const NOTION_API_KEY: string;
}

export {};
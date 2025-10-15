declare module "@env" {
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const NAVER_CONSUMER_KEY: string;
  export const NAVER_CONSUMER_SECRET: string;
  export const KAKAO_APP_KEY: string;

  export const API_URL: string;
  export const IOS_SHARED_SECRET: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      POSTY_APP_SECRET?: string;
      JWT_SECRET?: string;
      NEWS_API_KEY?: string;
      OPENAI_API_KEY?: string;
    }
    
    interface Global {
      NodeJS: any;
    }
  }
  
  declare const Buffer: any;
  declare const performance: any;
  declare const jest: any;
  
  interface Product {
    identifier: string;
    price: string;
    currency: string;
    title: string;
    description: string;
  }
  
  interface Purchase {
    productIdentifier: string;
    transactionId: string;
    purchaseToken: string;
    purchaseState: number;
  }
  
  interface PurchaseError {
    code: string;
    message: string;
  }
}

export {};

# 📊 Firestore 데이터 모델 설계

## 1. 컬렉션 구조

### 👤 users (사용자 정보)
```typescript
interface User {
  // 기본 정보
  uid: string;                    // Firebase Auth UID
  email: string;                  // 이메일
  displayName: string;            // 표시 이름
  photoURL?: string;              // 프로필 사진
  provider: 'google' | 'apple';   // 로그인 제공자
  
  // 계정 정보
  createdAt: Timestamp;           // 가입일
  lastLoginAt: Timestamp;         // 마지막 로그인
  isActive: boolean;              // 활성 상태
  
  // 구독 정보
  subscription: {
    plan: 'free' | 'basic' | 'premium';  // 구독 플랜
    status: 'active' | 'expired' | 'cancelled';
    startedAt?: Timestamp;        // 구독 시작일
    expiresAt?: Timestamp;        // 구독 만료일
    autoRenew: boolean;           // 자동 갱신 여부
  };
  
  // 토큰 정보
  tokens: {
    current: number;              // 현재 토큰
    total: number;                // 총 사용 토큰
    lastUpdated: Timestamp;       // 마지막 업데이트
  };
  
  // 설정
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: string;             // ko, en, ja
    notifications: boolean;
    soundEnabled: boolean;
  };
}
```

### 📝 posts (생성된 콘텐츠)
```typescript
interface Post {
  // 기본 정보
  id: string;                     // 문서 ID
  userId: string;                 // 작성자 UID
  
  // 콘텐츠
  content: string;                // 생성된 내용
  originalPrompt: string;         // 원본 프롬프트
  
  // 메타데이터
  platform: 'instagram' | 'facebook' | 'twitter' | 'general';
  tone: string;                   // casual, professional, etc.
  length: 'short' | 'medium' | 'long';
  style?: string;                 // minimalist, storyteller, etc.
  
  // 분석 데이터
  hashtags: string[];             // 해시태그 목록
  category: string;               // 카테고리
  
  // 이미지 (있는 경우)
  imageUrl?: string;              // 분석한 이미지 URL
  imageAnalysis?: string;         // 이미지 분석 결과
  
  // 타임스탬프
  createdAt: Timestamp;           // 생성일
  updatedAt?: Timestamp;          // 수정일
  
  // 통계 (선택사항)
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    reach?: number;
  };
  
  // 상태
  status: 'draft' | 'published' | 'deleted';
  publishedAt?: Timestamp;        // 게시일
}
```

### 📊 analytics (사용자 분석)
```typescript
interface UserAnalytics {
  userId: string;                 // 사용자 UID
  
  // 전체 통계
  stats: {
    totalPosts: number;           // 총 게시물 수
    totalTokensUsed: number;      // 총 사용 토큰
    favoriteTime: string;         // 선호 작성 시간
    averageLength: number;        // 평균 글 길이
  };
  
  // 카테고리별 통계
  byCategory: {
    [category: string]: number;   // 카테고리별 게시물 수
  };
  
  // 톤별 통계
  byTone: {
    [tone: string]: number;       // 톤별 게시물 수
  };
  
  // 플랫폼별 통계
  byPlatform: {
    [platform: string]: number;   // 플랫폼별 게시물 수
  };
  
  // 스타일 분석
  styleAnalysis: {
    dominantStyle: string;        // 주요 스타일
    styleScores: {
      [style: string]: number;    // 스타일별 점수 (0-100)
    };
    consistency: number;          // 일관성 점수
    diversity: number;            // 다양성 점수
  };
  
  // 해시태그 분석
  hashtagAnalysis: {
    topHashtags: string[];        // 자주 사용하는 해시태그
    uniqueHashtags: number;       // 고유 해시태그 수
  };
  
  // 업데이트 정보
  lastUpdated: Timestamp;         // 마지막 분석 업데이트
}
```

### 🎯 missions (미션 진행 상황)
```typescript
interface UserMission {
  userId: string;                 // 사용자 UID
  
  // 일일 미션
  daily: {
    createPost: {
      completed: boolean;
      count: number;              // 오늘 생성한 게시물 수
      target: number;             // 목표 개수
    };
    useStyle: {
      completed: boolean;
      style: string;              // 사용한 스타일
    };
    lastReset: Timestamp;         // 마지막 리셋 시간
  };
  
  // 주간 미션
  weekly: {
    postsCreated: number;         // 이번 주 생성 수
    targetPosts: number;          // 목표 게시물 수
    stylesUsed: string[];         // 사용한 스타일 목록
    weekStartDate: Timestamp;     // 주 시작일
  };
  
  // 업적
  achievements: {
    [achievementId: string]: {
      unlockedAt: Timestamp;      // 달성일
      progress: number;           // 진행도
    };
  };
}
```

### 💰 transactions (토큰 거래 내역)
```typescript
interface Transaction {
  id: string;                     // 거래 ID
  userId: string;                 // 사용자 UID
  
  // 거래 정보
  type: 'earn' | 'spend' | 'purchase' | 'reward';
  amount: number;                 // 토큰 수 (+/-)
  balance: number;                // 거래 후 잔액
  
  // 상세 정보
  description: string;            // 거래 설명
  category: string;               // 카테고리 (mission, ad, subscription, etc.)
  
  // 타임스탬프
  createdAt: Timestamp;           // 거래일시
}
```

## 2. 보안 규칙 (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 데이터만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 게시물은 작성자만 읽기/쓰기 가능
    match /posts/{postId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // 분석 데이터는 본인만 접근 가능
    match /analytics/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // 미션 데이터는 본인만 접근 가능
    match /missions/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // 거래 내역은 본인만 읽기 가능 (쓰기는 서버에서만)
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow write: if false; // 서버에서만 쓰기 가능
    }
  }
}
```

## 3. 인덱스 설정

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "platform", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## 4. 마이그레이션 전략

### Phase 1: 기본 구조 생성
1. users 컬렉션 생성 및 현재 사용자 정보 저장
2. posts 컬렉션 생성 및 새 게시물만 저장

### Phase 2: 기존 데이터 마이그레이션
1. AsyncStorage의 기존 게시물 데이터를 Firestore로 이동
2. 로컬 분석 데이터를 analytics 컬렉션으로 이동

### Phase 3: 실시간 동기화
1. 모든 쓰기 작업을 Firestore로 전환
2. 오프라인 지원을 위한 캐싱 설정

### Phase 4: 고급 기능
1. 거래 내역 추적
2. 미션 시스템 연동
3. 실시간 토큰 동기화

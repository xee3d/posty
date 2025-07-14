# Firebase v22 모듈러 API 마이그레이션 계획

## 📋 개요
React Native Firebase v22.4.0으로 패키지는 업데이트했지만, 코드는 여전히 네임스페이스 API를 사용 중입니다.
다음 메이저 버전에서는 네임스페이스 API가 완전히 제거될 예정이므로, 모듈러 API로 마이그레이션이 필요합니다.

## 🎯 마이그레이션 목표
- 모든 Firebase 코드를 모듈러 API로 전환
- 트리 셰이킹을 통한 번들 크기 최적화
- 타입 안전성 향상
- 미래 버전 호환성 확보

## 📝 마이그레이션 단계

### Phase 1: Core Services (우선순위: 높음) ✅ 완료 (2025-07-14)
- [x] `src/services/firebase/index.ts` - 핵심 Firebase 서비스
  - [x] Auth 관련 함수들 마이그레이션
  - [x] Firestore 관련 함수들 마이그레이션
  - [x] 초기화 로직 업데이트
  - [x] 타입 정의 개선
  - [x] 테스트 파일 생성 (`migrationTest.ts`)
  - [x] 백업 파일 생성 (`index.namespace.ts`)

### Phase 2: Screen Components (우선순위: 중간) ✅ 완료 (2025-07-14)
- [x] `src/screens/FirebaseAuthTest.tsx` - 모듈러 API로 전환
- [x] `src/screens/FirebaseTestScreen.tsx` - firestoreService 통해 간접 사용
- [x] `src/services/firebase/firestoreService.ts` - 모듈러 API로 전환
- [ ] 기타 Firebase를 사용하는 화면 컴포넌트

### Phase 3: Feature Modules (우선순위: 낮음)
- [ ] Redux 스토어의 Firebase 관련 로직
- [ ] 유틸리티 함수들
- [ ] 기타 Firebase 의존성이 있는 모듈

## 🔄 마이그레이션 예시

### Authentication
```typescript
// 이전 (네임스페이스)
import auth from '@react-native-firebase/auth';
await auth().signInWithEmailAndPassword(email, password);

// 이후 (모듈러)
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
const auth = getAuth();
await signInWithEmailAndPassword(auth, email, password);
```

### Firestore
```typescript
// 이전 (네임스페이스)
import firestore from '@react-native-firebase/firestore';
await firestore().collection('users').doc(uid).get();

// 이후 (모듈러)
import { getFirestore, collection, doc, getDoc } from '@react-native-firebase/firestore';
const db = getFirestore();
const usersRef = collection(db, 'users');
const userDoc = doc(usersRef, uid);
await getDoc(userDoc);
```

## ⚠️ 주의사항
1. 마이그레이션은 점진적으로 진행 (한 번에 모든 코드 변경 X)
2. 각 단계마다 충분한 테스트 수행
3. deprecation 경고 메시지 모니터링
4. 타입 정의 파일 업데이트 필요할 수 있음

## 📅 예상 일정
- Phase 1: 1-2일
- Phase 2: 2-3일
- Phase 3: 1-2일
- 전체 테스트 및 검증: 1-2일

총 예상 기간: 1-2주

## 📚 참고 자료
- [React Native Firebase v22 마이그레이션 가이드](https://rnfirebase.io/migrating-to-v22)
- [Firebase Modular SDK 문서](https://firebase.google.com/docs/web/modular-upgrade)
- [React Native Firebase API Reference](https://rnfirebase.io/reference)

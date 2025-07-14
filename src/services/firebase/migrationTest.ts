/**
 * Firebase 모듈러 API 마이그레이션 테스트
 * 
 * 이 파일은 네임스페이스 API와 모듈러 API의 차이점을 보여주고
 * 마이그레이션이 올바르게 작동하는지 테스트합니다.
 */

import {
  getCurrentUser,
  signInAnonymously,
  signInWithEmail,
  createUserWithEmail,
  signOut,
  subscribeToAuthChanges,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  auth,
  firestore
} from './index';

// 타입 임포트
import type { User } from '@react-native-firebase/auth';

export const runMigrationTests = async () => {
  console.log('🧪 Firebase 모듈러 API 마이그레이션 테스트 시작...\n');

  try {
    // 1. Auth 테스트
    console.log('1️⃣ Authentication 테스트');
    
    // 현재 사용자 확인
    const currentUser = getCurrentUser();
    console.log('현재 사용자:', currentUser ? currentUser.uid : '없음');

    // Auth 상태 리스너 등록
    const unsubscribe = subscribeToAuthChanges((user: User | null) => {
      console.log('Auth 상태 변경:', user ? `로그인됨 (${user.uid})` : '로그아웃됨');
    });

    // 익명 로그인 테스트
    console.log('익명 로그인 시도...');
    const anonymousUser = await signInAnonymously();
    console.log('익명 로그인 성공:', anonymousUser.uid);

    // 2. Firestore 테스트
    console.log('\n2️⃣ Firestore 테스트');
    
    // 문서 생성
    console.log('테스트 문서 생성...');
    const docId = await createDocument('test_collection', {
      name: '테스트 문서',
      description: '모듈러 API 테스트',
      testValue: 123
    });
    console.log('문서 생성 완료:', docId);

    // 문서 읽기
    console.log('문서 읽기...');
    const doc = await getDocument('test_collection', docId);
    console.log('문서 내용:', doc);

    // 문서 업데이트
    console.log('문서 업데이트...');
    await updateDocument('test_collection', docId, {
      testValue: 456,
      updated: true
    });
    console.log('문서 업데이트 완료');

    // 업데이트된 문서 다시 읽기
    const updatedDoc = await getDocument('test_collection', docId);
    console.log('업데이트된 문서:', updatedDoc);

    // 문서 삭제
    console.log('문서 삭제...');
    await deleteDocument('test_collection', docId);
    console.log('문서 삭제 완료');

    // 로그아웃
    console.log('\n로그아웃...');
    await signOut();
    console.log('로그아웃 완료');

    // 리스너 해제
    unsubscribe();

    console.log('\n✅ 모든 테스트 성공!');
    console.log('Firebase 모듈러 API가 정상적으로 작동합니다.');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
};

// 네임스페이스 API와 모듈러 API 비교 예시
export const apiComparison = () => {
  console.log(`
📚 네임스페이스 API vs 모듈러 API 비교

1. Authentication
   네임스페이스: auth().signInAnonymously()
   모듈러: signInAnonymously(auth)

2. Firestore
   네임스페이스: firestore().collection('users').doc('123').get()
   모듈러: getDoc(doc(firestore, 'users', '123'))

3. 장점
   - 트리 셰이킹으로 번들 크기 감소
   - 더 나은 타입 지원
   - Firebase JS SDK와 일관된 API
   - 향후 버전 호환성 보장
  `);
};
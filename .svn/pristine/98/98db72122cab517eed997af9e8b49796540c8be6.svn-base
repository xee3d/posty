import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase 초기화는 @react-native-firebase가 자동으로 처리
// google-services.json 파일이 올바르게 설정되어 있으면 추가 설정 불필요

// Firestore 설정 (선택사항)
firestore().settings({
  persistence: true, // 오프라인 지원
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED, // 캐시 크기 무제한
});

// 개발 환경에서 에뮬레이터 사용 (선택사항)
if (__DEV__) {
  // Firestore 에뮬레이터 연결 (필요시)
  // firestore().useEmulator('localhost', 8080);
  
  // Auth 에뮬레이터 연결 (필요시)
  // auth().useEmulator('http://localhost:9099');
}

export { auth, firestore };

// 유틸리티 함수들
export const getCurrentUser = () => auth().currentUser;

export const signInAnonymously = async () => {
  try {
    const userCredential = await auth().signInAnonymously();
    return userCredential.user;
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

export const createUserWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Firestore 헬퍼 함수
export const createDocument = async (collection: string, data: any, docId?: string) => {
  try {
    if (docId) {
      await firestore().collection(collection).doc(docId).set(data);
      return docId;
    } else {
      const docRef = await firestore().collection(collection).add(data);
      return docRef.id;
    }
  } catch (error) {
    console.error('Create document error:', error);
    throw error;
  }
};

export const getDocument = async (collection: string, docId: string) => {
  try {
    const doc = await firestore().collection(collection).doc(docId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Get document error:', error);
    throw error;
  }
};

export const updateDocument = async (collection: string, docId: string, data: any) => {
  try {
    await firestore().collection(collection).doc(docId).update(data);
  } catch (error) {
    console.error('Update document error:', error);
    throw error;
  }
};

export const deleteDocument = async (collection: string, docId: string) => {
  try {
    await firestore().collection(collection).doc(docId).delete();
  } catch (error) {
    console.error('Delete document error:', error);
    throw error;
  }
};
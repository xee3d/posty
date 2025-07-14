// Firebase Modular API로 마이그레이션 완료
import { initializeApp, getApp } from '@react-native-firebase/app';
import { 
  getAuth, 
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from '@react-native-firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  DocumentReference,
  CollectionReference,
  Firestore,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from '@react-native-firebase/firestore';

// Firebase 인스턴스 가져오기
let app;
try {
  app = getApp();
} catch (error) {
  // 앱이 초기화되지 않은 경우 기본 앱 사용
  app = initializeApp();
}

// Auth와 Firestore 인스턴스
const auth = getAuth(app);
const firestore = getFirestore(app);

// Firestore 설정 (캐시 설정은 모듈러 API에서 자동 처리됨)
// 개발 환경에서 에뮬레이터 사용 (선택사항)
if (__DEV__) {
  // Firestore 에뮬레이터 연결 (필요시 주석 해제)
  // connectFirestoreEmulator(firestore, 'localhost', 8080);
  
  // Auth 에뮬레이터 연결 (필요시 주석 해제)
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

// 타입 정의
export type { User } from '@react-native-firebase/auth';
export type { DocumentData, DocumentSnapshot, QuerySnapshot } from '@react-native-firebase/firestore';

// Auth 유틸리티 함수들
export const getCurrentUser = (): User | null => auth.currentUser;

export const signInAnonymously = async (): Promise<User> => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

export const createUserWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Auth 상태 관찰자
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore 헬퍼 함수
export const createDocument = async (collectionName: string, data: any, docId?: string): Promise<string> => {
  try {
    const collectionRef = collection(firestore, collectionName);
    
    if (docId) {
      const docRef = doc(collectionRef, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docId;
    } else {
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Create document error:', error);
    throw error;
  }
};

export const getDocument = async (collectionName: string, docId: string): Promise<any> => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Get document error:', error);
    throw error;
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any): Promise<void> => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Update document error:', error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Delete document error:', error);
    throw error;
  }
};

// 컬렉션 참조 가져오기 (다른 곳에서 쿼리 작성용)
export const getCollectionRef = (collectionName: string): CollectionReference => {
  return collection(firestore, collectionName);
};

// 문서 참조 가져오기
export const getDocRef = (collectionName: string, docId: string): DocumentReference => {
  return doc(firestore, collectionName, docId);
};

// 네트워크 연결 관리
export const goOnline = async (): Promise<void> => {
  await enableNetwork(firestore);
};

export const goOffline = async (): Promise<void> => {
  await disableNetwork(firestore);
};

// 인스턴스 export (직접 사용이 필요한 경우를 위해)
export { auth, firestore };

// 추가 유틸리티 export
export { serverTimestamp } from '@react-native-firebase/firestore';
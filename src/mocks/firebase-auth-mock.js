// Firebase Auth Mock for iOS build
// This is a temporary mock while Firebase Native SDK integration is in progress

const mockAuthUser = null;

const mockAuth = () => ({
  currentUser: mockAuthUser,
  signInWithCredential: async (credential) => ({
    user: mockAuthUser,
    credential,
  }),
  signInWithCustomToken: async (token) => ({
    user: mockAuthUser,
    token,
  }),
  signOut: async () => {
    console.log('Firebase Auth Mock: signOut called');
  },
  onAuthStateChanged: (callback) => {
    console.log('Firebase Auth Mock: onAuthStateChanged called');
    callback(mockAuthUser);
    return () => {}; // unsubscribe function
  },
});

// Mock for GoogleAuthProvider
mockAuth.GoogleAuthProvider = {
  credential: (idToken, accessToken) => ({
    idToken,
    accessToken,
    providerId: 'google.com',
  }),
};

export default mockAuth;
// Firebase Firestore Mock for iOS build
// This is a temporary mock while Firebase Native SDK integration is in progress

const mockFirestore = () => ({
  collection: (path) => ({
    doc: (id) => ({
      get: async () => ({
        exists: false,
        data: () => null,
      }),
      set: async (data) => {
        console.log('Firestore Mock: set called', { path, id, data });
      },
      update: async (data) => {
        console.log('Firestore Mock: update called', { path, id, data });
      },
      delete: async () => {
        console.log('Firestore Mock: delete called', { path, id });
      },
      onSnapshot: (callback) => {
        console.log('Firestore Mock: onSnapshot called', { path, id });
        callback({
          exists: false,
          data: () => null,
        });
        return () => {}; // unsubscribe
      },
    }),
    where: () => ({
      orderBy: () => ({
        limit: () => ({
          get: async () => ({
            docs: [],
            empty: true,
          }),
          onSnapshot: (callback) => {
            console.log('Firestore Mock: query onSnapshot called');
            callback({
              docs: [],
              empty: true,
            });
            return () => {}; // unsubscribe
          },
        }),
      }),
    }),
    add: async (data) => {
      console.log('Firestore Mock: add called', { path, data });
      return { id: 'mock-doc-id' };
    },
  }),
});

// Export the getFirestore function that the app expects
export const getFirestore = (app) => {
  console.log('Firestore Mock: getFirestore called with app:', app);
  return mockFirestore();
};

export default mockFirestore;
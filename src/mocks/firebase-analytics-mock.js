// Firebase Analytics Mock for iOS build
// This is a temporary mock while Firebase Native SDK integration is in progress

const mockAnalytics = () => ({
  logEvent: async (eventName, parameters) => {
    console.log('Analytics Mock: logEvent called', { eventName, parameters });
  },
  setUserId: async (userId) => {
    console.log('Analytics Mock: setUserId called', { userId });
  },
  setUserProperties: async (properties) => {
    console.log('Analytics Mock: setUserProperties called', { properties });
  },
  setAnalyticsCollectionEnabled: async (enabled) => {
    console.log('Analytics Mock: setAnalyticsCollectionEnabled called', { enabled });
  },
  logScreenView: async (screenName, screenClass) => {
    console.log('Analytics Mock: logScreenView called', { screenName, screenClass });
  },
});

export default mockAnalytics;
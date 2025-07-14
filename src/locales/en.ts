export default {
  // Common
  app: {
    name: 'Posty',
    tagline: 'Creative content powered by AI'
  },
  
  // AI Write Screen
  aiWrite: {
    title: 'Write with Posty',
    subtitle: {
      text: 'What story shall we write? I\'ll help you!',
      polish: 'I\'ll polish your text to make it shine!',
      photo: 'Show me a photo and I\'ll create matching content!'
    },
    modes: {
      text: 'New Post',
      polish: 'Polish Text',
      photo: 'Photo Caption'
    },
    prompts: {
      text: 'What would you like to write about?',
      polish: 'Enter the text you\'d like to polish',
      photo: 'Select a photo!'
    },
    tones: {
      casual: 'Casual',
      professional: 'Professional',
      humorous: 'Humorous',
      emotional: 'Emotional',
      genz: 'Gen Z',
      millennial: 'Millennial',
      minimalist: 'Minimalist',
      storytelling: 'Storytelling',
      motivational: 'Motivational'
    },
    lengths: {
      short: 'Short',
      medium: 'Medium',
      long: 'Long'
    },
    buttons: {
      generate: 'Ask Posty',
      generating: 'Posty is writing...',
      copy: 'Copy',
      save: 'Save',
      share: 'Share'
    },
    alerts: {
      noPrompt: 'Tell me what to write about! 🤔',
      noPhoto: 'Please select a photo first! 📸',
      success: 'Done! Here you go 🎉',
      error: 'Oops! Something went wrong. Please try again 🥺'
    }
  },
  
  // Token System
  tokens: {
    badge: 'Tokens',
    noTokens: 'No tokens left',
    earnTokens: 'Earn free tokens',
    subscribe: 'No tokens left. Subscribe?'
  },
  
  // Tab Navigation
  tabs: {
    home: 'Home',
    aiWrite: 'AI Write',
    myStyle: 'My Style',
    settings: 'Settings'
  }
};

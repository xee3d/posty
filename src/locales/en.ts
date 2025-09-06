export default {
  // Common
  app: {
    name: "Posty",
    tagline: "Creative content powered by AI",
    slogan: "AI writes, I shine",
    subTagline: "Perfect posting completed in 1 minute",
    description: "Complete amazing posts with just one photo",
    slogan1: "Share your story\nwith the world.",
    slogan2: "A simple line becomes\na special moment.",
    slogan3: "Posty will help you.\nBetter writing.",
    slogan4: "Shall we start?",
  },

  // Navigation
  navigation: {
    home: "Home",
    write: "Write",
    trend: "Trend",
    myStyle: "My Style",
    settings: "Settings",
  },

  // AI Write Screen
  aiWrite: {
    title: "Write with Posty",
    subtitle: {
      text: "What story shall we write? I'll help you!",
      polish: "I'll polish your text to make it shine!",
      photo: "Show me a photo and I'll create matching content!",
    },
    errors: {
      imageSelection: "An error occurred while selecting an image.",
      cameraAccess: "An error occurred while using the camera."
    },
    modes: {
      text: "New Post",
      polish: "Polish Text",
      photo: "Photo Caption",
    },
    prompts: {
      text: "What would you like to write about?",
      polish: "Enter the text you'd like to polish",
      photo: "Select a photo!",
    },
    prompt: {
      title: "What would you like to write about?",
      refresh: "Refresh",
      trendUpdate: {
        title: "Trend Update",
        message: "Latest trends have been loaded!"
      }
    },
    tones: {
      casual: "Casual",
      professional: "Professional",
      humorous: "Humorous",
      emotional: "Emotional",
      genz: "Gen Z",
      millennial: "Millennial",
      minimalist: "Minimalist",
      storytelling: "Storytelling",
      motivational: "Motivational",
    },
    lengths: {
      short: "Short",
      medium: "Medium",
      long: "Long",
    },
    buttons: {
      generate: "Ask Posty",
      generating: "Posty is writing...",
      copy: "Copy",
      save: "Save",
      share: "Share",
    },
    photo: {
      select: {
        title: "Select Photo",
        message: "How would you like to select a photo?",
        camera: "Take with Camera",
        gallery: "Choose from Gallery",
      }
    },
    alerts: {
      noPrompt: "Tell me what to write about! 🤔",
      noPhoto: "Please select a photo first! 📸",
      success: "Done! Here you go 🎉",
      error: "Oops! Something went wrong. Please try again 🥺",
      waitAnalysis: "Please wait for photo analysis to complete.",
      completeAnalysis: "Please complete photo analysis first.",
      imageTooBig: {
        title: "Notice",
        message: "Image is too large. Please select a smaller image.",
        analysisResult: "Image is too large."
      }
    },
    keywords: {
      morning: ["morning routine", "cafe", "commute", "breakfast", "coffee", "exercise"],
      afternoon: ["lunch", "daily life", "afternoon", "break", "walk", "cafe"],
      evening: ["evening", "workout", "hobby", "rest", "restaurant"],
      night: ["late snack", "netflix", "rest", "daily life", "hobby", "dawn"]
    },
    descriptions: {
      short: "~50 chars",
      medium: "~150 chars",
      long: "~300 chars"
    },
    example: "e.g.",
    analysis: {
      analyzing: "Analyzing image...",
      failed: "Photo analysis failed. Please try again.",
      error: "An error occurred during photo analysis.",
      fallback: {
        description: "Great photo! What story would you like to tell?",
        suggestedContent: ["today's photo", "daily record", "special moment"]
      }
    },
    sections: {
      quickTopic: "Quick Topics",
      selectTone: "What tone would you like?",
      selectLength: "How long should it be?",
      selectedHashtags: "Selected Hashtags",
      polishOptions: "Polish Options",
      photoSelect: "Show me a photo!",
      photoAnalyzing: "Analyzing photo...",
      resultTitle: "Done! 🎉",
    },
    polishOptions: {
      summarize: "Summarize",
      simple: "Simplify", 
      formal: "Make Formal",
      emotion: "Add Emotion",
      storytelling: "Storytelling",
      engaging: "Make Engaging",
      hashtag: "Extract Hashtags",
      emoji: "Add Emojis",
      question: "Make Questions",
    },
    photo: {
      select: {
        title: "Select Photo",
        message: "How would you like to select a photo?",
        camera: "Take Photo",
        gallery: "Choose from Gallery",
      },
      upload: {
        title: "Please select a photo",
        subtitle: "Choose from gallery or take a new one",
        button: "Select Photo",
        change: "Change",
      }
    },
  },

  // Token System
  tokens: {
    badge: "Tokens",
    noTokens: "No tokens left",
    earnTokens: "Earn free tokens", 
    subscribe: "No tokens left. Subscribe?",
    descriptions: {
      dailyFree: "Daily free token charge",
    },
  },

  // Tab Navigation
  tabs: {
    home: "Home",
    aiWrite: "AI Write",
    trend: "Trend",
    myStyle: "My Style",
    settings: "Settings",
  },

  // Debug/Developer Screen
  debug: {
    title: "Data Management",
    toolsTitle: "Debug Tools",
    buttons: {
      showKeys: "View Stored Keys",
      clearCurrentUser: "Clear Current User Data",
      clearAllData: "Clear All User Data",
    },
    alerts: {
      clearAll: {
        title: "Delete All Data",
        message: "Are you sure you want to delete all user data? This action cannot be undone.",
        cancel: "Cancel",
        delete: "Delete",
        success: {
          title: "Complete",
          message: "All data has been deleted.",
        },
        error: {
          title: "Error",
          message: "An error occurred while deleting data.",
        },
      },
      clearCurrentUser: {
        title: "Delete Current User Data",
        message: "Do you want to delete only the current logged-in user's data?",
        success: {
          title: "Complete",
          message: "Current user's achievement data has been deleted.",
        },
      },
      storageKeys: {
        title: "Stored Keys List",
        noKeys: "No related keys found.",
        confirm: "OK",
      },
    },
    warnings: {
      destructive: "⚠️ Warning: Data deletion cannot be undone!",
      devOnly: "This screen should only be used for development/debugging purposes.",
    },
  },

  // SNS Connection Screen
  sns: {
    title: "SNS Connection Management",
    description: "Connect your SNS accounts to automatically track likes, comments, and other performance metrics!",
    sections: {
      accounts: "SNS Account Connection",
      sync: "Data Sync",
      notes: "Notes",
    },
    status: {
      connected: "Connected",
      disconnected: "Not Connected",
    },
    buttons: {
      connect: "Connect",
      disconnect: "Disconnect",
      sync: "Sync",
    },
    features: {
      instagram: {
        likes: "Auto-update like count",
        comments: "Auto-update comment count",
        insights: "Check reach and saves",
      },
      facebook: {
        insights: "Page post insights",
        engagement: "Reactions, comments, shares",
        reach: "Reach and engagement stats",
      },
    },
    sync: {
      title: "Performance Data Sync",
      description: "Fetch latest data from connected SNS accounts",
      lastSync: "Last sync: {time}",
    },
    alerts: {
      connect: {
        title: "{platform} Connection",
        message: "Connection feature requires app setup.\n\nRequired:\n1. Facebook Developer Account\n2. App Registration & Review\n3. OAuth Configuration\n\nPlease refer to the setup guide for details.",
        cancel: "Cancel",
        guide: "View Guide",
      },
      disconnect: {
        title: "Disconnect",
        message: "Do you want to disconnect {platform} connection?",
        cancel: "Cancel",
        disconnect: "Disconnect",
      },
      sync: {
        success: {
          title: "Sync Complete",
          message: "SNS data has been successfully updated.",
        },
        error: {
          title: "Sync Failed",
          message: "There was a problem fetching data.",
        },
        confirm: "OK",
      },
    },
    notes: [
      "Instagram Business or Creator account required",
      "Facebook can only connect Page accounts",
      "Some data may be delayed due to API limitations",
    ],
  },

  // User Profile & Tones
  userProfile: {
    ageGroups: {
      "10s": {
        default: "Energetic and vibrant",
        baby_photo: "So cute!! Such an angel baby ㅠㅠ",
      },
      "20s": {
        default: "Trendy and casual",
        baby_photo: "Baby is so adorable 🥺 heart melting",
      },
      "30s": {
        default: "Comfortable and empathetic",
        baby_photo: "Such a lovely little one. Hope they grow up healthy",
      },
      "40s": {
        default: "Sincere and warm",
        baby_photo: "The child looks so blessed. Parents must be happy",
      },
      "50s": {
        default: "Mature and wise",
        baby_photo: "Such a beautiful baby. Seems like a blessed family",
        },
        "60s+": {
          default: "Experienced and warm",
          baby_photo: "What a blessing. Hope they grow up healthy",
        },
      },
      familyRoles: {
        mother: "With a loving mother's heart",
        father: "With a proud father's heart", 
        grandparent: "With warm grandparent's heart looking at grandchild",
      },
    },
    interests: [
      "Travel", "Food", "Cafe", "Cooking", "Baking", "Exercise", "Fitness", "Yoga", "Running", "Hiking",
      "Parenting", "Education", "Reading", "Movies", "Drama", "Music", "Concert", "Exhibition", "Photography", "Art",
      "Fashion", "Beauty", "Interior", "Gardening", "Pets", "Gaming", "IT", "Stocks", "Real Estate", "Self Development"
    ],
    completion: {
      low: "Set up your profile to experience personalized AI writing ✨",
      medium: "Just a little more! AI can understand your style more accurately 🎯",
      high: "Almost done! You'll soon meet personalized AI writing service 🚀",
    },
  },

  // Login Screen
  login: {
    title: "Easy Login",
    moreOptions: "Connect with other account",
    buttons: {
      naver: "Start with Naver",
      google: "Start with Google",
      kakao: "Start with Kakao",
      facebook: "Start with Facebook",
      apple: "Start with Apple",
    },
    errors: {
      title: "Login Failed",
      default: "Login failed. Please try again.",
      serverAuth: "Server authentication in progress. Please try again later.",
      existingAccount: "Account already registered with different method.",
      cancelled: "Login was cancelled.",
      timeout: "Login timeout. Please try again.",
      bundleId: "Please check Bundle ID settings in Kakao Developer Console.\nCurrent Bundle ID: com.posty",
      kakaoSetup: "Kakao login failed\n1. Check Bundle ID in Kakao Developer Console\n2. Check KakaoTalk app installation",
      naverSetup: "Naver login failed\n1. Check Bundle ID in Naver Developer Center\n2. Check URL scheme settings",
    },
  },

  // Subscription Plans
  subscription: {
    watchVideo: "Watch Video",
    alreadyCheckedIn: "You've already checked in today!",
    alreadyShared: "You've already shared on SNS today!",
    alreadyRated: "You've already rated the app. Thank you!",
    title: "Subscription Plan",
    tokenPurchase: "Token Purchase", 
    freeTokens: "Free Tokens",
    popular: "Popular",
    perMonth: "/month",
    hero: {
      title: "Create more content\nwith Posty",
      subtitle: "AI becomes your creative partner",
    },
    benefits: {
      title: "Premium Benefits",
      moreTokens: {
        title: "More Tokens",
        description: "STARTER provides 600 tokens total (300 initial + 10x30 daily), PRO provides 1,100 tokens total (500 initial + 20x30 daily), MAX provides unlimited tokens"
      },
      advancedAI: {
        title: "Advanced AI Models",
        description: "Differentiated AI models by plan (GPT-4o, GPT-4 Turbo)"
      },
      noAds: {
        title: "Ad-Free",
        description: "Focus on content creation without interruptions"
      }
    },
    management: {
      title: "Subscription Management",
      currentPlan: "Current Plan",
      monthlyFee: "Monthly Fee",
      nextBilling: "Next Billing Date",
      daysRemaining: "{{days}} days remaining",
      activeUntil: "Even after cancellation, you can continue using the current plan until {{date}}.",
      canceledUntil: "Your subscription has been canceled and will expire on {{date}}.",
      cancelButton: "Cancel Subscription"
    },
    earnTokensSection: {
      title: "Earn Free Tokens",
      subtitle: "Get free tokens through various activities",
      currentTokens: "You currently have {{tokens}} tokens",
      watchAd: {
        title: "Watch Ads",
        description: "+2 tokens ({{remaining}}/{{limit}} remaining)"
      },
      dailyCheckin: {
        title: "Daily Check-in",
        description: "+1 token (available today)"
      },
      socialShare: {
        title: "Social Share",
        description: "+3 tokens (1/1 remaining)"
      },
      inviteFriend: {
        title: "Invite Friends",
        description: "+5 tokens (per friend)"
      },
      rateApp: {
        title: "Rate App",
        description: "+10 tokens (one time)"
      },
      dailyMission: {
        title: "Complete Mission",
        description: "+3 tokens (daily mission)"
      },
      autoRefill: "Free plan users get 10 tokens automatically recharged every day at midnight"
    },
    earnTokens: "Tokens Earned! 🎉",
    earnTokensMessage: "You received {{tokens}} tokens!",
    watchAd: "Watch Ad",
    watchAdMessage: "Watch a 30-second ad to get 2 tokens?",
    inviteFriends: "Invite Sent",
    inviteFriendsMessage: "You'll get 5 tokens when your friend signs up!",
    cancelSubscription: "Cancel Subscription",
    cancelSubscriptionMessage: "Are you sure you want to cancel your {{planName}} plan subscription?\n\nYou can continue using the current plan until the next billing date even after cancellation.",
    cancelSubscriptionAction: "Cancel Subscription",
    cancelSubscriptionSuccess: "Subscription Canceled",
    cancelSubscriptionSuccessMessage: "Your subscription has been canceled. You can continue using the current plan until the next billing date.",
    cancelSubscriptionFailed: "Subscription Cancellation Failed",
    cancelSubscriptionFailedMessage: "There was an issue canceling your subscription. Please try again.",
    confirmSubscription: "Confirm Subscription",
    confirmSubscriptionAction: "Subscribe",
    subscriptionFailed: "Subscription Failed",
    subscriptionFailedMessage: "There was an issue processing your subscription. Please try again.",
    downgradeNotAllowed: "Downgrade Not Allowed",
    downgradeNotAllowedMessage: "You cannot change to a lower plan.\n\nPlease cancel your current subscription and sign up for a new one after expiration.",
    // Additional translation keys
    alerts: {
      adWatch: {
        unavailable: "Ad Watch Unavailable",
        defaultMessage: "Please try again later."
      },
      mission: {
        complete: "Mission Complete! 🎯",
        failed: "Ad Watch Failed"
      },
      rating: {
        title: "Rate App",
        message: "Has Posty been helpful? Please leave a review!",
        cancel: "Cancel",
        rate: "Rate Now",
        error: "Cannot open store."
      },
      share: {
        invitation: {
          title: "Invite to Posty",
          message: "AI-powered SNS content creation with Posty! Try it now 🚀\nhttps://posty.app"
        }
      }
    },
    status: {
      free: "Free",
      unlimited: "Unlimited",
      currentPlan: "Current Plan",
      cannotPurchase: "Cannot Purchase",
      subscribeAction: "Subscribe",
      autoRenewActive: "Auto-renewal Active",
      autoRenewCanceled: "Auto-renewal Canceled"
    },
    descriptions: {
      signup300: "You will receive 300 tokens immediately upon signup",
      signup500: "You will receive 500 tokens immediately upon signup",
      unlimitedAccess: "You can use unlimited tokens",
      upgrade500: "You will receive an additional 500 tokens in total",
      downgradeWarning: "Warning: Free tokens will be limited to 300"
    },
    membershipNotices: {
      free: "Free members get 10 tokens automatically recharged daily",
      starter: "STARTER members get 300 on signup + 10 additional tokens daily",
      premium: "PRO members get 500 on signup + 20 additional tokens daily", 
      pro: "MAX members can use unlimited tokens"
    },
    planDescriptions: {
      free: "10 free tokens daily",
      starter: "300 on signup + 10 daily", 
      premium: "500 on signup + 20 daily",
      pro: "Unlimited tokens",
      downgradeBlocked: "Cannot downgrade to lower plan"
    },
    membershipNotices: {
      free: "Free members get 10 tokens automatically recharged daily",
      starter: "STARTER members get 300 tokens on signup + 10 additional tokens daily",
      premium: "PRO members get 500 tokens on signup + 20 additional tokens daily", 
      pro: "MAX members can use unlimited tokens"
    },
    upgradeDescriptions: {
      starterImmediate: "You'll receive 300 tokens immediately upon signup",
      premiumImmediate: "You'll receive 500 tokens immediately upon signup",
      proImmediate: "You'll have access to unlimited tokens",
      premiumUpgrade: "You'll receive an additional 500 tokens in full",
      proUpgrade: "You'll have access to unlimited tokens",
      starterDowngrade: "Warning: Free tokens will be limited to 300"
    }
  },

  // Home Screen
  home: {
    greeting: "",
    defaultUserName: "friend",
    navigation: {
      subscription: "Subscription"
    },
    welcome: {
      title: "Welcome to Posty!",
      message: "How about writing your first post? I'll help you!",
      action: "Write First Post",
      subMessage: "Start with something simple from your daily life. Posty will turn it into something great!"
    },
    greetings: {
      dawn: {
        title: "{{userName}}, feeling the dawn vibes?",
        message: "Thoughts at this hour are special. Want to record them?",
        action: "Dawn Writing"
      },
      morning: {
        title: "Good morning! {{userName}}",
        message: "What are you posting today? Even a morning coffee photo is great!",
        action: "Morning Share"
      },
      lunch: {
        title: "{{userName}}, had lunch yet?",
        message: "If you had something delicious, you should show it off!",
        action: "Lunch Review"
      },
      afternoon: {
        title: "{{userName}}, let's keep going this afternoon!",
        message: "Even a short post is fine. Let's record this moment of today",
        messageRegular: "You've already written {{postCount}} posts today! Amazing 👍",
        action: "Daily Share"
      },
      evening: {
        title: "{{userName}}, how was your day?",
        message: "How about writing a post to wrap up the day? Even something simple is good",
        action: "Evening Thoughts"
      },
      night: {
        title: "{{userName}}, still awake?",
        message: "Want to record what happened today before you sleep?",
        action: "Night Writing"
      }
    },
    topics: {
      daily: "Daily",
      weekend: "Weekend",
      cafe: "Café",
      food: "Food",
      travel: "Travel",
      exercise: "Exercise",
      bookstagram: "Bookstagram"
    },
    quickTemplates: {
      lunch: ["Today's lunch ✨", "Found a gem!", "This gave me energy"],
      evening: ["Good job today 🌙", "Tomorrow will be better", "Day complete!"]
    },
    sections: {
      newUserQuestion: "Don't know what to write?",
      regularUserQuestion: "What to post today?",
      todayRecommendation: "What to write today?",
      myPosts: "My Posts"
    },
    actions: {
      firstWrite: "Write First Post",
      writeAssist: "Help me write",
      photoStart: "Start with photo",
      polishText: "AI Text Polisher",
      viewAll: "View All",
      copy: "Copy",
      share: "Share"
    },
    messages: {
      writeAssistDesc: "I'll make it great even with just one line",
      polishTextDesc: "I'll polish awkward sentences naturally",
      photoStartDesc: "Just show me a photo and I'll write for you",
      copySuccess: "Copied",
      copySuccessDesc: "Copied to clipboard"
    },
    templates: {
      weather: {
        title: "Weather Talk",
        desc: "Start with today's weather",
        content: "Today's weather is nice so"
      },
      food: {
        title: "Food Review",
        desc: "Something delicious you had today", 
        content: "I had today"
      },
      photo: {
        title: "With Photo",
        desc: "Just need a photo"
      }
    },
    tips: {
      todayTip: "Today's Tip",
      consistentPosting: "Consistent posting is key",
      consistentPostingDesc: "Sharing even small daily stories builds stronger bonds with your followers!"
    },
    recommend: {
      easy: "🔥 Easy",
      easierPhoto: "📸 Even easier",
      easyTitle: "Start with one line",
      easyContent: "No long posts needed!\nJust write what you did today",
      photoTitle: "Just need a photo!",
      photoContent: "Pick a photo and\nI'll write the text!",
      recommended: "Recommended",
      convenient: "Convenient",
      writeButton: "Write",
      photoSelectButton: "Select Photo"
    },
    styleCard: {
      title: "My Writing Style",
      consistency: "Consistency",
      thisWeek: "This Week"
    },
    styleTypes: {
      minimalist: "🎯 Minimalist",
      storyteller: "📖 Storyteller",
      visualist: "📸 Visualist",
      trendsetter: "✨ Trendsetter",
      unique: "🎨 Unique Style"
    },
    mainActions: {
      polishTool: "AI Text Polishing Tool",
      polishDesc: "Polish awkward sentences to make them natural",
      styleGuide: "My Writing Style",
    },
    quickActions: {
      writePost: "Write with Posty",
      analyzePhoto: "Analyze Photo",
    },
    postActions: {
      copy: "Copy",
      share: "Share",
    },
    weeklyCount: {
      thisWeek: "This Week",
      consistency: "Consistency",
    }
  },

  // My Style Screen
  myStyle: {
    profileCompletion: "Profile completion {{completeness}}%",
    interests: "Interests (multiple selection)",
    formality: "Formality",
    emotiveness: "Emotional expression",
    humor: "Humor",
    saveProfile: "Save Profile"
  },

  // Settings
  settings: {
    title: "Settings",
    achievements: "Achievements",
    profileDetails: "Profile Details",
    profileGuideDefault: "Set up your profile",
    tokenManagement: "Token Management",
    appSettings: "App Settings",
    pushNotifications: "Push Notifications",
    soundEffects: "Sound Effects",
    vibration: "Vibration",
    themeAndColors: "Theme & Colors",
    themeDescription: "Theme settings",
    support: "Support",
    language: "Language",
    userGuide: "User Guide",
    contact: "Contact",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    notifications: {
      enabled: "Notifications enabled",
      soundEnabled: "Sound enabled",
      vibrationEnabled: "Vibration enabled"
    }
  },

  // Posts
  posts: {
    styles: {
      casual: "Casual",
      professional: "Professional",
      humorous: "Humorous",
      emotional: "Emotional",
      genz: "Gen Z",
      millennial: "Millennial",
      minimalist: "Minimalist",
      storytelling: "Storytelling",
      motivational: "Motivational"
    },
    categories: {
      daily: "Daily",
      cafe: "Café",
      food: "Food",
      exercise: "Exercise",
      travel: "Travel",
      fashion: "Fashion",
      beauty: "Beauty",
      other: "Other"
    },
    time: {
      today: "Today",
      yesterday: "Yesterday"
    },
    actions: {
      copy: "Copy",
      copyMessage: "Copied",
      save: "Save",
      saving: "Saving...",
      saveSuccess: "Saved successfully",
      saveError: "Failed to save",
      share: "Share"
    },
    input: {
      title: "Write Post",
      contentSection: "Content",
      placeholder: "What would you like to write about?",
      required: "Please enter content",
      hashtags: "Hashtags",
      hashtagPlaceholder: "#daily #cafe #weekend",
      platform: "Platform",
      category: "Category",
      metrics: "Performance Metrics",
      optional: "(Optional)"
    },
    metrics: {
      likes: "Likes",
      comments: "Comments", 
      shares: "Shares",
      reach: "Reach"
    }
  },

  // Alerts
  alerts: {
    notifications: {
      enabled: "Push notifications enabled",
      disabled: "Push notifications disabled"
    },
    sound: {
      enabled: "Sound enabled"
    },
    vibration: {
      enabled: "Vibration enabled"
    },
    platform: {
      connect: {
        title: "Connect {{platform}}",
        message: "Connect to {{platform}}?",
        comingSoon: "{{platform}} connection feature coming soon"
      },
      disconnect: {
        title: "Disconnect",
        message: "Disconnect from {{platform}}?",
        success: "{{platform}} disconnected",
        failed: "Failed to disconnect"
      },
      status: {
        connected: "Connected",
        notConnected: "Not connected",
        connectAction: "Connect"
      }
    },
    purchase: {
      restore: {
        title: "Restore Purchase",
        message: "Restore purchase history?",
        failedTitle: "Restore Failed",
        failed: "Failed to restore purchase"
      }
    },
    data: {
      clearHistory: {
        title: "Clear History",
        message: "Clear history?",
        success: "History cleared",
        failed: "Failed to clear history"
      },
      deleteAll: {
        title: "Delete All Data",
        message: "Delete all data?",
        success: "All data deleted",
        failed: "Failed to delete data"
      }
    },
    auth: {
      logout: {
        title: "Logout",
        message: "Are you sure you want to logout?",
        action: "Logout"
      }
    },
    rating: {
      title: "Rate App",
      message: "Please rate the app if you're satisfied",
      later: "Later",
      rate: "Rate",
      error: "Cannot open rating page"
    },
    tokens: {
      dailyLimitExceeded: {
        title: "Daily Limit Exceeded",
        message: "Daily token limit ({{limit}}) exceeded"
      },
      partialGrant: {
        title: "Partial Token Grant",
        message: "{{tokens}} tokens granted"
      }
    },
    buttons: {
      ok: "OK",
      cancel: "Cancel",
      later: "Later",
      delete: "Delete",
      error: "Error",
      completed: "Completed",
      connect: "Connect",
      disconnect: "Disconnect", 
      restore: "Restore",
      close: "Close"
    },
    language: {
      changed: "Language changed"
    },
    permission: {
      title: "Permission Required",
      message: "Please allow notification permissions in settings to receive push notifications.",
      goToSettings: "Go to Settings"
    },
    testNotification: {
      title: "Test Notification",
      message: "Which notification would you like to test?",
      mission: "Mission Notification",
      trend: "Trend Notification", 
      token: "Token Notification",
      achievement: "Achievement Notification",
      tips: "Tips Notification",
      send: "Send Test Notification"
    }
  },

  // Profile Detail Modal
  profile: {
    updateSuccess: "Profile updated successfully! 🎉",
    updateMessage: "Your profile is {completion}% complete.\nNow AI will create content that matches your style!",
    confirm: "OK",
    sections: {
      ageGroup: "Age Group",
      gender: "Gender",
      maritalStatus: "Marital Status",
      familyRole: "Family Role",
      parentRole: "Parent Role",
      childAge: "Child Age", 
      occupation: "Occupation",
      writingStyle: "Writing Style",
      emojiUsage: "Emoji Usage",
      tone: "Tone"
    },
    age: {
      "10s": "10s",
      "20s": "20s",
      "30s": "30s", 
      "40s": "40s",
      "50s": "50s",
      "60s+": "60s+"
    },
    gender: {
      male: "Male",
      female: "Female",
      other: "Other",
      private: "Private"
    },
    maritalStatus: {
      single: "Single",
      married: "Married"
    },
    familyRole: {
      parent: "Parent",
      grandparent: "Grandparent"
    },
    parentRole: {
      mother: "Mother",
      father: "Father"
    },
    childAge: {
      baby: "Baby",
      toddler: "Toddler",
      elementary: "Elementary",
      middle_school: "Middle school",
      high_school: "High school", 
      adult: "Adult"
    },
    occupation: {
      student: "Student",
      office_worker: "Office worker",
      business_owner: "Business owner",
      freelancer: "Freelancer",
      homemaker: "Homemaker",
      retired: "Retired",
      custom_placeholder: "Please enter your specific occupation (optional)"
    },
    writingStyle: {
      casual: "Casual",
      balanced: "Balanced",
      formal: "Formal"
    },
    emojiUsage: {
      minimal: "Minimal",
      moderate: "Moderate", 
      abundant: "Abundant"
    },
    tone: {
      serious: "Serious",
      light: "Light",
      witty: "Witty"
    }
  },

  // Common
  common: {
    error: "Error",
    success: "Success",
    close: "Close",
    count: "",
    start: "Start",
    skip: "Skip",
    loading: "Loading...",
    later: "Later"
  },

  // Analytics
  analytics: {
    insights: {
      likesIncrease: "Likes increased significantly! 🎉",
      reachGrowth: "Reach grew explosively! 🚀",
      topCategory: "{{category}} posts were the most frequent",
      highActivity: "You're showing great posting activity! 👏",
      lowActivity: "Posting more frequently would be great",
    },
    timeSlots: {
      morning: "Morning (6-9 AM)",
      forenoon: "Forenoon (9 AM-12 PM)",
      lunch: "Lunch (12-3 PM)",
      afternoon: "Afternoon (3-6 PM)",
      evening: "Evening (6-9 PM)",
      night: "Night (9 PM-12 AM)",
      dawn: "Dawn (12-6 AM)",
    },
    sampleData: {
      categories: ["Cafe", "Restaurant", "Daily", "Exercise", "Travel"],
      hashtags: ["daily", "daily"],
      postContent: "Sample post",
    },
  },


  // Time and Date
  time: {
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    none: "None",
    hour: " AM/PM",
  },

  // Language
  language: {
    current: "Current language: {{language}} {{isSystem}}",
    system: "(System)",
    selectLanguage: "Select Language",
    resetToSystem: "Reset to system language",
    note: "App will restart when language is changed"
  },

  // Trends Screen
  trends: {
    title: "Real-time Trends",
    subtitle: "Real-time popular trends and keywords",
    refresh: "Refresh",
    lastUpdated: "Last updated: {{time}}",
    categories: {
      all: "All",
      news: "News", 
      social: "Social",
      keywords: "Keywords"
    },
    categoryTitles: {
      all: "All Trends",
      news: "News",
      social: "Community",
      keywords: "Popular Keywords"
    },
    sources: {
      news: "News",
      social: "Community",
      naver: "Naver",
      keywords: "Keywords"
    },
    loading: {
      initial: "Loading trends...",
      refresh: "Refreshing..."
    },
    errors: {
      loadFailed: "An error occurred while loading trends.",
      refreshFailed: "An error occurred while refreshing.",
      cannotLoad: "Unable to load trends",
      tryAgain: "Please try again later",
      networkError: "Please check your network connection",
      retryButton: "Try Again"
    },
    premium: {
      title: "Premium Feature",
      subtitle: "Real-time trends are available from PRO plan.",
      upgradeButton: "Upgrade",
      preview: {
        title: "Trend Preview",
        subtitle: "Analyze trends to increase traffic and create content based on real-time issues."
      }
    },
    tips: {
      title: "Trend Usage Tips",
      content: "Click on trends to have AI write articles on that topic. Modify with keywords to match your style!",
      writeWithTrend: "Write with this trend"
    },
    updates: {
      daily: "Trends are updated daily",
      realtime: "Real-time trend updates"
    },
    actions: {
      viewMore: "View More",
      writePost: "Write Post",
      share: "Share"
    }
  },

  // MyStyle Screen
  mystyle: {
    title: "My Style",
    subtitle: "Build your own content brand",
    loading: "Analyzing style...",
    refresh: "Refresh",
    empty: {
      title: "No content created yet",
      subtitle: "Create your first content with Posty!",
      startWriting: "Start Writing"
    },
    tabs: {
      templates: "Templates"
    },
    templates: {
      title: "Style Templates",
      subtitle: "Try various styles and find your own style",
      starterLimit: "STARTER Plan: Only {{limit}} templates available"
    },
    insights: {
      title: "Style Insights",
      styleTitle: "{{name}} Style",
      styleDescription: "You have {{description}}.",
      styleAction: "Continue developing this style",
      consistentTitle: "Consistent Style",
      consistentDescription: "You maintain {{percentage}}% high consistency!",
      improvementTitle: "Style Consistency",
      improvementDescription: "Try to maintain more consistent length and tone in your writing.",
      improvementAction: "View Style Guide",
      diverseTitle: "Diverse Content",
      diverseDescription: "You're trying various topics and styles!",
      challengeTitle: "New Challenge",
      challengeDescription: "Try the {{name}} challenge!",
      challengeAction: "Start Challenge"
    },
    analysis: {
      title: "Writing Analysis",
      totalPosts: "Total {{count}} posts",
      averageLength: "Average word count",
      mostUsedTone: "Primary tone",
      consistency: "Consistency",
      improvement: "Improvement suggestions"
    },
    timeSlots: {
      title: "Activity Time Slots",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      night: "Night",
      morningLabel: "6-12 AM",
      afternoonLabel: "12-6 PM",
      eveningLabel: "6-10 PM",
      nightLabel: "10 PM-6 AM"
    },
    templates: {
      title: "My Templates",
      subtitle: "Save frequently used patterns as templates",
      bestStyle: {
        name: "My Best Style",
        description: "Structure of your most engaging posts",
        opening: "Emotional greeting",
        body: "Specific experience sharing",
        closing: "Engaging question"
      },
      toneMaster: {
        name: "{{tone}} Master",
        description: "Your most frequently used tone",
        tips: "Write emphasizing the characteristics of this tone"
      },
      growthStory: {
        name: "Growth Story",
        description: "Posts about challenges and achievements",
        hook: "Interesting introduction",
        challenge: "Difficulties faced",
        solution: "Problem-solving process",
        lesson: "Lessons learned"
      },
      saveTemplate: "Save Template",
      useTemplate: "Use Template"
    },
    premium: {
      title: "Premium Feature",
      subtitle: "Use more detailed analysis and templates",
      upgradeButton: "Upgrade"
    },
    alerts: {
      challengeStart: "Challenge Started!",
      challengeStarted: "{{name}} challenge has started!",
      templateSaved: "Template saved successfully",
      templateUsed: "Template applied",
      premiumTemplate: "Premium Template",
      premiumTemplateMessage: "All templates are available in PRO plan.",
      cancel: "Cancel",
      upgrade: "Upgrade",
      confirm: "Confirm"
    },
    metrics: {
      title: "Statistics",
      mostActiveDay: "Most active day",
      averageWordsPerPost: "Average words per post",
      totalWritingTime: "Total writing time",
      improvementTip: "Improvement tip"
    },
    weekdays: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    },
    actions: {
      analyze: "Analyze",
      viewDetails: "View Details",
      shareInsights: "Share Insights",
      exportData: "Export Data"
    }
  },

  // Mission System
  missions: {
    completed: {
      title: "Mission Complete! 🎯",
      message: "You've completed the content creation mission and earned {{tokens}} tokens!"
    }
  },

  // Tokens
  tokens: {
    count: "{{count}}",
    current: "Current Tokens",
    unlimited: "Unlimited",
    usage: {
      today: "Used {{count}} today",
    },
    actions: {
      getFree: "Get Free Tokens",
      charge: "Charge Tokens"
    },
    info: {
      free: "10 free tokens are recharged daily at midnight",
      starter: "STARTER plan allows 200 tokens per month",
      premium: "PREMIUM plan allows 500 tokens per month",
      pro: "Using unlimited tokens with PRO plan"
    },
    alerts: {
      proTitle: "PRO Plan Active",
      proMessage: "You're currently using PRO plan with unlimited tokens. 🚀"
    }
  },
  myStyle: {
    access: {
      freeMessage: "My Style analysis is available from STARTER plan.",
    },
  },
  plans: {
    free: {
      name: "Free",
      priceDisplay: "Free",
    },
  }
};

const en = {
  // Common
  common: {
    ok: "OK",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    done: "Done",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info",
    count: "",
    start: "Start",
    skip: "Skip",
    later: "Later",
    confirm: "Confirm",
    purchase: "Purchase",
    categories: {
      all: "All",
      casual: "Casual",
      serious: "Serious",
      special: "Special"
    }
  },
  app: {
    name: "Posty",
    tagline: "Creative content powered by AI",
    slogan: "AI writes, you shine",
    subTagline: "Complete perfect posts in 1 minute",
    description: "Create amazing posts with just one photo",
    slogan1: "Share your story\nwith the world.",
    slogan2: "A simple line becomes\na special moment.",
    slogan3: "Posty will help you\nwrite better.",
    slogan4: "Shall we start?",
  },

  // Navigation
  navigation: {
    home: "Home",
    write: "Write",
    trend: "Trends",
    myStyle: "My Style",
    settings: "Settings",
  },

  // Documents
  documents: {
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    lastUpdated: "Last updated",
    syncedFromNotion: "Synced from Notion",
    loadingDocument: "Loading document...",
    documentLoadError: "Unable to load document",
    retry: "Try Again",
    contactEmail: "For inquiries, please contact",
    effectiveFrom: "This policy is effective from",
  },

  // AI Write Screen
  aiWrite: {
    title: "Write with Posty",
    subtitle: {
      text: "What story would you like to write? I'll help you!",
      polish: "I'll polish your text to make it shine!",
      photo: "Show me a photo and I'll create matching content!",
    },
    profileBanner: {
      title: "Complete your profile to write more like you",
      completeness: "{{percent}}%",
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
    contentDisplay: {
      originalLength: "Original Length",
      convertedLength: "Converted",
      characters: "chars",
      platformChangeNotice: "Platform changes don't use tokens",
      originalContent: "Generated Original",
      emojiOn: "Emoji ON",
      emojiOff: "Emoji OFF",
      bodyText: "Body",
      platformHint: "Tap the platform tabs below to convert for each SNS",
    },
    placeholderExamples: {
      text: [
        "Today's delicious lunch",
        "Review of a newly discovered cafe",
        "Weekend travel destination",
        "Recent movie review",
        "My latest hobby obsession",
        "Fun time with friends",
        "Today's little happiness",
        "New workout routine story"
      ],
      polish: "Example: Today I had coffee with a friend at a cafe and we talked for a long time, it was so nice...",
    },
    prompt: {
      title: "What would you like to write about?",
      refresh: "Refresh",
      trendUpdate: {
        title: "Trends Updated",
        message: "Latest trends have been loaded!"
      }
    },
    placeholders: {
      morning: "How did you start your morning today?",
      lunch: "Did you enjoy your lunch?",
      afternoon: "Are you enjoying your afternoon break?",
      evening: "How was your day today?",
      night: "What are you thinking about late at night?"
    },
    timeBasedPrompts: {
      morning: ["Morning Coffee", "Commute Scenery", "Morning Routine", "Morning Exercise", "Dawn Vibes", "Breakfast Menu"],
      lunch: ["Lunch Recommendations", "Afternoon Coffee Time", "Lunch Break", "Today's Lunch", "Cafe Hopping", "Afternoon Work"],
      afternoon: ["Afternoon Break", "Cafe Time", "Preparing to Leave Work", "Afternoon Exercise", "Daily Summary", "Evening Plans"],
      evening: ["Dinner Menu", "Evening Commute", "Evening Exercise", "End of Day", "Night View", "Evening Leisure"],
      night: ["Late Night Snacks", "Late Night Vibes", "Insomnia Diary", "Dawn Thoughts", "Night Work", "Night Walk"]
    },
    categories: {
      casual: "Daily",
      professional: "Business", 
      humorous: "Humor",
      emotional: "Emotional",
      genz: "Trendy",
      millennial: "Lifestyle",
      minimalist: "Minimal",
      formal: "Formal",
      motivational: "Motivational"
    },
    tones: {
      style: "Style",
      casual: "Casual",
      professional: "Professional",
      humorous: "Humorous",
      emotional: "Emotional",
      genz: "Gen Z",
      millennial: "Millennial",
      minimalist: "Minimalist",
      formal: "Formal",
      motivational: "Quotes",
      clean: "Clean",
      structured: "Organized",
      enthusiastic: "Enthusiastic",
      trendy: "Hip",
      elegant: "Sophisticated",
      modern: "Modern",
      vintage: "Vintage",
      minimal: "Minimal",
      friendly: "Warm",
      cool: "Cool",
      energetic: "Bright",
      mysterious: "Dark",
    },
    lengths: {
      short: "Short",
      medium: "Medium",
      long: "Long",
    },
    buttons: {
      generate: "Ask Posty",
      generating: "Posty is writing...",
      generatingMessages: [
        "Posty is writing...",
        "Editing sentences...",
        "Polishing the text...",
        "Fixing typos...",
        "Adjusting tone...",
        "Adding hashtags...",
        "Final check...",
      ],
      copy: "Copy",
      save: "Save",
      share: "Share",
    },
    alerts: {
      noPrompt: "Tell me what to write about!",
      noPhoto: "Please select a photo first!",
      noTokens: "Insufficient tokens",
      watchAdToWrite: "Watch an ad to get 1 token and write immediately!",
      watchAd: "Watch Ad & Write",
      error: "Something went wrong. Please try again.",
      waitAnalysis: "Please wait for photo analysis to complete.",
      completeAnalysis: "Please complete photo analysis first.",
      imageTooBig: {
        title: "Notice",
        message: "Image is too large. Please select a smaller image.",
        analysisResult: "Image is too large."
      },
      styleLock: {
        loadFailed: "Ad load failed",
        loadFailedMessage: "Please try again later.",
        incomplete: "Ad viewing incomplete",
        incompleteMessage: "You must watch the ad to the end to unlock the style.",
        error: "Error",
        errorMessage: "An error occurred while watching the ad.\nPlease try again later.",
        unlockOption: "Watch Ad to Unlock",
        proStyleMessage: "This is a PRO style.\nWatch an ad to use it once!",
        loadingAd: "Loading ad..."
      }
    },
    keywords: {
      morning: ["morning routine", "cafe", "commute", "breakfast", "coffee", "exercise"],
      afternoon: ["lunch", "daily life", "afternoon", "break", "walk", "cafe"],
      evening: ["evening", "workout", "hobby", "rest", "restaurant"],
      night: ["late snack", "netflix", "rest", "daily life", "hobby", "dawn"]
    },
    descriptions: {
      short: "~50 characters",
      medium: "~150 characters",
      long: "~300 characters"
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
      completedHint: "Generation complete! Tap the platform tabs below to convert for each social media platform",
      platformHint: "Tap the platform tabs below to convert for each social media platform",
      encouragements: [
        "I wrote it with the feeling you wanted!",
        "How about this style?",
        "Posty worked hard on this!",
        "Let me know if you'd like any changes!"
      ],
    },
    polishOptions: {
      summarize: "Summarize",
      simple: "Simplify", 
      formal: "Make Formal",
      emotion: "Add Emotion",
      engaging: "Make Engaging",
      hashtag: "Extract Hashtags",
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
        camera: "Camera",
        gallery: "Gallery",
      },
      defaultPrompt: "Please write a natural social media post that goes well with the photo.",
    },
    ads: {
      watching: {
        title: "Watching Ad",
        message: "Please wait while the advertisement loads.",
      },
      complete: {
        title: "Ad Complete",
        messageStyle: "You can now use premium style once for free!",
        messageLength: "You can now use premium length once for free!",
      },
      error: "Failed to load advertisement. Please try again.",
    },
    premium: {
      title: "Premium Feature",
      styleTitle: "Premium Style",
      lengthTitle: "Premium Length",
      viewPlans: "View Plans",
      watchAd: "Watch Ad for 1-time use",
      upgrade: "Subscribe to Pro Plan",
      oneTimeUse: "1-time use",
      styleMessage: "✨ {{styleName}} style is a premium feature!\n\n🎯 Get access right now:\n• 🎬 Watch an ad (free trial)\n• ⭐ Upgrade to Pro plan",
      toneMessage: "{{tone}} style is only available with Pro plan.",
      unlockedTitle: "Style Unlocked!",
      unlockedMessage: "{{tone}} style is now available for one-time use.",
    },
    tokenUsage: {
      photoWrite: "Photo Writing",
      polish: "Text Polish",
      newPost: "New Post",
    },
    writingInStyle: "Writing in Style",
  },

  // AI Prompts
  aiPrompts: {
    length: {
      short: "[Length: Please write concisely within 50 characters]",
      medium: "[Length: Please write moderately between 100-150 characters]",
      long: "[Length: Please write in detail between 200-300 characters]"
    },
    enhanced: {
      personaIntro: "Your persona:",
      toneLabel: "Writing tone:",
      topic: "Topic:",
      imageContext: "Image context:",
      guidelines: "Writing guidelines:",
      guideline1: "Maintain the above persona and tone consistently",
      guideline2: "Write naturally as if written by a real {{ageGroup}} {{gender}}",
      guideline5: "Reflect interests:",
      specialInstructions: "Special instructions:",
      ageGroups: {
        "10s": "teenager",
        "20s": "person in their 20s",
        "30s": "person in their 30s",
        "40s": "person in their 40s", 
        "50s": "person in their 50s",
        "60s+": "person in their 60s or older"
      },
      genders: {
        male: "male",
        female: "female",
        other: "person"
      },
      familyRoles: {
        mother: "mother",
        father: "father", 
        grandparent: "grandparent"
      },
      parentLove: "Write with the loving heart of a {{parentType}} who loves their child.",
      grandparentLove: "Write with the warm perspective of grandparents who love their grandchildren.",
      occupation: "Their profession is {{occupation}}.",
      interests: "Their main interests include {{interests}} and more."
    },
    platforms: {
      instagram: {
        name: "Instagram",
        characteristics: [
          "Visual and emotional tone",
          "Use of emojis recommended",
          "Storytelling-focused",
          "Active use of hashtags",
          "Composed of short paragraphs"
        ],
        prompt: "Please write an emotional and visual post suitable for Instagram. Use emojis appropriately and create empathy through storytelling."
      },
      facebook: {
        name: "Facebook", 
        characteristics: [
          "Balance of informative and friendly",
          "Long posts possible",
          "Conversational tone",
          "Community-centered",
          "Link sharing possible"
        ],
        prompt: "Please write a friendly and conversational post suitable for Facebook. Deliver information while maintaining a tone as if talking with friends."
      },
      twitter: {
        name: "X (Twitter)",
        characteristics: [
          "Concise and impactful expression",
          "Trends and timeliness",
          "Wit and humor",
          "Few hashtags",
          "Retweet inducing"
        ],
        prompt: "Please write a concise and impactful post suitable for X (Twitter). Deliver only the essence within 280 characters, but express it wittily."
      }
    }
  },

  // Tab Navigation
  tabs: {
    home: "Home",
    aiWrite: "AI Write",
    trend: "Trends",
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
        message: "Do you want to delete only the current user's data?",
        success: {
          title: "Complete",
          message: "Current user's data has been deleted.",
        },
      },
      storageKeys: {
        title: "Stored Keys List",
        noKeys: "No related keys found.",
        confirm: "Confirm",
      },
    },
    warnings: {
      destructive: "⚠️ Warning: Data deletion cannot be undone!",
      devOnly: "This screen should only be used for development/debugging purposes.",
    },
  },

  // Social Media Connection Screen
  sns: {
    title: "Social Media Connection Management",
    description: "Connect your social media accounts to automatically track likes, comments, and other performance metrics!",
    sections: {
      accounts: "Social Media Account Connection",
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
      description: "Fetch latest data from connected social media accounts",
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
          message: "Social media data has been successfully updated.",
        },
        error: {
          title: "Sync Failed",
          message: "There was a problem fetching data.",
        },
        confirm: "Confirm",
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
    interests: [
      "Travel", "Food", "Cafe", "Cooking", "Baking", "Exercise", "Fitness", "Yoga", "Running", "Hiking",
      "Parenting", "Education", "Reading", "Movies", "Drama", "Music", "Concert", "Exhibition", "Photography", "Art",
      "Fashion", "Beauty", "Interior", "Gardening", "Pets", "Gaming", "IT", "Stocks", "Real Estate", "Self Development"
    ],
    completion: {
      low: "Set up your profile to experience personalized AI writing",
      medium: "Just a little more! AI can understand your style more accurately",
      high: "Almost done! You'll soon meet personalized AI writing service",
    },
  },

  // Login Screen
  login: {
    title: "Easy Login",
    moreOptions: "Connect with other account",
    buttons: {
      naver: "Naver",
      google: "Google",
      kakao: "Kakao",
      facebook: "Facebook",
      apple: "Apple",
    },
    errors: {
      title: "Login Failed",
      default: "Login failed. Please try again.",
      serverAuth: "Server authentication in progress. Please try again later.",
      existingAccount: "Account already registered with different method.",
      cancelled: "Login was cancelled.",
      timeout: "Login timeout. Please try again.",
      bundleId: "There is a problem with Kakao login settings.\nPlease restart the app or contact support.",
      kakaoSetup: "Kakao login failed\n1. Please check if KakaoTalk app is installed\n2. Please check your network connection",
      naverSetup: "Naver login failed\n1. Please check if Naver app is installed\n2. Please check your network connection",
    },
  },

  // Subscription Plans
  subscription: {
    watchVideo: "Watch Video",
    alreadyCheckedIn: "You've already checked in today!",
    alreadyShared: "You've already shared on social media today!",
    alreadyRated: "You've already rated the app. Thank you!",
    title: "Subscription Plans",
    tokenPurchase: "Token Purchase",
    tokenPurchaseTab: "Token Purchase", 
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
        description: "STARTER provides 600 tokens total (300 initial + 10×30 daily), PRO provides 1,100 tokens total (500 initial + 20×30 daily), MAX provides unlimited tokens"
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
      cancelButton: "Cancel"
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
    earnTokens: "Tokens Earned!",
    earnTokensMessage: "You received {{tokens}} tokens!",
    watchAd: "Watch Ad",
    watchAdMessage: "Watch a 30-second ad to get 2 tokens?",
    inviteFriends: "Invite Sent",
    inviteFriendsMessage: "You'll get 5 tokens when your friend signs up!",
    cancelSubscription: "Cancel Subscription",
    cancelSubscriptionMessage: "Are you sure you want to cancel your {{planName}} plan subscription?\n\nYou can continue using the current plan until the next billing date even after cancellation.",
    cancelSubscriptionAction: "Cancel",
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
          message: "AI-powered social media content creation with Posty! Try it now 🚀\nhttps://posty.app"
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
    planDescriptions: {
      free: "10 free tokens daily",
      starter: "200 tokens on signup", 
      premium: "500 tokens on signup",
      pro: "Unlimited tokens",
      downgradeBlocked: "Cannot downgrade to lower plan"
    },
    membershipNotices: {
      free: "Free members get 10 tokens automatically recharged daily",
      starter: "STARTER members get 200 tokens on signup",
      premium: "PRO members get 500 tokens on signup", 
      pro: "MAX members get unlimited tokens"
    },
    upgradeDescriptions: {
      starterImmediate: "You'll receive 200 tokens immediately upon signup",
      premiumImmediate: "You'll receive 500 tokens immediately upon signup",
      proImmediate: "You'll receive 1500 tokens immediately upon signup",
      premiumUpgrade: "You'll receive an additional 500 tokens in total",
      proUpgrade: "You'll receive 1500 tokens immediately upon signup",
      starterDowngrade: "Warning: Free tokens will be limited to 300"
    },
    plans: {
      free: {
        name: "Free"
      },
      freeDetails: {
        name: "Free",
        priceDisplay: "Free",
        features: [
          "10 daily tokens",
          "3 tone styles",
          "Short/medium length",
          "Ads included",
        ],
      },
      starter: {
        name: "Starter",
        features: [
          "300 tokens immediately upon signup",
          "Additional 10 tokens daily",
          "4 tone styles",
          "Long content creation available",
          "Ad-free experience",
          "MyStyle analysis",
        ],
      },
      premium: {
        name: "Pro",
        features: [
          "500 tokens immediately upon signup",
          "Additional 20 tokens daily",
          "6 tone styles",
          "All content lengths",
          "Ad-free experience",
          "MyStyle analysis",
          "Priority processing",
        ],
      },
      pro: {
        name: "Max",
        features: [
          "500 tokens immediately upon signup",
          "Unlimited tokens (Fair Use)",
          "All tone styles",
          "Priority processing",
          "Completely ad-free",
        ],
      },
    },
    // Plan features translation keys
    features: {
      dailyTokens10: "10 daily tokens",
      tones2: "2 tone styles",
      tones3: "3 tone styles",
      lengthShortMedium: "Short/medium length",
      hasAds: "Includes ads",
      signup300: "300 tokens immediately upon signup",
      daily10: "10 additional tokens daily",
      tones4: "4 tone styles",
      longLength: "Long content creation",
      noAds: "Ad-free",
      myStyleAnalysis: "MyStyle analysis",
      signup500: "500 tokens immediately upon signup",
      daily20: "20 additional tokens daily",
      tones6: "6 tone styles",
      allLengths: "All content lengths",
      fastImageAnalysis: "Fast image analysis",
      gpt4Model: "GPT-4 model",
      unlimitedTokens: "Unlimited tokens",
      allTones: "All tone styles",
      instantImageAnalysis: "Instant image analysis",
      gpt4TurboModel: "GPT-4 Turbo",
      apiAccess: "API access",
      prioritySupport: "Priority support",
    },
    confirmSubscriptionMessage: "Do you want to subscribe to the {{planName}} plan?\n\n{{description}}\nCurrent tokens: {{currentTokens}}\nAfter change: {{afterTokens}}",
    subscribePro: "Subscribe to Pro"
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
        title: "Good morning, {{userName}}!",
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
        message: "Even a short post is fine. Let's record this moment",
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
      cafe: "Cafe",
      food: "Food",
      travel: "Travel",
      exercise: "Exercise",
      bookstagram: "Bookstagram",
      trends: "Trends",
      trendy: "Trendy"
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
      writeAssist: "Help Me Write",
      photoStart: "Start with Photo",
      polishText: "AI Text Polish",
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
      photoSelectButton: "Select Photo",
      defaultBadge: "🎯 Default",
      defaultTitle: "Recommended Title",
      defaultContent: "Recommended Content"
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
      polishTool: "AI Text Polish Tool",
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
    },
    banner: {
      title: "Write Amazing Posts with Posty",
      subtitle: "Perfect posting powered by AI",
    }
  },

  // Ad-related translations
  ads: {
    title: "Watch Ads and Earn Rewards",
    loading: "Loading ad...",
    loadError: "Unable to load ad",
    showError: "Unable to show ad. Please try again.",
    watch: "Watch Ad",
    reward: {
      tokens: "Get {{amount}} tokens!",
      premiumTone: "Use premium tone style!",
      premiumLength: "Use long writing!",
      default: "Get your reward!"
    }
  },

  // My Style Screen
  myStyle: {
    title: "My Style",
    subtitle: "Build your own content brand",
    loading: "Analyzing style...",
    access: {
      freeMessage: "My Style analysis is available from PRO plan.",
    },
    empty: {
      title: "No content created yet",
      subtitle: "Create your first content with Posty!"
    },
    tabs: {
      overview: "Overview",
      analysis: "Analysis", 
      templates: "Templates"
    },
    brand: {
      title: "Brand",
      styleAnalysis: "Style Analysis",
      tagline: "My unique style created from {{count}} stories"
    },
    profileCompletion: "Profile Completion {{completeness}}%",
    interests: "Interests (Multiple selection available)",
    formality: "Formality",
    emotiveness: "Emotional Expression",
    humor: "Humor",
    saveProfile: "Save Profile",
    keywords: {
      title: "Key Keywords"
    },
    challenge: {
      progress: "Progress: {{current}}/{{total}}",
      dayUnit: "days"
    },
    defaultTime: "7 PM",
    hashtagPrefix: "#",
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
    analytics: {
      growth: "📈 Growth Analysis",
      totalPosts: "Total Posts",
      toneAnalysis: "🎨 Tone Usage Analysis",
      categoryDistribution: "Category Distribution"
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
      title: "Style Templates",
      subtitle: "Try various styles and find your own style",
      recommended: "Recommended",
      usageCount: "{{count}} used",
      starterLimit: "STARTER Plan: Only {{limit}} templates available",
      emojiPrefix: "📝",
      bulletPoint: "•",
      averageLength: "Average Length",
      keywords: "Keywords",
      emojis: "Emojis",
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
    metrics: {
      title: "📊 My Style Metrics",
      consistency: "Consistency",
      diversity: "Diversity",
      preferredTime: "Preferred Time",
      mostActiveDay: "Most active day",
      averageWordsPerPost: "Average words per post",
      totalWritingTime: "Total writing time",
      improvementTip: "Improvement tip"
    },
    challenges: {
      title: "🏆 Style Challenges",
      subtitle: "Master new styles through challenges",
      inProgress: "In Progress",
      emojiPrefix: "🏆",
      "minimal-week": {
        name: "Minimal Week",
        description: "Write only within 50 characters for a week",
        rules: ["All posts within 50 characters", "Maximum 2 emojis", "Maximum 3 hashtags"]
      },
      "story-month": {
        name: "Story Month",
        description: "Write one story every day for a month", 
        rules: ["Write 200+ characters daily", "Beginning-middle-end structure", "Emotional expression required"]
      },
      "trend-hunter": {
        name: "Trend Hunter",
        description: "Discover 10 latest trends",
        rules: ["Discover new hashtags", "Include trend analysis", "Share with other users"]
      }
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
    },
    coaching: {
      title: "Posty's Style Coaching"
    },
    lengths: {
      under50: "Under 50 characters",
      over200: "Over 200 characters",
      medium100: "100-150 characters",
      medium150: "150-200 characters",
      short80: "80-120 characters"
    }
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
    aiAgent: {
      title: "AI Agent",
      description: "Select the AI model to use for content generation",
      selectAgent: "Select AI Agent",
      note: "AI Agent is the AI model used for content generation.",
      gpt: "GPT-4o Mini",
      gemini: "Gemini 2.5 Flash Lite",
      proRequired: "Pro subscription required",
      subscriptionRequired: "Subscription required",
      agents: {
        gptMini: {
          description: "Fast and reliable general-purpose model"
        },
        gemini: {
          description: "Google's next-generation ultra-fast model"
        }
      }
    },
    themeDescription: "Theme settings",
    theme: {
      title: "Theme Settings",
      mode: "Mode Selection",
      color: "Theme Color",
      light: "Light Mode",
      dark: "Dark Mode",
      system: "Follow System Settings",
      cancel: "Cancel",
      confirm: "Confirm",
    },
    support: "Support",
    language: "Language",
    contact: "Contact",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    notifications: {
      enabled: "Notifications enabled",
      soundEnabled: "Sound enabled",
      vibrationEnabled: "Vibration enabled"
    },
    adPersonalization: {
      title: "Ad Personalization Settings",
      description: "Configure personalized ads display preferences",
      updateSuccess: "Ad personalization settings have been updated.",
      updateError: "Unable to update settings. Please try again later."
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
      formal: "Formal",
      motivational: "Motivational"
    },
    time: {
      today: "Today",
      yesterday: "Yesterday",
      justNow: "Just now",
      minutesAgo: "{{minutes}} minutes ago",
      hoursAgo: "{{hours}} hours ago",
      daysAgo: "{{days}} days ago",
      weeksAgo: "{{weeks}} weeks ago",
      monthsAgo: "{{months}} months ago"
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
    },
    profileCompletion: "Profile Completion {{completeness}}%",
    interests: "Interests (Multiple selection available)",
    formality: "Formality",
    emotiveness: "Emotional Expression",
    humor: "Humor",
    saveProfile: "Save Profile"
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
    tokenAlerts: {
      dailyLimitExceeded: {
        title: "Daily Limit Exceeded",
        message: "Daily token limit ({{limit}}) exceeded"
      },
      partialGrant: {
        title: "Partial Token Grant",
        message: "{{tokens}} tokens granted"
      }
    },
    aiPrompts: {
      length: {
        short: "[Length: Write concisely within 50 characters]",
        medium: "[Length: Write moderately in 100-150 characters]", 
        long: "[Length: Write in detail with 200-300 characters]"
      },
      platforms: {
        instagram: {
          prompt: "Please write an emotional and visual post suitable for Instagram. Use emojis appropriately and create empathy through storytelling.",
          instruction1: "Use line breaks to improve readability",
          instruction2: "Use emojis at the end of sentences or at important points",
          instruction3: "Group hashtags together at the end of the post"
        },
        facebook: {
          prompt: "Please write a friendly and conversational post suitable for Facebook. Deliver information while maintaining a tone as if talking with friends.",
          instruction1: "Use a comfortable tone as if talking to a friend",
          instruction2: "End with a question to encourage comment participation"
        },
        twitter: {
          prompt: "Please write a concise and impactful post suitable for X (Twitter). Deliver only the essence within 280 characters, expressed wittily.",
          instruction1: "Must write within 280 characters",
          instruction2: "Place the core message at the beginning",
          instruction3: "Use only 1-2 hashtags"
        },
        threads: {
          prompt: "Please write a conversational post suitable for Threads. Write in a sincere tone that can spark discussion.",
          instruction1: "Write as if starting a conversation",
          instruction2: "Include personal opinions or experiences"
        },
        linkedin: {
          prompt: "Please write a professional and formal post suitable for LinkedIn. Write in a tone that shares industry insights or professional experiences.",
          instruction1: "Use professional terminology appropriately",
          instruction2: "Include specific achievements or numbers if available",
          instruction3: "End with lessons learned or insights"
        }
      }
    },
    buttons: {
      ok: "Confirm",
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
    updateSuccess: "Profile updated successfully!",
    updateMessage: "Your profile is {completion}% complete.\nNow AI will create content that matches your style!",
    confirm: "Confirm",
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

  // Recommendations
  recommendations: {
    // First post card
    firstPost: {
      title: "Try Your First Post!",
      content: "Start your Posty journey with\na simple introduction or greeting",
      badge: "🌟 First Step",
      action: "Get Started",
      meta: "First Step",
    },
    // Selfie card
    selfie: {
      title: "Just One Selfie is Enough!",
      content: "Take a photo of yourself today\nand write a simple greeting to make a great post",
      badge: "🤳 Easy Start",
      action: "Get Started",
      meta: "Easy",
    },
    // Food card
    easyFood: {
      title: "What Did You Eat? That's It!",
      content: 'All you need is one food photo\nJust saying "delicious" is enough',
      badge: "🍜 Easy Posting",
      action: "Food Photo",
      meta: "Quick",
    },
    // Morning routine
    morningRoutine: {
      title: "Morning Coffee Time",
      content: "How about recording the start of your day\nwith morning coffee?",
      badge: "🌅 Morning Routine",
      action: "Write",
      meta: "Morning",
    },
    // Lunch time
    lunchTime: {
      title: "Today's Lunch Menu",
      content: "Did you have a delicious lunch?\nShare it with a food photo!",
      badge: "🍽️ Lunch Time",
      action: "Upload Photo",
      meta: "Lunch Time",
    },
    // Golden hour
    goldenHour: {
      title: "Golden Hour Photo Time",
      content: "The golden light at sunset is the most beautiful!\nIt's a great time for emotional photos",
      badge: "📸 Golden Hour",
      action: "See Photo Tips",
      meta: "Golden Hour",
    },
    // Monday motivation
    mondayMotivation: {
      title: "Start of the Week, Monday!",
      content: "How about sharing your goals\nand plans for this week?",
      badge: "💪 Monday",
      action: "Write",
      meta: "Motivation",
    },
    // Friday mood
    fridayMood: {
      title: "It's Friday!",
      content: "Share your weekend plans\nto reward yourself for a hard week",
      badge: "🎉 TGIF",
      action: "Write",
      meta: "Weekend Start",
    },
    // Weekend vibes
    weekendVibes: {
      title: "Relaxing Weekend",
      content: "How about recording your weekend\noutings or rest time?",
      badge: "🌈 Weekend",
      action: "Write",
      meta: "Weekend",
    },
    // Rainy day
    rainyDay: {
      title: "Emotional Rainy Day",
      content: "Share indoor activities with the sound of rain\nor emotional thoughts",
      badge: "🌧️ Emotional Time",
      action: "Write",
      meta: "Indoor",
    },
    // Sunny day
    sunnyDay: {
      title: "Beautiful Weather",
      content: "Tell us about outdoor activities\nor walk stories under the clear sky",
      badge: "☀️ Sunny",
      action: "Write",
      meta: "Outdoor",
    },
    // 10 posts milestone
    milestone10: {
      title: "This is Your 10th Post!",
      content: "Your consistent writing is awesome!\nShare your experience so far",
      badge: "🏆 Achievement",
      action: "Share Experience",
      meta: "Consistency",
    },
    // Writing time
    writingTime: {
      title: "It's Writing Time!",
      content: "You often write at this time!\nHow about a great post today?",
      action: "Write Now",
    },
    // Recent photos
    recentPhotos: {
      title: "Use Your Recent Photos",
      content: "Select one of the photos in your gallery\nand create a wonderful story",
      badge: "📱 Photo Utilization",
      action: "Select Photo",
      meta: "Gallery",
    },
    // Trending topic
    trendingTopic: {
      title: "Hot Topic Right Now",
      content: "Write about trending topics\nthat many people are interested in",
      badge: "🔥 Trending",
      action: "See Trends",
      meta: "Popular Topics",
    },
    // Simple daily
    simpleDaily: {
      title: "Simple Daily Stories",
      content: "Even small things that happened today\ncan become precious records",
      badge: "☕ Daily",
      action: "Record Daily Life",
      meta: "Small Happiness",
    },
    // Polish text
    polishText: {
      title: "Polish Your Written Text",
      content: "If you have already written text,\nAI will make it more beautiful",
      badge: "✨ Polish",
      action: "Polish Text",
      meta: "Improve",
    },
    // Improve writing
    improveWriting: {
      title: "Improve Your Writing Skills",
      content: "How about challenging yourself\nto write a bit longer than usual?",
      badge: "📚 Growth",
      action: "Take Challenge",
      meta: "Skill Up",
    },
    // Pet photo
    petPhoto: {
      title: "Show Off Your Cute Pet",
      content: "Share the cute appearance of your pet\nwith everyone",
      badge: "🐾 Pet",
      action: "Show Off",
      meta: "Healing",
    },
    // Weather talk
    weatherTalk: {
      title: "How's the Weather Today?",
      content: "How about talking about your mood\nor plans according to the weather?",
      badge: "🌤️ Weather",
      action: "Weather Talk",
      meta: "Daily",
    },
    // Weekend rest
    weekendRest: {
      title: "Rest Well on Weekends",
      content: "After a busy week,\nenjoy a relaxing rest",
      badge: "😴 Rest",
      action: "Record Rest",
      meta: "Recharge Time",
    },
    // Coffee time
    coffeeTime: {
      title: "Leisure of a Cup of Coffee",
      content: "Record the moment of drinking coffee\nat your favorite cafe or at home",
      badge: "☕ Coffee",
      action: "Coffee Story",
      meta: "Cafe Culture",
    },
    // Daily moment
    dailyMoment: {
      title: "Record This Moment",
      content: "No need to be special\nSmall moments in daily life are the most precious",
      badge: "📝 Daily Record",
      action: "Record",
      meta: "Anytime",
    },
    // Simple thoughts
    simple: {
      title: "Just One Thought Today",
      content: "No need to think complicated\nJust write down one thought that comes to mind",
      badge: "💭 Simple Thought",
      action: "Write Thought",
      meta: "Simply",
    },
    // Gratitude
    gratitude: {
      title: "Is There Something You're Grateful for Today?",
      content: "Even small things are good\nExpress your gratitude",
      badge: "🙏 Gratitude",
      action: "Express Gratitude",
      meta: "Peaceful Mind",
    },
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
    label: "tokens",
    usage: {
      today: "Used {{count}} today",
    },
    actions: {
      getFree: "Get Free",
      charge: "Buy More"
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
  plans: {
    free: {
      name: "Free",
      priceDisplay: "Free",
    },
  },

  // Token Purchase
  tokenPurchase: {
    title: "Token Purchase",
    sections: {
      planBenefit: "Plan Benefit",
      planBenefitDesc: "{{bonusRate}}% bonus tokens",
      planDiscountDesc: "{{discount}}% discount",
      firstPurchase: "First Purchase Special Offer",
      firstPurchaseDesc: "Additional 30% discount for purchases of 30 or more tokens!",
      maxPlanNotice: "MAX Plan Active",
      maxPlanNoticeDesc: "You have unlimited tokens, so no additional purchase needed",
      advantages: "Token Purchase",
      bulkDiscount: "Bulk Benefits",
      bulkDiscountDesc: "Up to 50% off + plan discounts",
      flexibleUse: "Flexible Use",
      flexibleUseDesc: "Buy when needed, no subscription",
      permanentOwnership: "Keep Forever",
      permanentOwnershipDesc: "No expiration on purchased tokens",
      planBenefits: "Plan Perks",
      planBenefitsDesc: "Extra tokens with subscription",
      comparison: "Tokens vs Subscriptions",
      whenToPurchase: "Best for occasional users",
      whenToPurchaseDesc: "• Irregular usage • Project-based work • No subscription commitment",
      subscriptionAdvantages: "Subscription Benefits",
      subscriptionAdvantagesDesc: "• STARTER: {{starterPrice}} = 600 tokens • PREMIUM: {{premiumPrice}} = 1,100 tokens • Ad-free + premium features",
      trust: {
        securePayment: "Secure",
        instantRefund: "Refunds",
        support247: "24/7"
      }
    },
    packages: {
      light: {
        name: "Light Pack",
        tagline: "Easy to start"
      },
      bestValue: {
        name: "Best Value",
        tagline: "Most popular choice"
      },
      mega: {
        name: "Mega Pack",
        tagline: "For heavy users"
      },
      ultra: {
        name: "Ultra Pack",
        tagline: "Ultimate package for professionals"
      }
    },
    pricing: {
      tokens: "{{count}} tokens",
      bonus: "+{{count}} bonus",
      price: "${{price:number}}",
      originalPrice: "${{price:number}}",
      discount: "{{percent}}% off",
      perToken: "${{price}} per token"
    },
    alerts: {
      maxPlanTitle: "MAX Plan Active",
      maxPlanMessage: "You're currently using MAX plan with unlimited tokens.\n\nNo additional token purchase needed. 🚀",
      confirm: "Confirm"
    },
    currency: {
      krw: "₩",
      usd: "$",
      jpy: "¥",
      cny: "¥"
    }
  },

  // Time-based hashtags
  hashtags: {
    timeBased: {
      morning: ["goodmorning", "morninggram", "morningcoffee", "commute", "morningworkout"],
      morningLate: ["morninglife", "brunch", "cafetour", "dailyrecord", "todayscoffee"],
      lunch: ["lunchgram", "lunchtime", "deliciouslunch", "todaysmenu", "lunchrecommendation"],
      afternoon: ["afternoontea", "cafelife", "dessert", "breaktime", "afternoonrelax"],
      evening: ["dinnergram", "afterwork", "dinnermenu", "homecooking", "todaysday"],
      night: ["goodnight", "latenightsnack", "netflix", "healingtime", "dayend"],
      lateNight: ["dawnvibes", "insomnia", "nightwork", "quiettime", "metime"]
    },
    dayOfWeek: {
      weekend: ["weekendvibes", "weekendlife", "saturdayfeeling", "sundaychill"],
      monday: ["mondayblues", "mondaymotion", "weekstart", "mondayfeeling"],
      friday: ["fridayfeeling", "fridaynight", "weekendplans", "TGIF"]
    },
    seasonal: {
      spring: ["springvibes", "springtime", "cherryblossoms", "springoutfit"],
      summer: ["summervibes", "summertime", "refreshing", "summerdays"],
      autumn: ["autumnvibes", "fallcolors", "autumnleaves", "cozyweather"],
      winter: ["wintervibes", "cozy", "winterfeeling", "christmas"]
    }
  },

  // Achievements
  achievements: {
    title: "Achievements",
    headerTitle: "Achievements",
    overallProgress: "Overall Progress",
    categories: {
      all: "All",
      writing: "Writing",
      style: "Style",
      social: "Social",
      special: "Special"
    },
    categoryNames: {
      writing: "Writing",
      style: "Style",
      social: "Social",
      special: "Special"
    },
    rarity: {
      common: "Common",
      rare: "Rare",
      epic: "Epic",
      legendary: "Legendary"
    },
    modal: {
      category: "Category",
      rarity: "Rarity",
      progress: "Progress",
      unlockedAt: "Unlocked At",
      selectBadge: "Set as Representative Badge",
      success: "Success",
      setBadgeSuccess: "Representative achievement has been set!",
      error: "Error",
      setBadgeError: "Failed to set representative achievement."
    },
    status: {
      completed: "Completed",
      empty: "No achievements unlocked yet"
    },
    progressTemplate: "{{achieved}} of {{total}} achievements unlocked",
    items: {
      // Writing achievements
      first_post: {
        name: "First Steps",
        description: "Posted your first content"
      },
      post_3: {
        name: "Rookie Writer",
        description: "Posted 3 contents"
      },
      post_7: {
        name: "Weekly Writer",
        description: "Posted 7 contents"
      },
      post_15: {
        name: "Consistent Writer",
        description: "Posted 15 contents"
      },
      post_30: {
        name: "Monthly Writer",
        description: "Posted 30 contents"
      },
      post_50: {
        name: "Passionate Writer",
        description: "Posted 50 contents"
      },
      post_100: {
        name: "Hundred Victories",
        description: "Posted 100 contents"
      },
      post_200: {
        name: "Professional Writer",
        description: "Posted 200 contents"
      },
      post_365: {
        name: "Daily Writer",
        description: "Posted 365 contents"
      },
      post_500: {
        name: "Legendary Writer",
        description: "Posted 500 contents"
      },
      post_1000: {
        name: "Thousand Stories",
        description: "Posted 1000 contents"
      },

      // Style achievements
      minimal_master: {
        name: "Minimal Master",
        description: "Completed Minimal Week challenge"
      },
      story_teller: {
        name: "Storyteller",
        description: "Completed Story Month challenge"
      },
      trend_hunter: {
        name: "Trend Hunter",
        description: "Completed Trend Hunter challenge"
      },
      all_style_master: {
        name: "All-Round Stylist",
        description: "Mastered all styles"
      },

      // Social achievements
      first_share: {
        name: "First Share",
        description: "Shared content to social media"
      },
      share_10: {
        name: "Share Master",
        description: "Shared 10 times"
      },
      invite_friend: {
        name: "First Invite",
        description: "Invited a friend"
      },
      influencer: {
        name: "Influencer",
        description: "Invited 10 friends"
      },

      // Special achievements
      early_bird: {
        name: "Early Bird",
        description: "Posted at 5 AM"
      },
      night_owl: {
        name: "Night Owl",
        description: "Posted at 2 AM"
      },
      lunch_writer: {
        name: "Lunch Writer",
        description: "Posted during lunch time"
      },
      weekend_warrior: {
        name: "Weekend Warrior",
        description: "Posted 5+ times on weekend"
      },
      streak_7: {
        name: "Week Streak",
        description: "Posted 7 days in a row"
      },
      streak_30: {
        name: "Month Streak",
        description: "Posted 30 days in a row"
      },
      streak_100: {
        name: "Hundred Day Streak",
        description: "Posted 100 days in a row"
      },
      new_year: {
        name: "New Year's First",
        description: "Posted on January 1st"
      },
      birthday_post: {
        name: "Birthday Post",
        description: "Posted on your birthday"
      },
      christmas_post: {
        name: "Christmas Post",
        description: "Posted on Christmas"
      },
      perfect_week: {
        name: "Perfect Week",
        description: "Posted every day for a week"
      },
      comeback: {
        name: "The Return",
        description: "Posted again after a break"
      },
      posty_veteran: {
        name: "Posty Veteran",
        description: "Used Posty for over a year"
      }
    }
  },

  // Style Selector
  styleSelector: {
    title: "Which style would you like to write in?"
  },

  // Unified Styles
  styleTemplates: {
    minimalist: {
      name: "Minimalist",
      description: "Clean and simple style",
      detailedDescription: "Remove unnecessary adjectives. One message per sentence, don't fear whitespace. Clean writing with only essentials makes it easy for readers to understand."
    },
    storytelling: {
      name: "Formal", 
      description: "Elegant written expression",
      detailedDescription: "Use professional and polite language. Complete sentences with clear conclusions. Build trust with formal expressions."
    },
    humorous: {
      name: "Humorous",
      description: "Witty and cheerful expression",
      detailedDescription: "Make readers laugh with jokes and wit. Add warmth with natural humor. Keep it witty without being forced."
    },
    trendsetter: {
      name: "Trendsetter",
      description: "Style reflecting latest trends",
      detailedDescription: "Use new words and trendy expressions. Create fresh flows and content. Lead trends with innovative ideas."
    },
    philosopher: {
      name: "Philosopher",
      description: "Deep and thoughtful style",
      detailedDescription: "Use metaphors to avoid extreme thinking. Provide thoughtful content about life's essence. Lead to reflection with deep insights."
    },
    casual: {
      name: "Casual",
      description: "Friendly and comfortable everyday tone",
      detailedDescription: "Convey warmth with daily conversational tone. Talk naturally like to a friend. Communicate comfortably without obligation."
    },
    professional: {
      name: "Professional",
      description: "Formal and trustworthy business tone",
      detailedDescription: "Base on accurate data and facts. Add clear explanations to technical terms. Build trust with authoritative communication."
    },
    emotional: {
      name: "Emotional",
      description: "Warm expression with feelings",
      detailedDescription: "Share honest feelings and experiences. Express emotions sincerely. Create empathy within appropriate bounds."
    },
    genz: {
      name: "Gen Z",
      description: "Trendy expression unique to Gen Z",
      detailedDescription: "Use internet slang and abbreviations naturally. Fast-paced with fresh perspectives. Communicate with trendy generational expressions."
    },
    millennial: {
      name: "Millennial",
      description: "Emotional expression of millennials",
      detailedDescription: "Capture nostalgia and memories with emotion. Create sweet atmosphere. Add uniqueness within modest bounds."
    },
    motivational: {
      name: "Quotes",
      description: "Beautiful and profound philosophical insights",
      detailedDescription: "Inspire with concise but powerful messages. Provide thoughtful content and motivation. Lead to action with profound insights."
    }
  },


  // Contact
  contact: {
    title: "Contact Us",
    email: {
      title: "Contact via Email",
      address: "getposty@gmail.com",
      actions: {
        copy: "Copy",
        openApp: "Open Email App"
      }
    },
    form: {
      emailTitle: "Contact via Email",
      copy: "Copy",
      openEmail: "Open Email App",
      quickInquiry: "Quick Inquiry",
      quickInquiryDesc: "Fill out the form below to send directly from your email app",
      categories: {
        bug: "Bug Report",
        feature: "Feature Request",
        payment: "Payment Inquiry",
        other: "Other Inquiry"
      },
      subject: "Subject",
      subjectPlaceholder: "Enter your inquiry subject",
      message: "Message",
      messagePlaceholder: "Enter detailed information",
      sendEmail: "Send via Email",
      responseTime: "We respond within 24 hours on weekdays",
      languages: "Inquiries available in Korean and English"
    },
    info: [
      "We respond within 24 hours on weekdays",
      "Inquiries available in Korean and English"
    ],
    alerts: {
      copySuccess: {
        title: "Copied",
        message: "getposty@gmail.com has been copied to clipboard!"
      },
      emailOpenFailed: {
        title: "Cannot open email app",
        message: "Please copy getposty@gmail.com and send email directly.",
        actions: {
          cancel: "Cancel",
          copy: "Copy Email"
        }
      },
      emailOpened: {
        title: "Email app opened",
        message: "Subject: [{{category}}] {{subject}}\n\n{{content}}\n\nPlease copy the content above and paste it into your email.",
        actions: {
          copyContent: "Copy Content",
          confirm: "Confirm"
        }
      },
      contentCopied: {
        title: "Copied",
        message: "Email content has been copied."
      },
      allFieldsRequired: {
        title: "Notice",
        message: "Please fill in all fields."
      },
      fullContentCopy: {
        title: "Copied",
        message: "All email information has been copied."
      }
    },
    notifications: {
      dailyShare: {
        title: "🌅 How was your day?",
        body: "Posty will help you turn today's precious moments into beautiful posts!"
      }
    }
  },

  // Notification Center
  notificationCenter: {
    title: "Notification Center",
    clearAll: "Clear All",
    noNotifications: "No new notifications",
    noNotificationsSubtext: "Posty will deliver new news to you!"
  },

  // Legal Documents
  legal: {
    termsOfService: {
      title: "Terms of Service",
      lastUpdated: "Last updated: January 1, 2024",
      companyName: "Tinrobot Studio",
      content: `# Terms of Service

Effective Date: January 1, 2024

Company: Tinrobot Studio

## Article 1 (Purpose)

These terms and conditions (the "Terms") govern the use of the AI-based SNS content generation service "Posty" (the "Service") provided by Tinrobot Studio (the "Company"). These Terms establish the conditions and procedures for using the Service, as well as the rights, obligations, and responsibilities of the Company and users.

## Article 2 (Definitions)

The definitions of terms used in these Terms are as follows:

**"Service"** means all services related to AI-based SNS content generation and management provided by the Company.

**"User"** means any person who uses the Service in accordance with these Terms.

**"Content"** means all forms of information generated, stored, and shared by users through the Service.

**"AI-Generated Content"** means text, image analysis results, and other content generated through the Service's artificial intelligence features.

## Article 3 (Effectiveness and Changes of Terms)

These Terms are effective for all users who wish to use the Service.

The Company may change these Terms within the scope not violating relevant laws and regulations when necessary, and the changed Terms will be announced through the Service's notice board.

If users do not agree to the changed Terms, they may discontinue using the Service and withdraw.

## Article 4 (Service Provision)

The services provided by the Company are as follows:

**AI-based SNS content generation service**

**SNS trend analysis and insights provision**

**User writing style analysis**

**SNS account integration and post management**

**Other services developed or provided through partnerships by the Company**

## Article 5 (Service Use)

Users may use the Service in accordance with the procedures established by the Company.

Users must comply with relevant laws and regulations when using the Service.

Users must not generate content that infringes on others' rights or violates public order and morals.

## Article 6 (Privacy Protection)

The Company makes every effort to protect users' personal information.

Matters regarding the collection, use, and provision of personal information are subject to the Company's Privacy Policy.

The Company does not provide personal information to third parties without users' consent.

## Article 7 (Rights and Responsibilities of Content)

Copyright of content created by users belongs to the users.

AI-generated content may be freely used, modified, and distributed by users.

Users are responsible for all content they create.

The Company may analyze users' content for service improvement, but this is used only in anonymized form.

## Article 8 (Service Use Restrictions)

The Company may restrict service use in the following cases:

Violation of these Terms

Creation of content that infringes on others' rights

Interference with normal service operation

Other violations of relevant laws and regulations

## Article 9 (Disclaimer)

The Company is not responsible for service interruptions due to force majeure such as natural disasters or war.

The Company does not guarantee the accuracy of information or materials obtained through the Service.

The Company does not intervene in disputes between users or between users and third parties.

## Article 10 (Governing Law and Jurisdiction)

These Terms are governed by and interpreted in accordance with the laws of the Republic of Korea.

Disputes arising from the use of the Service shall be subject to the exclusive jurisdiction of the court having jurisdiction over the Company's headquarters.

## Article 11 (Artificial Intelligence Technology Use)

1. **AI Technology Utilization**

   - This Service uses artificial intelligence technology based on OpenAI's GPT model to provide the following services:

     * Automatic content generation

     * Text improvement and enhancement

     * Photo-based content generation

     * Personalized writing recommendations

2. **Characteristics of AI-Generated Content**

   - The Company does not guarantee the accuracy, appropriateness, completeness, or copyright infringement of AI-generated content.

   - Users should use AI-generated content only as reference and must review and take responsibility for the content before final use.

   - Users must be aware that AI-generated content may infringe on third-party rights or contain inappropriate content.

3. **Data Processing**

   - Data such as text and photos input by users may be transmitted to external AI service providers (such as OpenAI) for service provision.

   - Transmitted data is used only for service provision purposes and is processed in accordance with the Privacy Policy.

4. **Service Changes**

   - The Company may modify AI functions with prior notice for AI model updates, changes, or service improvements.

   - New features may be added or existing features may be changed as AI technology advances.

5. **Disclaimer**

   - The Company is not responsible for direct or indirect damages caused by AI-generated content.

   - Users bear all legal responsibilities arising from the use of AI-generated content.

---

Contact: getposty@gmail.com

Privacy Officer: privacy@getposty.ai`
    },
    privacyPolicy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: January 1, 2024",
      companyName: "Tinrobot Studio",
      content: `# Privacy Policy

Effective Date: January 1, 2024

Company: Tinrobot Studio

Tinrobot Studio (the "Company") values users' personal information and complies with relevant laws and regulations including the Personal Information Protection Act and the Act on Promotion of Information and Communications Network Utilization and Information Protection.

The Company informs users about how their personal information is collected, used, and what measures are taken to protect personal information through this Privacy Policy.

## 1. Personal Information Items Collected

The Company collects the following personal information for service provision:

### Required Collection Items

• **At registration:** Name, email address

• **When linking SNS accounts:** SNS account information, access tokens

• **When using the service:** Generated content, usage records

### Automatically Collected Items

• **Device information:** Device model, OS version, app version

• **Log information:** Service usage records, access time

• **Information obtained through cookies and similar technologies**

## 2. Purpose of Personal Information Collection and Use

The Company uses collected personal information for the following purposes:

• **Member management:** Identity verification and personal identification for membership services

• **Service provision:** AI content generation, SNS account integration, trend analysis

• **Service improvement:** New service development, user experience improvement

• **Marketing and advertising:** Event information provision, personalized service provision

• **Legal obligation compliance:** Compliance with obligations under relevant laws

## 3. Retention and Use Period of Personal Information

• The Company retains and uses personal information while users use the service.

• Personal information is destroyed immediately upon member withdrawal. However, if preservation is necessary under relevant laws, it will be retained for the specified period.

### Retention Periods Under Relevant Laws

• **Records related to contracts or withdrawal of subscription:** 5 years

• **Records related to payment and supply of goods:** 5 years

• **Records related to consumer complaints or dispute resolution:** 3 years

• **Records related to display and advertising:** 6 months

## 4. Provision of Personal Information to Third Parties

• The Company does not provide users' personal information to third parties in principle.

• However, exceptions are made in the following cases:

• When users have given prior consent

• When required by law

• When requested by investigative agencies

### Advertising Service Providers

• **Google AdMob:** Personal information is shared with Google AdMob for personalized advertising. Users can opt out of ad personalization at any time, and information is processed according to Google's Privacy Policy (https://policies.google.com/privacy).

## 5. Destruction of Personal Information

The Company destroys personal information immediately when it becomes unnecessary due to expiration of retention period or achievement of processing purpose.

### Destruction Procedure

Information input by users is moved to a separate database after achieving its purpose and destroyed after a certain period according to internal policies and other relevant laws.

### Destruction Methods

• **Electronic file format:** Using technical methods that cannot reproduce records

• **Paper documents:** Shredding or incineration

## 6. User Rights and Exercise Methods

Users can exercise the following rights at any time:

• **Request for access to personal information**

• **Request for correction in case of errors**

• **Request for deletion**

• **Request for suspension of processing**

Rights can be exercised through the app's settings menu or by email (getposty@gmail.com).

## 7. Measures to Ensure Personal Information Security

The Company takes the following measures to protect personal information:

• **Personal information encryption:** Important information such as passwords is encrypted and stored

• **Technical measures against hacking:** Installation and regular updates of security programs

• **Access restriction to personal information:** Limited to minimum necessary personnel

• **Education for personal information processors:** Regular training

## 8. Protection of Children's Personal Information

The Company does not collect personal information from children under 14 years of age. If it becomes known that personal information of children under 14 has been collected, such information will be deleted immediately.

## 9. Personal Information Protection Officer

The Company has designated a Personal Information Protection Officer to oversee personal information processing and handle user complaints and damage relief related to personal information processing:

• **Personal Information Protection Officer:** [Name]

• **Position:** [Position]

• **Contact:** privacy@getposty.ai

## 10. Changes to Privacy Policy

This Privacy Policy applies from the effective date, and when there are additions, deletions, or corrections of changes according to laws and policies, changes will be announced through the notice board 7 days before implementation.

---

Contact: getposty@gmail.com

Personal Information Inquiry: getposty@gmail.com`
    }
  },

  // Token Shop
  tokenShop: {
    title: "Shop",
    subtitle: "Buy what you need and use it unlimitedly",
    currentTokens: "Current Tokens",
    dailyRefill: "Daily auto-refill: 10 tokens at midnight",
    packagesTitle: "Token Packages",
    popular: "Popular",
    bonus: "Bonus +{{count}}",
    buy: "Buy",
    discount: "{{percent}}% off",
    bestValue: "Best Value",
    packageNames: {
      tokens_100: "100 Tokens",
      tokens_200: "200 Tokens",
      tokens_300: "300 Tokens"
    },
    purchase: {
      title: "Token Purchase",
      message: "Purchase {{tokens}} tokens for {{price}}?",
      messageWithBonus: "Purchase {{tokens}} tokens for {{price}}?\n\nBonus {{bonus}} tokens included",
      cancel: "Cancel",
      confirm: "Purchase",
      successTitle: "Purchase Complete!",
      successMessage: "{{tokens}} tokens have been added!",
      errorTitle: "Purchase Failed",
      errorMessage: "Failed to purchase tokens.\nPlease try again.",
    },
    notice: {
      title: "Token System",
      freeTokens: "Free Tokens:",
      freeTokensDesc: "10 tokens only when balance is 0",
      purchasedTokens: "Purchased Tokens:",
      purchasedTokensDesc: "Permanent, never expire",
      usageOrder: "Usage Order:",
      usageOrderDesc: "Free → Purchased",
      adReward: "Watch ads when tokens run out"
    },
    refund: {
      title: "Refund Policy",
      policy: "Tokens are available immediately after purchase. Any usage makes refund impossible.",
      unused: "Refunds are only possible if tokens are completely unused after purchase.",
      contact: "Refund inquiries: getposty@gmail.com",
      terms: "Please refer to Terms of Service for detailed refund policy."
    }
  }
};

export default en;
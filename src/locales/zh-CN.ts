export default {
  common: {
    confirm: "确认",
    cancel: "取消",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    close: "关闭",
    back: "返回",
    next: "下一步",
    loading: "加载中...",
    error: "发生错误",
    success: "成功",
    warning: "警告",
    info: "信息",
    yes: "是",
    no: "否",
    ok: "确定",
    retry: "重试",
    skip: "跳过",
    done: "完成",
    continue: "继续",
    finish: "结束",
    start: "开始",
    stop: "停止"
  },

  navigation: {
    home: "首页",
    trending: "趋势",
    aiWrite: "AI写作",
    myStyle: "我的风格",
    settings: "设置"
  },

  settings: {
    title: "设置",
    language: "语言",
    languageTitle: "语言设置",
    languageDescription: "选择应用语言"
  },

  subscription: {
    title: "高级计划",
    subtitle: "解锁所有功能",
    popular: "热门",
    currentPlan: "当前计划",
    upgradeNow: "立即升级",
    manageSubscription: "管理订阅",
    cancelSubscription: "取消订阅",
    renewalDate: "续订日期",
    perMonth: "/月",
    perYear: "/年",
    monthly: "月付",
    yearly: "年付",
    save: "节省{{percentage}}%",
    freeTrial: "免费试用",
    startFreeTrial: "开始免费试用",
    trialEnds: "试用结束: {{date}}",
    features: {
      unlimitedTokens: "无限代币",
      allTones: "所有语调",
      allLengths: "所有长度",
      noAds: "无广告",
      myStyleAnalysis: "我的风格分析",
      instantImageAnalysis: "即时图像分析",
      gpt4Turbo: "GPT-4 Turbo",
      apiAccess: "API 访问",
      prioritySupport: "优先支持",
      dailyTokens: "每日{{tokens}}代币",
      monthlyTokens: "每月{{tokens}}代币"
    },
    hero: {
      title: "充分利用Posty",
      subtitle: "通过高级功能将内容创作提升到新水平",
      startTrial: "免费试用7天"
    },
    benefits: {
      title: "高级特权",
      unlimitedCreation: {
        title: "无限创作",
        description: "无限制地创建内容"
      },
      advancedFeatures: {
        title: "高级功能",
        description: "专业级工具"
      },
      prioritySupport: {
        title: "优先支持",
        description: "24小时内回复"
      }
    },
    management: {
      title: "订阅管理",
      currentPlan: "当前计划",
      nextBilling: "下次账单日期",
      managePayment: "管理付款方式",
      viewInvoices: "查看发票",
      cancelPlan: "取消计划",
      upgradePlan: "升级计划"
    },
    earnTokensSection: {
      title: "免费获得代币",
      dailyCheckin: {
        title: "每日签到",
        description: "每天登录获得{{tokens}}代币",
        button: "签到 ({{tokens}}代币)"
      },
      watchAd: {
        title: "观看广告",
        description: "观看短广告获得{{tokens}}代币",
        button: "观看广告 ({{tokens}}代币)"
      },
      shareApp: {
        title: "分享应用",
        description: "向朋友推荐应用获得{{tokens}}代币",
        button: "分享 ({{tokens}}代币)"
      },
      reviewApp: {
        title: "评价应用",
        description: "在App Store评价获得{{tokens}}代币",
        button: "评价 ({{tokens}}代币)"
      }
    }
  },

  aiWrite: {
    title: "用Posty写作",
    subtitle: "想写什么故事呢？",
    placeholder: "在这里输入文本...",
    errors: {
      imageSelection: "选择图像时发生错误。",
      cameraAccess: "使用相机时发生错误。"
    },
    
    sections: {
      selectTone: "选择什么语调？",
      selectLength: "写多长？",
      additionalOptions: "附加选项",
      photoUpload: "照片上传",
      result: "结果",
      polish: "润色文本"
    },
    
    tones: {
      casual: {
        name: "随意",
        description: "亲切自然的语调"
      },
      professional: {
        name: "专业",
        description: "正式精练的表达"
      },
      humorous: {
        name: "幽默",
        description: "有趣好玩的表达"
      },
      emotional: {
        name: "感性",
        description: "情感丰富触动人心"
      },
      genz: {
        name: "Z世代",
        description: "时尚现代"
      },
      millennial: {
        name: "千禧一代",
        description: "千禧一代的风格"
      },
      minimalist: {
        name: "极简",
        description: "简洁明了"
      },
      storytelling: {
        name: "叙事",
        description: "故事性引人入胜"
      },
      motivational: {
        name: "励志",
        description: "鼓舞和激励"
      }
    },
    
    lengths: {
      short: {
        name: "短",
        description: "1-2句，简洁"
      },
      medium: {
        name: "中等",
        description: "1段，详细"
      },
      long: {
        name: "长",
        description: "多段，完整"
      }
    },
    
    modes: {
      write: "写作",
      improve: "改进",
      translate: "翻译"
    },
    
    photoUpload: {
      title: "用图片写作",
      description: "上传照片生成内容",
      selectImage: "选择图片",
      takePhoto: "拍照",
      fromGallery: "从相册选择",
      analyzing: "分析图片中...",
      analysisComplete: "分析完成",
      analysisError: "图片分析失败",
      noImageSelected: "未选择图片"
    },
    
    polishOptions: {
      summarize: {
        name: "总结",
        description: "简洁概括要点"
      },
      simple: {
        name: "简化",
        description: "通俗易懂的表达"
      },
      formal: {
        name: "正式",
        description: "正式庄重的表达"
      },
      emotion: {
        name: "情感",
        description: "注入情感"
      },
      storytelling: {
        name: "故事",
        description: "故事化表达"
      },
      engaging: {
        name: "吸引",
        description: "引人入胜"
      },
      hashtag: {
        name: "标签",
        description: "添加相关标签"
      },
      emoji: {
        name: "表情",
        description: "添加合适的表情"
      },
      question: {
        name: "问题",
        description: "问题形式"
      }
    },
    
    actions: {
      generate: "生成",
      regenerate: "重新生成",
      copy: "复制",
      share: "分享",
      save: "保存",
      edit: "编辑",
      delete: "删除",
      polish: "润色",
      translate: "翻译",
      analyze: "分析"
    },
    
    status: {
      generating: "生成中...",
      polishing: "润色中...",
      translating: "翻译中...",
      analyzing: "分析中...",
      completed: "完成",
      error: "错误",
      cancelled: "已取消"
    },
    
    errors: {
      noInput: "请输入文本",
      tooLong: "文本太长",
      networkError: "网络错误",
      serverError: "服务器错误",
      rateLimitExceeded: "超过使用限制",
      insufficientTokens: "代币不足"
    },
    
    tokens: {
      remaining: "剩余代币: {{count}}",
      used: "已用代币: {{count}}",
      required: "需要代币: {{count}}",
      insufficient: "代币不足",
      purchaseMore: "购买更多"
    }
  },

  myStyle: {
    title: "我的风格",
    subtitle: "分析您的写作风格",
    description: "分析过往投稿，学习您独特的文体",
    profileCompletion: "个人资料完成度 {{completeness}}%",
    interests: "兴趣（多选）",
    formality: "正式程度",
    emotiveness: "情感表达",
    humor: "幽默感",
    saveProfile: "保存个人资料",
    
    access: {
      freeMessage: "从STARTER计划开始可使用我的风格功能",
      upgradeButton: "升级计划"
    },
    
    analysis: {
      title: "风格分析",
      inProgress: "分析中...",
      completed: "分析完成",
      noData: "没有数据可供分析"
    },
    
    templates: {
      title: "我的模板",
      create: "创建模板",
      edit: "编辑",
      delete: "删除",
      duplicate: "复制"
    }
  },

  // MyStyle Screen
  mystyle: {
    title: "我的风格",
    subtitle: "建立你自己的内容品牌",
    loading: "分析风格中...",
    refresh: "刷新",
    empty: {
      title: "还没有创建内容",
      subtitle: "用Posty创建你的第一个内容！",
      startWriting: "开始写作"
    },
    tabs: {
      templates: "模板"
    },
    templates: {
      title: "风格模板",
      subtitle: "尝试各种风格，找到你自己的风格",
      starterLimit: "STARTER计划：仅可使用{{limit}}个模板"
    },
  },
  
  trends: {
    title: "实时趋势",
    subtitle: "实时热门趋势和关键词",
    errors: {
      loadFailed: "加载趋势失败",
      refreshFailed: "刷新趋势失败"
    },
    premium: {
      title: "高级功能",
      subtitle: "实时趋势需要高级计划",
      upgradeButton: "升级计划",
      preview: {
        title: "趋势预览"
      }
    }
  },

  trending: {
    title: "趋势",
    subtitle: "当前热门话题",
    categories: {
      all: "全部",
      technology: "科技",
      lifestyle: "生活方式",
      business: "商业",
      entertainment: "娱乐",
      sports: "体育",
      news: "新闻"
    },
    updateFrequency: {
      realtime: "实时",
      daily: "每日更新"
    }
  },
  
  tokens: {
    title: "代币",
    balance: "余额",
    purchase: "购买",
    earn: "获得",
    history: "历史",
    packages: {
      title: "代币套餐",
      small: "30代币",
      medium: "100代币",
      large: "300代币",
      xlarge: "1000代币"
    },
    earn: {
      title: "免费获得代币",
      dailyBonus: "每日奖励",
      watchAd: "观看广告",
      shareApp: "分享应用",
      rateApp: "评价应用"
    }
  },

  language: {
    korean: "한국어",
    english: "English", 
    japanese: "日本語",
    chinese: "中文"
  },
  
  currencies: {
    KRW: "₩",
    USD: "$",
    JPY: "¥",
    CNY: "¥"
  },
  
  errors: {
    generic: "发生错误",
    network: "请连接网络",
    server: "服务器错误",
    unauthorized: "需要认证",
    forbidden: "访问被拒绝",
    notFound: "未找到",
    validation: "请检查输入内容",
    timeout: "超时"
  },
  
  success: {
    generic: "成功",
    saved: "已保存",
    updated: "已更新",
    deleted: "已删除",
    created: "已创建",
    uploaded: "已上传",
    downloaded: "已下载",
    shared: "已分享",
    copied: "已复制"
  },

  // App
  app: {
    name: "Posty",
    tagline: "AI驱动的创意内容",
    slogan: "AI写作，我发光",
    subTagline: "1分钟内完成完美发布",
    description: "只需一张照片即可完成精彩发布",
    slogan1: "与世界分享\n你的故事。",
    slogan2: "简单的一行\n变成特殊时刻。",
    slogan3: "Posty会帮助你。\n更好的写作。",
    slogan4: "我们开始吧？",
  },

  // Navigation
  navigation: {
    home: "首页",
    write: "写作",
    trend: "趋势",
    myStyle: "我的风格",
    settings: "设置",
  },

  // Home Screen
  home: {
    greeting: "",
    defaultUserName: "朋友",
    navigation: {
      subscription: "订阅"
    },
    welcome: {
      title: "欢迎来到Posty！",
      message: "要不要写你的第一篇帖子？我来帮你！",
      action: "写第一篇帖子",
      subMessage: "从日常生活中的简单事情开始。Posty会把它变成很棒的内容！"
    },
    greetings: {
      dawn: {
        title: "{{userName}}，感受黎明氛围？",
        message: "这个时间的想法很特别。想记录下来吗？",
        action: "黎明写作"
      },
      morning: {
        title: "早上好！{{userName}}",
        message: "今天要发布什么？即使是早晨咖啡照片也很棒！",
        action: "早晨分享"
      },
      lunch: {
        title: "{{userName}}，吃午饭了吗？",
        message: "如果吃了什么好吃的，应该炫耀一下！",
        action: "午餐评价"
      },
      afternoon: {
        title: "{{userName}}，下午继续加油！",
        message: "即使是简短的帖子也可以。让我们记录今天的这一刻",
        messageRegular: "你今天已经写了{{postCount}}篇帖子！太棒了👍",
        action: "日常分享"
      },
      evening: {
        title: "{{userName}}，今天怎么样？",
        message: "写一篇帖子来结束这一天怎么样？即使是简单的内容也很好",
        action: "晚间思考"
      },
      night: {
        title: "{{userName}}，还没睡吗？",
        message: "睡觉前想记录今天发生的事情吗？",
        action: "夜间写作"
      }
    },
    topics: {
      daily: "日常",
      weekend: "周末",
      cafe: "咖啡厅",
      food: "美食",
      travel: "旅行",
      exercise: "运动",
      bookstagram: "读书"
    },
    quickTemplates: {
      lunch: ["今天的午餐✨", "发现宝藏！", "这给了我能量"],
      evening: ["今天辛苦了🌙", "明天会更好", "一天结束！"]
    },
    sections: {
      newUserQuestion: "不知道写什么？",
      regularUserQuestion: "今天要发布什么？",
      todayRecommendation: "今天写什么？",
      myPosts: "我的帖子"
    },
    actions: {
      firstWrite: "写第一篇帖子",
      writeAssist: "帮我写",
      photoStart: "从照片开始",
      polishText: "AI文本润色器",
      viewAll: "查看全部",
      copy: "复制",
      share: "分享"
    },
    messages: {
      writeAssistDesc: "即使只有一行我也会让它变得很棒",
      polishTextDesc: "我会自然地润色尴尬的句子",
      photoStartDesc: "只要给我看照片，我就为你写",
      copySuccess: "已复制",
      copySuccessDesc: "已复制到剪贴板"
    },
    templates: {
      weather: {
        title: "天气话题",
        desc: "从今天的天气开始",
        content: "今天天气很好所以"
      },
      food: {
        title: "美食评价",
        desc: "今天吃的美味东西",
        content: "我今天吃了"
      },
      photo: {
        title: "带照片",
        desc: "只需要照片"
      }
    },
    tips: {
      todayTip: "今日提示",
      consistentPosting: "持续发布是关键",
      consistentPostingDesc: "分享即使是小的日常故事也能与你的关注者建立更强的联系！"
    },
    recommend: {
      easy: "🔥 简单",
      easierPhoto: "📸 更简单",
      easyTitle: "从一行开始",
      easyContent: "不需要长帖子！\n只写你今天做了什么",
      photoTitle: "只需要照片！",
      photoContent: "选择照片\n我来写文字！",
      recommended: "推荐",
      convenient: "方便",
      writeButton: "写作",
      photoSelectButton: "选择照片"
    },
    styleCard: {
      title: "我的写作风格",
      consistency: "一致性",
      thisWeek: "本周"
    },
    styleTypes: {
      minimalist: "🎯 极简主义",
      storyteller: "📖 故事讲述者",
      visualist: "📸 视觉主义者",
      trendsetter: "✨ 潮流引领者",
      unique: "🎨 独特风格"
    },
    mainActions: {
      polishTool: "AI文本润色工具",
      polishDesc: "润色尴尬的句子使其自然",
      styleGuide: "我的写作风格",
    },
    quickActions: {
      writePost: "用Posty写作",
      analyzePhoto: "分析照片",
    },
    postActions: {
      copy: "复制",
      share: "分享",
    },
    weeklyCount: {
      thisWeek: "本周",
      consistency: "一致性",
    }
  },

  // Settings
  settings: {
    title: "设置",
    achievements: "成就",
    profileDetails: "个人资料详情",
    profileGuideDefault: "设置你的个人资料",
    tokenManagement: "代币管理",
    appSettings: "应用设置",
    pushNotifications: "推送通知",
    soundEffects: "音效",
    vibration: "振动",
    themeAndColors: "主题和颜色",
    themeDescription: "主题设置",
    support: "支持",
    language: "语言",
    userGuide: "用户指南",
    contact: "联系",
    terms: "服务条款",
    privacy: "隐私政策",
    notifications: {
      enabled: "通知已启用",
      soundEnabled: "声音已启用",
      vibrationEnabled: "振动已启用"
    }
  },

  // Common
  common: {
    error: "错误",
    success: "成功",
    close: "关闭",
    count: "",
    start: "开始",
    skip: "跳过",
    loading: "加载中...",
    later: "稍后"
  },

  // Alerts
  alerts: {
    notifications: {
      enabled: "推送通知已启用",
      disabled: "推送通知已禁用"
    },
    sound: {
      enabled: "声音已启用"
    },
    vibration: {
      enabled: "振动已启用"
    },
    platform: {
      connect: {
        title: "连接{{platform}}",
        message: "连接到{{platform}}？",
        comingSoon: "{{platform}}连接功能即将推出"
      },
      disconnect: {
        title: "断开连接",
        message: "从{{platform}}断开连接？",
        success: "{{platform}}已断开连接",
        failed: "断开连接失败"
      },
      status: {
        connected: "已连接",
        notConnected: "未连接",
        connectAction: "连接"
      }
    },
    purchase: {
      restore: {
        title: "恢复购买",
        message: "恢复购买历史？",
        failedTitle: "恢复失败",
        failed: "恢复购买失败"
      }
    },
    data: {
      clearHistory: {
        title: "清除历史",
        message: "清除历史？",
        success: "历史已清除",
        failed: "清除历史失败"
      },
      deleteAll: {
        title: "删除所有数据",
        message: "删除所有数据？",
        success: "所有数据已删除",
        failed: "删除数据失败"
      }
    },
    auth: {
      logout: {
        title: "退出登录",
        message: "确定要退出登录吗？",
        action: "退出登录"
      }
    },
    rating: {
      title: "评价应用",
      message: "如果满意请评价应用",
      later: "稍后",
      rate: "评价",
      error: "无法打开评价页面"
    },
    tokens: {
      dailyLimitExceeded: {
        title: "每日限制超出",
        message: "每日代币限制({{limit}})已超出"
      },
      partialGrant: {
        title: "部分代币授予",
        message: "已授予{{tokens}}代币"
      }
    },
    buttons: {
      ok: "确定",
      cancel: "取消",
      later: "稍后",
      delete: "删除",
      error: "错误",
      completed: "完成",
      connect: "连接",
      disconnect: "断开连接",
      restore: "恢复",
      close: "关闭"
    },
    language: {
      changed: "语言已更改"
    },
    permission: {
      title: "需要权限",
      message: "请在设置中允许通知权限以接收推送通知。",
      goToSettings: "前往设置"
    },
    testNotification: {
      title: "测试通知",
      message: "您想测试哪种通知？",
      mission: "任务通知",
      trend: "趋势通知",
      token: "代币通知",
      achievement: "成就通知",
      tips: "提示通知",
      send: "发送测试通知"
    }
  },

  // Language
  language: {
    current: "当前语言：{{language}} {{isSystem}}",
    system: "（系统）",
    selectLanguage: "选择语言",
    resetToSystem: "重置为系统语言",
    note: "更改语言时应用将重启"
  }
};

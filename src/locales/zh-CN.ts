export default {
  // 공통
  app: {
    name: "Posty",
    tagline: "AI创作的创意内容",
  },

  // AI 작성 화면
  aiWrite: {
    title: "与Posty一起写作",
    subtitle: {
      text: "想写什么故事呢？我来帮助您！",
      polish: "让您写的文章更加精彩！",
      photo: "给我看照片，我会为您写出合适的文章！",
    },
    modes: {
      text: "新建文章",
      polish: "文章润色",
      photo: "照片文章",
    },
    prompts: {
      text: "想写什么内容呢？",
      polish: "请输入想要润色的文章",
      photo: "请展示照片！",
    },
    tones: {
      casual: "随意",
      professional: "专业",
      humorous: "幽默",
      emotional: "感性",
      genz: "GenZ",
      millennial: "千禧一代",
      minimalist: "简约",
      storytelling: "叙事",
      motivational: "励志",
    },
    lengths: {
      short: "简短",
      medium: "中等",
      long: "详细",
    },
    buttons: {
      generate: "请Posty帮忙",
      generating: "Posty正在写作中...",
      copy: "复制",
      save: "保存",
      share: "分享",
    },
    alerts: {
      noPrompt: "请告诉我想写什么内容！ 🤔",
      noPhoto: "请先选择照片！ 📸",
      success: "完成了！ 🎉",
      error: "出现了问题。请重试 🥺",
    },
  },

  // 토큰 시스템
  tokens: {
    badge: "代币",
    noTokens: "代币不足",
    earnTokens: "获取免费代币",
    subscribe: "代币不足。要订阅吗？",
  },

  // 탭 네비게이션
  tabs: {
    home: "首页",
    aiWrite: "AI创作",
    myStyle: "我的风格",
    settings: "设置",
  },

  // 홈 화면
  home: {
    greeting: "",
    welcome: {
      title: "欢迎来到Posty！",
      message: "试着写第一篇文章怎么样？我来帮助您！",
      action: "第一篇文章",
      subMessage: "从简单的日常开始吧。Posty会把它变成精彩的文章！"
    },
    greetings: {
      dawn: {
        title: "{{userName}}，还在熬夜？",
        message: "这个时间的思绪很特别。要记录下来吗？",
        action: "深夜感性文章"
      },
      morning: {
        title: "早上好！{{userName}}",
        message: "今天要发布什么呢？哪怕是晨咖啡照片也很好！",
        action: "早晨日常分享"
      },
      lunch: {
        title: "{{userName}}，吃午饭了吗？",
        message: "吃了好吃的就要炫耀一下！",
        action: "午餐评价"
      },
      afternoon: {
        title: "{{userName}}，下午也要加油！",
        message: "即使是短文也很好。记录今天的瞬间吧",
        messageRegular: "今天已经写了{{postCount}}篇了！太棒了 👍",
        action: "日常分享"
      },
      evening: {
        title: "{{userName}}，今天过得怎么样？",
        message: "要写一篇结束今天的文章吗？简单一点也很好",
        action: "黄昏感性文章"
      },
      night: {
        title: "{{userName}}，还没睡觉？",
        message: "睡前要记录今天发生的事吗？",
        action: "夜晚感性文章"
      }
    },
    topics: {
      daily: "日常",
      weekend: "周末",
      cafe: "咖啡厅",
      food: "美食",
      travel: "旅行",
      exercise: "运动",
      bookstagram: "读书分享"
    },
    quickTemplates: {
      lunch: ["今天的午餐 ✨", "美食发现！", "吃这个补充能量"],
      evening: ["今天也辛苦了 🌙", "明天会更好", "一天结束！"]
    },
    sections: {
      newUserQuestion: "不知道该写什么？",
      regularUserQuestion: "今天要发布什么？",
      todayRecommendation: "今天写什么？",
      myPosts: "我写的文章"
    },
    actions: {
      firstWrite: "第一篇文章",
      writeAssist: "写作助手",
      photoStart: "照片开始",
      polishText: "AI文章完善工具",
      viewAll: "查看全部",
      copy: "复制",
      share: "分享"
    },
    messages: {
      writeAssistDesc: "哪怕一行字也能让它精彩",
      polishTextDesc: "把不自然的句子变得自然",
      photoStartDesc: "只要给我照片就能写文章",
      copySuccess: "复制完成",
      copySuccessDesc: "已复制到剪贴板"
    },
    templates: {
      weather: {
        title: "天气话题",
        desc: "从今天的天气开始"
      },
      food: {
        title: "美食评价",
        desc: "今天吃的美味"
      },
      photo: {
        title: "用照片",
        desc: "有照片就OK"
      }
    },
    recommend: {
      easy: "🔥 简单",
      easierPhoto: "📸 更简单",
      easyTitle: "从一行开始",
      easyContent: "不需要长文章！\n只写今天做了什么也OK",
      photoTitle: "只要有照片就结束了！",
      photoContent: "选择一张照片\n文章我来写！",
      recommended: "推荐",
      convenient: "简便",
      writeButton: "写作",
      photoSelectButton: "选择照片"
    },
    styleCard: {
      title: "我的写作风格",
      consistency: "一致性",
      thisWeek: "本周"
    },
    styleTypes: {
      minimalist: "🎯 极简主义者",
      storyteller: "📖 故事讲述者",
      visualist: "📸 视觉主义者", 
      trendsetter: "✨ 潮流引领者",
      unique: "🎨 我的独特风格"
    },
    mainActions: {
      polishTool: "AI文本润色工具",
      polishDesc: "让生硬的句子变得自然",
      styleGuide: "我的写作风格",
    },
    quickActions: {
      writePost: "与Posty一起写作",
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
    profileGuideDefault: "请设置个人资料",
    tokenManagement: "代币管理",
    appSettings: "应用设置",
    pushNotifications: "推送通知",
    soundEffects: "声音效果",
    vibration: "震动",
    themeAndColors: "主题和颜色",
    themeDescription: "主题设置",
    support: "客服支持",
    language: "语言",
    userGuide: "用户指南",
    contact: "联系我们",
    terms: "使用条款",
    privacy: "隐私政策",
    notifications: {
      enabled: "通知已启用",
      soundEnabled: "声音已启用",
      vibrationEnabled: "震动已启用"
    }
  },

  // Posts
  posts: {
    styles: {
      casual: "随意",
      professional: "专业",
      humorous: "幽默",
      emotional: "感性",
      genz: "GenZ",
      millennial: "千禧一代",
      minimalist: "简约",
      storytelling: "叙事",
      motivational: "励志"
    },
    categories: {
      daily: "日常",
      cafe: "咖啡厅",
      food: "美食",
      exercise: "运动",
      travel: "旅行",
      fashion: "时尚",
      beauty: "美容",
      other: "其他"
    },
    time: {
      today: "今天",
      yesterday: "昨天"
    },
    actions: {
      copy: "复制",
      copyMessage: "已复制",
      save: "保存",
      saving: "保存中...",
      saveSuccess: "已保存",
      saveError: "保存失败",
      share: "分享"
    },
    input: {
      title: "创作文章",
      contentSection: "内容",
      placeholder: "想写什么内容呢？",
      required: "请输入内容"
    }
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
      enabled: "震动已启用"
    },
    platform: {
      connect: {
        title: "{{platform}} 连接",
        message: "要连接到{{platform}}吗？",
        comingSoon: "{{platform}} 连接功能即将推出"
      },
      disconnect: {
        title: "断开连接",
        message: "要断开{{platform}}连接吗？",
        success: "{{platform}} 连接已断开",
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
        message: "要恢复购买记录吗？",
        failedTitle: "恢复失败",
        failed: "购买恢复失败"
      }
    },
    data: {
      clearHistory: {
        title: "清除历史",
        message: "要删除历史记录吗？",
        success: "历史记录已删除",
        failed: "历史记录删除失败"
      },
      deleteAll: {
        title: "删除所有数据",
        message: "要删除所有数据吗？",
        success: "所有数据已删除",
        failed: "数据删除失败"
      }
    },
    auth: {
      logout: {
        title: "退出登录",
        message: "要退出登录吗？",
        action: "退出登录"
      }
    },
    rating: {
      title: "评价",
      message: "如果您满意这个应用，请给我们评价",
      later: "稍后",
      rate: "评价",
      error: "无法打开评价页面"
    },
    tokens: {
      dailyLimitExceeded: {
        title: "超出日限额",
        message: "已超出日获取代币限额（{{limit}}个）"
      },
      partialGrant: {
        title: "部分代币发放",
        message: "已发放{{tokens}}个代币"
      }
    },
    buttons: {
      ok: "确认",
      cancel: "取消",
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
    }
  },

  // Common
  common: {
    error: "错误",
    success: "成功",
    close: "关闭",
    count: "个"
  },

  // Analytics
  analytics: {
    insights: {
      likesIncrease: "点赞数显著增加！🎉",
      reachGrowth: "触达率爆炸性增长！🚀", 
      topCategory: "{{category}}相关帖子最多",
      highActivity: "您的发帖活动很活跃！👏",
      lowActivity: "建议更频繁地发帖",
    },
    timeSlots: {
      morning: "早晨 (6-9点)",
      forenoon: "上午 (9-12点)",
      lunch: "午餐 (12-15点)", 
      afternoon: "下午 (15-18点)",
      evening: "傍晚 (18-21点)",
      night: "夜晚 (21-24点)",
      dawn: "凌晨 (0-6点)",
    },
    sampleData: {
      categories: ["咖啡厅", "美食", "日常", "运动", "旅行"],
      hashtags: ["日常", "每日"],
      postContent: "示例帖子",
    },
  },

  // Time and Date  
  time: {
    days: ["日", "一", "二", "三", "四", "五", "六"],
    none: "无",
    hour: "点",
  },

  // Subscription Plans
  subscription: {
    plans: {
      free: {
        name: "免费",
        priceDisplay: "免费",
        features: [
          "每日10个代币",
          "3种语调风格", 
          "短/中等长度",
          "包含广告",
        ],
      },
      starter: {
        features: [
          "注册时立即获得300个代币",
          "每日充值10个代币",
          "4种语调风格",
          "可创作长文",
          "移除广告",
          "MyStyle分析",
        ],
      },
      premium: {
        features: [
          "注册时立即获得500个代币", 
          "每日充值20个代币",
          "6种语调风格",
          "所有文本长度",
          "移除广告",
          "MyStyle分析",
          "优先处理",
        ],
      },
      pro: {
        features: [
          "注册时立即获得500个代币",
          "无限代币 (Fair Use)",
          "所有语调风格",
          "优先处理",
          "完全移除广告",
        ],
      },
    },
  },

  // Language
  language: {
    current: "当前语言: {{language}} {{isSystem}}",
    system: "（系统）",
    selectLanguage: "选择语言",
    resetToSystem: "重置为系统语言",
    note: "更改语言后应用将重新启动"
  }
};
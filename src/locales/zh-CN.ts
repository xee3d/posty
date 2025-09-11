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
    stop: "停止",
    count: "个",
    later: "稍后",
    purchase: "购买"
  },

  // Tab Navigation
  tabs: {
    home: "首页",
    aiWrite: "AI写作",
    trend: "趋势",
    myStyle: "我的风格",
    settings: "设置"
  },

  // Navigation
  navigation: {
    home: "首页",
    write: "写作",
    trend: "趋势",
    myStyle: "我的风格",
    settings: "设置",
    
    // 新增的导航相关
    trending: "趋势",
    aiWrite: "AI写作"
  },


  subscription: {
    title: "订阅计划",
    subtitle: "解锁所有功能",
    popular: "热门",
    currentPlan: "当前计划",
    upgradeNow: "立即升级",
    manageSubscription: "管理订阅",
    renewalDate: "续订日期",
    perMonth: "/月",
    perYear: "/年",
    monthly: "月付",
    yearly: "年付",
    save: "节省{{percentage}}%",
    freeTrial: "免费试用",
    startFreeTrial: "开始免费试用",
    trialEnds: "试用结束: {{date}}",
    
    // 新增的中文翻译
    watchVideo: "观看视频",
    alreadyCheckedIn: "今天已经签到过了！",
    alreadyShared: "今天已经分享过SNS了！",
    alreadyRated: "已经评价过应用了。谢谢！",
    tokenPurchase: "代币购买",
    freeTokens: "免费代币",
    
    earnTokens: "获得代币！🎉",
    earnTokensMessage: "您获得了{{tokens}}个代币！",
    watchAd: "观看广告",
    watchAdMessage: "观看30秒广告获得3个代币？",
    inviteFriends: "发送邀请",
    inviteFriendsMessage: "朋友注册后你可以获得5个代币！",
    
    cancelSubscription: "取消订阅",
    cancelSubscriptionMessage: "确定要取消{{planName}}计划订阅吗？\n\n取消后仍可以使用到下次计费日。",
    cancelSubscriptionAction: "取消订阅",
    cancelSubscriptionSuccess: "订阅取消完成",
    cancelSubscriptionSuccessMessage: "订阅已取消。可以继续使用到下次计费日。",
    cancelSubscriptionFailed: "订阅取消失败",
    cancelSubscriptionFailedMessage: "取消订阅时出现问题。请重试。",
    
    confirmSubscription: "确认订阅",
    confirmSubscriptionAction: "订阅",
    subscriptionFailed: "订阅失败",
    subscriptionFailedMessage: "处理订阅时出现问题。请重试。",
    downgradeNotAllowed: "不允许降级",
    downgradeNotAllowedMessage: "不能更改为低级计划。\n\n请取消当前订阅，在到期后重新注册。",
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
      moreTokens: {
        title: "更多代币",
        description: "STARTER共600个(初始300 + 每日额外10个)，PRO共1,100个(初始500 + 每日额外20个)，MAX提供无限代币"
      },
      advancedAI: {
        title: "高级AI模型",
        description: "按计划提供差异化的AI模型 (GPT-4o, GPT-4 Turbo)"
      },
      noAds: {
        title: "移除广告",
        description: "不受干扰，只专注于内容创作"
      }
    },
    management: {
      title: "订阅管理",
      currentPlan: "当前计划",
      monthlyFee: "月费",
      nextBilling: "下次计费日期",
      cancelButton: "取消订阅"
    },
    earnTokensSection: {
      title: "免费获得代币",
      subtitle: "通过各种活动获得免费代币",
      currentTokens: "您目前有{{tokens}}个代币",
      dailyCheckin: {
        title: "每日签到",
        description: "每天登录获得{{tokens}}代币",
        button: "签到 ({{tokens}}代币)"
      },
      watchAd: {
        title: "观看广告",
        description: "+2代币 ({{remaining}}/{{limit}}次剩余)"
      },
      socialShare: {
        title: "SNS分享",
        description: "+3代币 (1/1次剩余)"
      },
      inviteFriend: {
        title: "邀请朋友",
        description: "+5代币 (每位朋友)"
      },
      rateApp: {
        title: "评价应用",
        description: "+10代币 (1次)"
      },
      dailyMission: {
        title: "完成任务",
        description: "+3代币 (每日任务)"
      },
      autoRefill: "免费计划用户每天半夜自动充值10个代币"
    },
    
    // 状态相关
    status: {
      free: "免费",
      label: "代币",
      currentPlan: "当前使用中",
      cannotPurchase: "无法购买",
      subscribeAction: "订阅",
      autoRenewActive: "自动续费已激活",
      autoRenewCanceled: "自动续费已取消"
    },
    
    // 计划描述
    descriptions: {
      signup300: "注册即可获得300个代币",
      signup500: "注册即可获得500个代币",
      unlimitedAccess: "可以使用无限代币",
      upgrade500: "获得额外500个代币",
      downgradeWarning: "警告：免费代币将限制为300个"
    },
    
    // 会员通知
    membershipNotices: {
      free: "免费会员每天自动充值10个代币",
      starter: "STARTER会员注册时获得300个 + 每天额夦10个代币",
      premium: "PRO会员注册时获得500个 + 每天额夦20个代币",
      pro: "MAX会员可以使用无限代币"
    },
    
    // 计划描述
    planDescriptions: {
      free: "每天免贩10个代币",
      starter: "注册时300个 + 每天10个",
      premium: "注册时500个 + 每天20个",
      pro: "无限代币",
      downgradeBlocked: "不能降级到低级计划"
    },
    
    // 计划列表
    plans: {
      free: {
        name: "免费",
        priceDisplay: "免费",
        features: [
          "每日免费10个代币",
          "3种语调风格",
          "短/中等长度",
          "包含广告"
        ]
      },
      starter: {
        name: "入门版",
        priceDisplay: "¥25",
        features: [
          "注册时立即获得300个代币",
          "每天额外充值10个",
          "4种语调风格",
          "可写长文",
          "移除广告",
          "MyStyle分析"
        ]
      },
      premium: {
        name: "高级版", 
        priceDisplay: "¥50",
        features: [
          "注册时立即获得500个代币",
          "每天额外充值20个",
          "6种语调风格",
          "所有文字长度",
          "移除广告",
          "MyStyle分析",
          "优先处理"
        ]
      },
      pro: {
        name: "专业版",
        priceDisplay: "¥99",
        features: [
          "无限代币",
          "所有语调风格",
          "所有文字长度",
          "完全移除广告"
        ]
      }
    },
    
    // 广告相关提示
    alerts: {
      adWatch: {
        unavailable: "无法观看广告",
        defaultMessage: "请稍后重试。"
      },
      mission: {
        complete: "任务完成！🎯",
        failed: "广告观看失败"
      },
      rating: {
        title: "评价应用",
        message: "Posty对您有帮助吗？请留下评价！",
        cancel: "取消",
        rate: "立即评价",
        error: "无法打开商店。"
      },
      share: {
        invitation: {
          title: "邀请使用Posty",
          message: "使用Posty创建 AI驱动的SNS内容！现在就试试吧🚀\nhttps://posty.app"
        }
      }
    },
    confirmSubscriptionMessage: "要订阅{{planName}}计划吗？\n\n{{description}}\n当前代币：{{currentTokens}}个\n变更后：{{afterTokens}}个"
  },

  aiWrite: {
    title: "用Posty写作",
    subtitle: {
      text: "想写什么故事呢？我来帮你！",
      polish: "我会把你的文字打磨得更加出色！",
      photo: "给我看照片，我来写匹配的内容！"
    },
    subtitle_old: "想写什么故事呢？",
    placeholder: "在这里输入文本...",
    placeholderExamples: {
      polish: "例如：今天在咖啡厅和朋友喝咖啡时聊了很久，感觉非常愉快...",
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
      casual: "随意",
      professional: "专业",
      humorous: "幽默",
      emotional: "感性",
      genz: "Z世代",
      millennial: "千禧一代",
      minimalist: "极简",
      storytelling: "文言体",
      motivational: "名言"
    },
    
    lengths: {
      short: "短",
      medium: "中等",
      long: "长"
    },
    
    descriptions: {
      short: "~50字",
      medium: "~150字",
      long: "~300字"
    },
    
    example: "例如",
    
    buttons: {
      generate: "生成",
      generating: "生成中...",
      copy: "复制",
      save: "保存",
      share: "分享"
    },
    
    modes: {
      text: "新文章",
      polish: "文本整理",
      photo: "照片写作",
      write: "写作",
      improve: "改进",
      translate: "翻译"
    },
    
    prompts: {
      text: "你想写什么？",
      polish: "请输入你想整理的文字",
      photo: "选择一张照片！"
    },
    
    prompt: {
      title: "你想写什么？",
      refresh: "刷新",
      trendUpdate: {
        title: "趋势更新",
        message: "已加载最新趋势！"
      }
    },
    
    placeholders: {
      morning: "今天早上过得怎么样？",
      lunch: "午餐吃得开心吗？",
      afternoon: "正在享受下午的悠闲时光吗？",
      evening: "今天过得怎么样？",
      night: "深夜了，在想什么呢？"
    },
    timeBasedPrompts: {
      morning: ["今日早咖啡", "通勤风景", "晨间例程", "晨练", "清晨感触", "早餐菜单"],
      lunch: ["午餐推荐", "下午咖啡时光", "午休时光", "今日午餐", "咖啡店探访", "下午工作"],
      afternoon: ["下午悠闲", "咖啡时间", "准备下班", "下午运动", "一天总结", "晚上计划"],
      evening: ["晚餐菜单", "下班路上", "晚间运动", "一天结束", "夜景欣赏", "晚间休闲"],
      night: ["夜宵时间", "深夜感触", "失眠日常", "凌晨思绪", "夜间工作", "夜间散步"]
    },
    categories: {
      casual: "日常",
      professional: "商务", 
      humorous: "幽默",
      emotional: "情感",
      genz: "潮流",
      millennial: "生活方式",
      minimalist: "极简",
      formal: "正式",
      motivational: "名言"
    },
    
    keywords: {
      morning: ["晨间例行", "咖啡", "通勤", "早餐", "咖啡", "运动"],
      afternoon: ["午餐", "日常生活", "下午", "休息", "散步", "咖啡"],
      evening: ["晚上", "下班", "运动", "爱好", "休息", "餐厅"],
      night: ["夜宵", "网飞", "休息", "日常生活", "爱好", "黎明"]
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
    
    photo: {
      defaultPrompt: "请写一篇与照片相配的自然社交媒体帖子。",
    },
    
    ads: {
      watching: {
        title: "观看广告中",
        message: "正在观看广告，请稍等。",
      },
      complete: {
        title: "广告观看完成",
        messageStyle: "您现在可以免费使用一次高级风格！",
        messageLength: "您现在可以免费使用一次高级长度！",
      },
      error: "观看广告失败，请重试。",
    },
    
    premium: {
      title: "高级功能 🌟",
      styleTitle: "高级风格",
      lengthTitle: "高级长度",
      viewPlans: "查看计划",
      watchAd: "观看广告（一次使用）",
      upgrade: "升级",
      oneTimeUse: "一次使用",
    },
    
    tokenUsage: {
      photoWrite: "照片写作",
      polish: "文本润色",
      newPost: "新帖子",
    },
    
    tokens: {
      remaining: "剩余代币: {{count}}",
      used: "已用代币: {{count}}",
      required: "需要代币: {{count}}",
      insufficient: "代币不足",
      purchaseMore: "购买更多"
    }
  },

  // AI 提示
  aiPrompts: {
    length: {
      short: "[长度：请简洁地在50字内写作]",
      medium: "[长度：请在100-150字之间适中地写作]",
      long: "[长度：请详细丰富地在200-300字写作]"
    }
  },

  myStyle: {
    title: "我的风格",
    subtitle: "建立你自己的内容品牌",
    loading: "分析风格中...",
    access: {
      freeMessage: "我的风格分析功能从STARTER计划开始提供。",
      upgradeButton: "升级计划"
    },
    empty: {
      title: "还没有创建内容",
      subtitle: "用Posty创建你的第一个内容！"
    },
    brand: {
      title: "品牌",
      styleAnalysis: "风格分析",
      tagline: "由{{count}}个故事创建的我的独特风格"
    },
    analysis: {
      title: "写作分析",
      inProgress: "分析中...",
      completed: "分析完成",
      noData: "没有数据可供分析",
      totalPosts: "总共{{count}}篇文章",
      averageLength: "平均字数",
      mostUsedTone: "主要语调",
      consistency: "一致性",
      improvement: "改进建议",
      growth: "📈 成长分析",
      toneAnalysis: "🎨 语调使用分析"
    },
    tabs: {
      overview: "概览",
      analysis: "分析", 
      templates: "模板"
    },
    keywords: {
      title: "核心关键词"
    },
    challenge: {
      progress: "进度: {{current}}/{{total}}"
    },
    insights: {
      title: "风格洞察",
      styleTitle: "{{name}}风格",
      styleDescription: "您拥有{{description}}。",
      styleAction: "用这种风格继续成长",
      consistentTitle: "一致的风格",
      consistentDescription: "保持着{{percentage}}%的高度一致性！",
      improvementTitle: "风格一致性",
      improvementDescription: "尝试更一致地保持文章长度和语调。",
      improvementAction: "查看风格指南",
      diverseTitle: "多样化内容",
      diverseDescription: "正在尝试各种主题和风格！",
      challengeTitle: "新挑战",
      challengeDescription: "来挑战{{name}}吧！",
      challengeAction: "开始挑战"
    },
    timeSlots: {
      title: "活动时间段",
      morning: "早晨",
      afternoon: "下午",
      evening: "傍晚",
      night: "夜晚",
      morningLabel: "6-12点",
      afternoonLabel: "12-18点",
      eveningLabel: "18-22点",
      nightLabel: "22-6点"
    },
    analytics: {
      growth: "📈 成长分析",
      totalPosts: "总帖子数",
      toneAnalysis: "🎨 语调使用分析",
      categoryDistribution: "分类分布"
    },
    templates: {
      title: "风格模板",
      subtitle: "尝试各种风格，找到你自己的风格",
      create: "创建模板",
      edit: "编辑",
      delete: "删除",
      duplicate: "复制",
      recommended: "推荐",
      usageCount: "使用{{count}}次",
      starterLimit: "STARTER计划：仅可使用{{limit}}个模板",
      bulletPoint: "•",
      averageLength: "平均长度",
      keywords: "关键词",
      emojis: "表情符号",
      bestStyle: {
        name: "我的最佳风格",
        description: "反应最好的文章结构",
        opening: "充满情感的问候",
        body: "具体经验分享",
        closing: "引起共鸣的问题"
      },
      toneMaster: {
        name: "{{tone}}大师",
        description: "最常使用的语调",
        tips: "发挥这种语调的特点来创作"
      },
      growthStory: {
        name: "成长故事",
        description: "包含挑战与成就的文章",
        hook: "有趣的开头",
        challenge: "遇到的困难",
        solution: "解决过程",
        lesson: "学到的经验"
      },
      saveTemplate: "保存模板",
      useTemplate: "使用模板"
    },
    metrics: {
      title: "📊 我的风格指标",
      consistency: "一致性",
      diversity: "多样性",
      preferredTime: "偏好时间",
      mostActiveDay: "最活跃的星期",
      averageWordsPerPost: "每篇文章平均字数",
      totalWritingTime: "总写作时间",
      improvementTip: "改进提示"
    },
    challenges: {
      title: "🏆 风格挑战",
      subtitle: "通过挑战掌握新风格",
      inProgress: "进行中",
      emojiPrefix: "🏆",
      "minimal-week": {
        name: "极简周",
        description: "一周内只写50字以内的内容",
        rules: ["所有帖子50字以内", "最多2个表情符号", "最多3个标签"]
      },
      "story-month": {
        name: "故事月",
        description: "一个月内每天写一个故事",
        rules: ["每天写200字以上", "起承转合结构", "必须表达情感"]
      },
      "trend-hunter": {
        name: "潮流猎手",
        description: "发现10个最新潮流",
        rules: ["发现新标签", "包含潮流分析", "与其他用户分享"]
      }
    },
    premium: {
      title: "高级功能",
      subtitle: "使用更详细的分析和模板",
      upgradeButton: "升级"
    },
    alerts: {
      challengeStart: "挑战开始！",
      challengeStarted: "{{name}}挑战已开始！",
      templateSaved: "模板已保存",
      templateUsed: "模板已应用",
      premiumTemplate: "高级模板",
      premiumTemplateMessage: "PRO套餐可使用所有模板。",
      cancel: "取消",
      upgrade: "升级",
      confirm: "确认"
    },
    weekdays: {
      monday: "星期一",
      tuesday: "星期二",
      wednesday: "星期三",
      thursday: "星期四",
      friday: "星期五",
      saturday: "星期六",
      sunday: "星期日"
    },
    actions: {
      analyze: "分析",
      viewDetails: "查看详情",
      shareInsights: "分享洞察",
      exportData: "导出数据"
    },
    coaching: {
      title: "🤖 Posty的风格指导"
    },
    lengths: {
      under50: "50字以下",
      over200: "200字以上", 
      medium100: "100-150字",
      medium150: "150-200字",
      short80: "80-120字"
    }
  },

  
  trends: {
    title: "实时趋势",
    subtitle: "实时热门趋势和关键词",
    refresh: "刷新",
    lastUpdated: "最后更新: {{time}}",
    categories: {
      all: "全部",
      news: "新闻", 
      social: "社交",
      keywords: "关键词"
    },
    categoryTitles: {
      all: "全部趋势",
      news: "新闻",
      social: "社区",
      keywords: "热门关键词"
    },
    sources: {
      news: "新闻",
      social: "社区",
      naver: "Naver",
      keywords: "关键词"
    },
    loading: {
      initial: "正在加载趋势...",
      refresh: "刷新中..."
    },
    errors: {
      loadFailed: "加载趋势时发生错误。",
      refreshFailed: "刷新时发生错误。",
      cannotLoad: "无法加载趋势",
      tryAgain: "请稍后再试",
      networkError: "请检查网络连接",
      retryButton: "重试"
    },
    premium: {
      title: "高级功能",
      subtitle: "PRO套餐开始提供实时趋势功能。",
      upgradeButton: "升级",
      preview: {
        title: "趋势预览",
        subtitle: "分析趋势提高流量，\n根据实时话题创建内容。"
      }
    },
    tips: {
      title: "趋势使用技巧",
      content: "点击趋势，AI会为您写该主题的文章。使用关键词修改成您的风格！",
      writeWithTrend: "用这个趋势写作"
    },
    updates: {
      daily: "趋势每日更新",
      realtime: "实时趋势更新"
    },
    actions: {
      viewMore: "查看更多",
      writePost: "写文章",
      share: "分享"
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
  
  // 代币相关
  tokens: {
    count: "{{count}}个",
    current: "持有代币",
    unlimited: "无限制",
    label: "代币",
    usage: {
      today: "今日使用 {{count}}个",
    },
    actions: {
      getFree: "获取免费代币",
      charge: "代币充值"
    },
    info: {
      free: "每日午夜0点将补充10个免费代币",
      starter: "STARTER计划每月可使用200个代币",
      premium: "PREMIUM计划每月可使用500个代币",
      pro: "PRO计划正在使用无限代币"
    },
    alerts: {
      proTitle: "PRO计划使用中",
      proMessage: "您目前正在使用PRO计划，可以无限制使用代币。🚀"
    }
  },

  // 用户资料和语调
  userProfile: {
    ageGroups: {
      "10s": {
        default: "充满活力的",
        baby_photo: "太可爱了！完全是天使宝宝😭"
      },
      "20s": {
        default: "时尚随性的",
        baby_photo: "宝宝太可爱了🥺 心都要融化了"
      },
      "30s": {
        default: "亲切温暖的",
        baby_photo: "真是个可爱的小宝贝。祝愿健康成长"
      },
      "40s": {
        default: "真诚温和的",
        baby_photo: "孩子长得真有福气。父母一定很幸福"
      },
      "50s": {
        default: "成熟睿智的",
        baby_photo: "真是个美丽的宝宝。看起来是个幸福的家庭"
      },
      "60s+": {
        default: "经验丰富和蔼的",
        baby_photo: "小福星呢。祝愿健康成长"
      }
    },
    familyRoles: {
      mother: "充满爱的母亲心情",
      father: "自豪的父亲心情",
      grandparent: "慈爱的祖父母心情"
    },
    interests: [
      "旅游", "美食", "咖啡", "烹饪", "烘焙", "运动", "健身", "瑜伽", "跑步", "登山",
      "育儿", "教育", "读书", "电影", "电视剧", "音乐", "音乐会", "展览", "摄影", "绘画",
      "时尚", "美容", "室内设计", "园艺", "宠物", "游戏", "IT", "股票", "房地产", "自我提升"
    ],
    completion: {
      low: "设置个人资料后，您可以体验专属的个性化AI写作 ✨",
      medium: "再努力一点！AI可以更准确地理解您的风格 🎯",
      high: "即将完成！您很快就能体验个性化AI写作服务了 🚀"
    }
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
  },

  // Token Purchase
  tokenPurchase: {
    title: "购买代币",
    packages: {
      light: {
        name: "轻量包",
        tagline: "轻松开始"
      },
      bestValue: {
        name: "大型包",
        tagline: "重度用户首选"
      },
      mega: {
        name: "大型包",
        tagline: "重度用户首选"
      },
      ultra: {
        name: "超级包",
        tagline: "专业人士终极套餐"
      }
    },
    pricing: {
      tokens: "{{count}}个代币",
      bonus: "+{{count}}个奖励",
      price: "¥{{price}}",
      originalPrice: "¥{{price}}",
      discount: "{{percent}}%折扣",
      perToken: "每个¥{{price}}"
    },
    alerts: {
      maxPlanTitle: "PRO计划使用中",
      maxPlanMessage: "您目前正在使用PRO计划，可以无限制使用代币。\n\n无需购买额外代币。🚀",
      confirm: "确认"
    },
    currency: {
      krw: "₩",
      usd: "$",
      jpy: "¥",
      cny: "¥"
    }
  },


  // Recommendations  
  recommendations: {
    firstPost: {
      title: "试试第一篇帖子！",
      content: "用简单的自我介绍或问候\n开始你的Posty之旅",
      badge: "🌟 首次发帖",
      action: "开始",
      meta: "第一步"
    },
    selfie: {
      title: "一张自拍就足够！",
      content: "拍一张今天的自己\n写一句简单的问候就能成为很棒的帖子",
      badge: "🤳 轻松开始",
      action: "开始",
      meta: "零压力"
    },
    easyFood: {
      title: "吃了什么？这样就够了！", 
      content: "只需要一张食物照片\n说一句\"好吃\"就完美了",
      badge: "🍽️ 1分钟完成",
      action: "开始",
      meta: "1分钟完成"
    },
    weatherTalk: {
      title: "天气话题，人人都爱！",
      content: "写写今天的天气吧\n这是获得共鸣的魔法话题",
      badge: "☀️ 共鸣保证",
      action: "开始",
      meta: "共鸣保证"
    },
    lunchTime: {
      title: "今天的午餐菜单",
      content: "吃了美味的午餐吗？\n和食物照片一起分享吧！",
      badge: "🍽️ 午餐时间",
      action: "上传照片",
      meta: "午餐时间推荐",
    },
    dailyMoment: {
      title: "记录此时此刻",
      content: "没有特别的事情也没关系\n日常的小瞬间最珍贵",
      badge: "📝 日常记录",
      action: "开始", 
      meta: "日常记录"
    },
    gratitude: {
      title: "今天感谢的事是什么？",
      content: "即使是小事也请表达感谢之情\n这会让心情变得轻松",
      badge: "🙏 感谢表达",
      action: "开始",
      meta: "感谢表达"
    },
    workLife: {
      title: "聊聊工作如何？",
      content: "简单分享一下\n今天工作中的一个片段吧",
      badge: "💼 工作日常",
      action: "开始",
      meta: "工作日常"
    },
    weekendPlan: {
      title: "周末计划是什么？",
      content: "写写周末想做的事情\n或者计划吧",
      badge: "🌈 周末计划",
      action: "开始",
      meta: "周末计划"
    },
    bookReview: {
      title: "读的书怎么样？",
      content: "关于最近读的书\n简单分享一下感想吧",
      badge: "📚 读书感想",
      action: "开始",
      meta: "读书感想"
    },
    travel: {
      title: "分享旅行回忆",
      content: "写写最近去的地方\n或者旅行的回忆吧",
      badge: "✈️ 旅行记录",
      action: "开始",
      meta: "旅行记录"
    },
    hobby: {
      title: "聊聊爱好怎么样？",
      content: "关于你的爱好或喜欢的事情\n自由地写写吧",
      badge: "🎨 爱好分享",
      action: "开始",
      meta: "爱好分享"
    },
    exercise: {
      title: "今天的运动怎么样？",
      content: "关于运动或健康方面的\n今天的经验分享一下吧",
      badge: "💪 运动记录",
      action: "开始",
      meta: "运动记录"
    },
    mood: {
      title: "现在的心情如何？",
      content: "现在的心情和感受\n诚实地表达出来吧",
      badge: "💭 心情表达",
      action: "开始",
      meta: "心情表达"
    },
    learning: {
      title: "今天学到了什么？",
      content: "新学到的东西或\n发现的事情分享一下吧",
      badge: "🎓 学习分享",
      action: "开始",
      meta: "学习分享"
    },
    music: {
      title: "最近在听什么音乐？",
      content: "关于喜欢的音乐或\n最近在听的歌写写吧",
      badge: "🎵 音乐分享",
      action: "开始",
      meta: "音乐分享"
    },
    family: {
      title: "和家人的时光如何？",
      content: "和家人的珍贵时光\n或者发生的事情分享一下吧",
      badge: "👨‍👩‍👧‍👦 家庭时光",
      action: "开始",
      meta: "家庭时光"
    },
    challenge: {
      title: "开始新的挑战",
      content: "想要挑战的事情或\n新开始的事情写写吧",
      badge: "🚀 挑战",
      action: "开始",
      meta: "挑战"
    },
    reflection: {
      title: "回顾今天如何？",
      content: "回顾今天一天\n感受到的事情写写吧",
      badge: "🤔 回顾",
      action: "开始",
      meta: "回顾"
    },
    dream: {
      title: "关于梦想和目标",
      content: "关于将来的梦想和目标\n写写自己的想法吧",
      badge: "⭐ 梦想·目标",
      action: "开始",
      meta: "梦想·目标"
    },
    friendship: {
      title: "和朋友的时光",
      content: "和朋友的愉快时光\n或者回忆分享一下吧",
      badge: "👥 友情",
      action: "开始",
      meta: "友情"
    },
    simple: {
      title: "从简单的一句话开始",
      content: "不需要想得太复杂\n用一句话表达现在的感受就好",
      badge: "💬 简单",
      action: "开始",
      meta: "简单"
    },
    inspiration: {
      title: "今天的灵感",
      content: "今天获得的灵感或\n触动心灵的事情写写吧",
      badge: "💡 灵感",
      action: "开始",
      meta: "灵感"
    },
    // 周一动力
    mondayMotivation: {
      title: "一周的开始，星期一！",
      content: "分享一下这周的\n目标或计划怎么样？",
      badge: "💪 星期一",
      action: "写作",
      meta: "励志内容"
    },
    // 雨天
    rainyDay: {
      title: "感性的雨天",
      content: "记录雨声伴随的\n感性时刻吧",
      badge: "🌧️ 雨天",
      action: "写作",
      meta: "雨天预报"
    },
    // 晴天
    sunnyDay: {
      title: "晴朗的天气",
      content: "享受晴朗天气的\n户外活动怎么样？",
      badge: "☀️ 晴天",
      action: "写作",
      meta: "晴朗"
    }
  },

  // 时间段标签
  hashtags: {
    timeBased: {
      morning: ["早安", "晨间", "早餐", "通勤", "晨练"],
      morningLate: ["上午时光", "早午餐", "咖啡馆", "日常记录", "今日咖啡"],
      lunch: ["午餐时间", "午饭", "美食", "今日菜单", "午餐推荐"],
      afternoon: ["下午茶", "咖啡时光", "甜品", "休息时间", "下午悠闲"],
      evening: ["晚餐", "下班", "晚饭", "家常菜", "今天一天"],
      night: ["晚安", "夜宵", "奈飞", "治愈时光", "一天结束"],
      lateNight: ["深夜感性", "失眠", "夜班", "静谧时光", "独处时间"]
    },
    dayOfWeek: {
      weekend: ["周末时光", "休闲时间", "周末生活", "假日"],
      monday: ["周一", "新的一周", "周一开始", "星期一"],
      friday: ["周五", "星期五", "周末计划", "感谢上帝周五到了"]
    },
    seasonal: {
      spring: ["春天", "春日", "樱花", "春游"],
      summer: ["夏天", "夏日", "清凉", "夏季"],
      autumn: ["秋天", "金秋", "秋叶", "凉爽天气"],
      winter: ["冬天", "温暖", "冬日", "圣诞节"]
    }
  },

  // 成就
  achievements: {
    title: "成就",
    headerTitle: "成就",
    overallProgress: "整体进度",
    categories: {
      all: "全部",
      writing: "写作",
      style: "风格",
      social: "社交",
      special: "特殊"
    },
    categoryNames: {
      writing: "写作",
      style: "风格",
      social: "社交",
      special: "特殊"
    },
    rarity: {
      common: "普通",
      rare: "稀有",
      epic: "史诗",
      legendary: "传说"
    },
    modal: {
      category: "类别",
      rarity: "稀有度",
      progress: "进度",
      unlockedAt: "获得日期",
      selectBadge: "设为代表成就",
      success: "成功",
      setBadgeSuccess: "代表成就已设置！",
      error: "错误",
      setBadgeError: "设置代表成就失败。"
    },
    status: {
      completed: "已获得",
      empty: "还没有获得任何成就"
    },
    items: {
      // 写作相关
      first_post: {
        name: "第一步",
        description: "发布了第一篇内容"
      },
      post_3: {
        name: "新手作者",
        description: "发布了3篇内容"
      },
      post_7: {
        name: "周刊作者",
        description: "发布了7篇内容"
      },
      post_15: {
        name: "坚持作者",
        description: "发布了15篇内容"
      },
      post_30: {
        name: "月刊作者",
        description: "发布了30篇内容"
      },
      post_50: {
        name: "热情满满",
        description: "发布了50篇内容"
      },
      post_100: {
        name: "百战百胜",
        description: "发布了100篇内容"
      },
      post_200: {
        name: "专业作者",
        description: "发布了200篇内容"
      },
      post_365: {
        name: "每日作者",
        description: "发布了365篇内容"
      },
      post_500: {
        name: "传奇作者",
        description: "发布了500篇内容"
      },
      post_1000: {
        name: "千篇故事",
        description: "发布了1000篇内容"
      },

      // 风格相关
      minimal_master: {
        name: "极简大师",
        description: "完成了极简周挑战"
      },
      story_teller: {
        name: "正式大师",
        description: "完成了正式风格挑战"
      },
      trend_hunter: {
        name: "趋势猎手",
        description: "完成了趋势猎手挑战"
      },
      all_style_master: {
        name: "全能造型师",
        description: "掌握了所有风格"
      },

      // 社交相关
      first_share: {
        name: "初次分享",
        description: "向社交网站分享了内容"
      },
      share_10: {
        name: "分享达人",
        description: "分享了10次"
      },
      invite_friend: {
        name: "初次邀请",
        description: "邀请了朋友"
      },
      influencer: {
        name: "影响者",
        description: "邀请了10个朋友"
      },

      // 特殊成就
      early_bird: {
        name: "早起鸟",
        description: "在早上5点发布了内容"
      },
      night_owl: {
        name: "夜猫子",
        description: "在凌晨2点发布了内容"
      },
      lunch_writer: {
        name: "午餐作者",
        description: "在午餐时间发布了内容"
      },
      weekend_warrior: {
        name: "周末战士",
        description: "在周末发布了5篇以上内容"
      },
      streak_7: {
        name: "连续一周",
        description: "连续7天发布内容"
      },
      streak_30: {
        name: "连续一月",
        description: "连续30天发布内容"
      },
      streak_100: {
        name: "连续百日",
        description: "连续100天发布内容"
      },
      new_year: {
        name: "新年首发",
        description: "在1月1日发布了内容"
      },
      birthday_post: {
        name: "生日发文",
        description: "在生日发布了内容"
      },
      christmas_post: {
        name: "圣诞节",
        description: "在圣诞节发布了内容"
      },
      perfect_week: {
        name: "完美一周",
        description: "一周内每天都发布了内容"
      },
      comeback: {
        name: "归来作者",
        description: "休息后重新发布了内容"
      },
      posty_veteran: {
        name: "Posty老手",
        description: "使用Posty超过一年"
      }
    }
  },

  // Style Selector
  styleSelector: {
    title: "用什么风格写作？"
  },

  // Unified Styles
  styleTemplates: {
    minimalist: {
      name: "极简主义",
      description: "简洁清晰的风格"
    },
    storytelling: {
      name: "书面语", 
      description: "优雅的书面表达"
    },
    humorous: {
      name: "幽默",
      description: "机智愉快的表达"
    },
    trendsetter: {
      name: "潮流引领者",
      description: "反映最新潮流的风格"
    },
    philosopher: {
      name: "哲学家",
      description: "充满深度思考的风格"
    },
    casual: {
      name: "休闲",
      description: "亲切舒适的日常对話語調"
    },
    professional: {
      name: "专业",
      description: "正式可靠的商务語調"
    },
    emotional: {
      name: "情感",
      description: "充满情感的温暖表达"
    },
    genz: {
      name: "Gen Z",
      description: "Gen Z特有的潮流表达"
    },
    millennial: {
      name: "千禧一代",
      description: "千禧一代的情感表达"
    },
    motivational: {
      name: "名言",
      description: "像詩一样美丽深刻的哲学洞察"
    }
  }
};

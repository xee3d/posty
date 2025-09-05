export default {
  // 공통
  app: {
    name: "Posty",
    tagline: "AIが作るクリエイティブなコンテンツ",
  },

  // AI 작성 화면
  aiWrite: {
    title: "Postyと文章作成",
    subtitle: {
      text: "どんなストーリーを書きましょうか？お手伝いします！",
      polish: "作成された文章をより素敵に仕上げます！",
      photo: "写真を見せていただければ、ぴったりの文章を作成します！",
    },
    modes: {
      text: "新規投稿",
      polish: "文章整理",
      photo: "写真投稿",
    },
    prompts: {
      text: "何について書きましょうか？",
      polish: "整理したい文章を入力してください",
      photo: "写真を見せてください！",
    },
    tones: {
      casual: "カジュアル",
      professional: "専門的",
      humorous: "ユーモラス",
      emotional: "感情的",
      genz: "GenZ",
      millennial: "ミレニアル",
      minimalist: "ミニマル",
      storytelling: "ストーリーテリング",
      motivational: "モチベーション",
    },
    lengths: {
      short: "短く",
      medium: "普通",
      long: "長く",
    },
    buttons: {
      generate: "Postyにお願い",
      generating: "Postyが書いています...",
      copy: "コピー",
      save: "保存",
      share: "共有",
    },
    alerts: {
      noPrompt: "何について書くか教えてください！ 🤔",
      noPhoto: "まず写真を選択してください！ 📸",
      success: "完成しました！ 🎉",
      error: "問題が発生しました。もう一度お試しください 🥺",
    },
  },

  // 토큰 시스템
  tokens: {
    badge: "トークン",
    noTokens: "トークンが不足しています",
    earnTokens: "無料トークン獲得",
    subscribe: "トークンが不足しています。購読しますか？",
  },

  // 탭 네비게이션
  tabs: {
    home: "ホーム",
    aiWrite: "AI作成",
    myStyle: "マイスタイル",
    settings: "設定",
  },

  // 홈 화면
  home: {
    greeting: "さん",
    welcome: {
      title: "Postyへようこそ！",
      message: "最初の投稿を書いてみませんか？お手伝いします！",
      action: "最初の投稿",
      subMessage: "簡単な日常から始めてみてください。Postyが素敵な文章にします！"
    },
    greetings: {
      dawn: {
        title: "{{userName}}さん、夜更かししてますね？",
        message: "この時間の思いは特別です。記録してみませんか？",
        action: "夜更けの感性"
      },
      morning: {
        title: "おはようございます！{{userName}}さん",
        message: "今日は何を投稿しますか？モーニングコーヒーの写真でも良いですよ！",
        action: "朝の日常シェア"
      },
      lunch: {
        title: "{{userName}}さん、お昼は食べましたか？",
        message: "美味しいものを食べたなら自慢しなくちゃ！",
        action: "ランチレビュー"
      },
      afternoon: {
        title: "{{userName}}さん、午後も頑張りましょう！",
        message: "短い文章でも良いです。今日の瞬間を記録してみましょう",
        messageRegular: "今日はもう{{postCount}}個も書きましたね！すごいです 👍",
        action: "日常シェア"
      },
      evening: {
        title: "{{userName}}さん、今日一日はいかがでしたか？",
        message: "一日を締めくくる文章を書いてみませんか？簡単でも良いですよ",
        action: "夕方の感性"
      },
      night: {
        title: "{{userName}}さん、まだ起きてるんですね？",
        message: "寝る前に今日あったことを記録してみませんか？",
        action: "夜の感性"
      }
    },
    topics: {
      daily: "日常",
      weekend: "週末",
      cafe: "カフェ",
      food: "グルメ",
      travel: "旅行",
      exercise: "運動",
      bookstagram: "ブックスタグラム"
    },
    quickTemplates: {
      lunch: ["今日のランチ ✨", "美味しい発見！", "これを食べて元気出そう"],
      evening: ["今日もお疲れ様 🌙", "明日はもっと良い日", "一日終了！"]
    },
    sections: {
      newUserQuestion: "何を書けば良いかわからない？",
      regularUserQuestion: "今日は何を投稿しましょうか？",
      todayRecommendation: "今日は何を書こう？",
      myPosts: "私が書いた投稿"
    },
    actions: {
      firstWrite: "最初の投稿",
      writeAssist: "文章作成補助",
      photoStart: "写真から開始",
      polishText: "AI文章完成ツール",
      viewAll: "全て見る",
      copy: "コピー",
      share: "共有"
    },
    messages: {
      writeAssistDesc: "一行でも素敵にしてくれます",
      polishTextDesc: "不自然な文章を自然に整えます",
      photoStartDesc: "写真だけ見せていただければ文章を書きます",
      copySuccess: "コピー完了",
      copySuccessDesc: "クリップボードにコピーされました"
    },
    templates: {
      weather: {
        title: "天気の話",
        desc: "今日の天気から始める"
      },
      food: {
        title: "食べ物レビュー",
        desc: "今日食べた美味しいもの"
      },
      photo: {
        title: "写真で",
        desc: "写真があればOK"
      }
    },
    recommend: {
      easy: "🔥 簡単",
      easierPhoto: "📸 もっと簡単",
      easyTitle: "一行から始めましょう",
      easyContent: "長い文章は不要！\n今日何をしたかだけでもOK",
      photoTitle: "写真だけあれば終了！",
      photoContent: "写真を一枚選んでいただければ\n文章は私が書きます！",
      recommended: "おすすめ",
      convenient: "簡単に",
      writeButton: "書く",
      photoSelectButton: "写真選択"
    },
    styleCard: {
      title: "私の文章スタイル",
      consistency: "一貫性",
      thisWeek: "今週"
    },
    styleTypes: {
      minimalist: "🎯 ミニマリスト",
      storyteller: "📖 ストーリーテラー",
      visualist: "📸 ビジュアリスト",
      trendsetter: "✨ トレンドセッター",
      unique: "🎨 私だけのスタイル"
    },
    mainActions: {
      polishTool: "AI文章校正ツール",
      polishDesc: "ぎこちない文章を自然にしてくれる",
      styleGuide: "私の文章スタイル",
    },
    quickActions: {
      writePost: "Postyと一緒に書く",
      analyzePhoto: "写真を分析",
    },
    postActions: {
      copy: "コピー",
      share: "シェア",
    },
    weeklyCount: {
      thisWeek: "今週",
      consistency: "一貫性",
    }
  },

  // Settings
  settings: {
    title: "設定",
    achievements: "実績",
    profileDetails: "プロフィール詳細",
    profileGuideDefault: "プロフィールを設定してみてください",
    tokenManagement: "トークン管理",
    appSettings: "アプリ設定",
    pushNotifications: "プッシュ通知",
    soundEffects: "サウンドエフェクト",
    vibration: "バイブレーション",
    themeAndColors: "テーマと色",
    themeDescription: "テーマ設定",
    support: "サポート",
    language: "言語",
    userGuide: "ユーザーガイド",
    contact: "お問い合わせ",
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    notifications: {
      enabled: "通知が有効化されました",
      soundEnabled: "サウンドが有効化されました",
      vibrationEnabled: "バイブレーションが有効化されました"
    }
  },

  // Posts
  posts: {
    styles: {
      casual: "カジュアル",
      professional: "専門的",
      humorous: "ユーモラス",
      emotional: "感情的",
      genz: "GenZ",
      millennial: "ミレニアル",
      minimalist: "ミニマル",
      storytelling: "ストーリーテリング",
      motivational: "モチベーション"
    },
    categories: {
      daily: "日常",
      cafe: "カフェ",
      food: "グルメ",
      exercise: "運動",
      travel: "旅行",
      fashion: "ファッション",
      beauty: "ビューティー",
      other: "その他"
    },
    time: {
      today: "今日",
      yesterday: "昨日"
    },
    actions: {
      copy: "コピー",
      copyMessage: "コピーされました",
      save: "保存",
      saving: "保存中...",
      saveSuccess: "保存されました",
      saveError: "保存に失敗しました",
      share: "共有"
    },
    input: {
      title: "投稿作成",
      contentSection: "内容",
      placeholder: "何について書きましょうか？",
      required: "内容を入力してください"
    }
  },

  // Alerts
  alerts: {
    notifications: {
      enabled: "プッシュ通知が有効化されました",
      disabled: "プッシュ通知が無効化されました"
    },
    sound: {
      enabled: "サウンドが有効化されました"
    },
    vibration: {
      enabled: "バイブレーションが有効化されました"
    },
    platform: {
      connect: {
        title: "{{platform}} 接続",
        message: "{{platform}}に接続しますか？",
        comingSoon: "{{platform}} 接続機能は近日提供予定です"
      },
      disconnect: {
        title: "接続解除",
        message: "{{platform}} 接続を解除しますか？",
        success: "{{platform}} 接続が解除されました",
        failed: "接続解除に失敗しました"
      },
      status: {
        connected: "接続済み",
        notConnected: "未接続",
        connectAction: "接続する"
      }
    },
    purchase: {
      restore: {
        title: "購入復元",
        message: "購入履歴を復元しますか？",
        failedTitle: "復元失敗",
        failed: "購入復元に失敗しました"
      }
    },
    data: {
      clearHistory: {
        title: "履歴削除",
        message: "履歴を削除しますか？",
        success: "履歴が削除されました",
        failed: "履歴削除に失敗しました"
      },
      deleteAll: {
        title: "全てのデータ削除",
        message: "全てのデータを削除しますか？",
        success: "全てのデータが削除されました",
        failed: "データ削除に失敗しました"
      }
    },
    auth: {
      logout: {
        title: "ログアウト",
        message: "ログアウトしますか？",
        action: "ログアウト"
      }
    },
    rating: {
      title: "評価する",
      message: "アプリが満足いただけたら評価してください",
      later: "後で",
      rate: "評価する",
      error: "評価ページを開けません"
    },
    tokens: {
      dailyLimitExceeded: {
        title: "日次上限超過",
        message: "日次取得可能なトークン上限（{{limit}}個）を超過しました"
      },
      partialGrant: {
        title: "一部トークン付与",
        message: "{{tokens}}個のトークンが付与されました"
      }
    },
    buttons: {
      ok: "確認",
      cancel: "キャンセル",
      delete: "削除",
      error: "エラー",
      completed: "完了",
      connect: "接続",
      disconnect: "接続解除",
      restore: "復元",
      close: "閉じる"
    },
    language: {
      changed: "言語が変更されました"
    }
  },

  // Common
  common: {
    error: "エラー",
    success: "成功", 
    close: "閉じる",
    count: "個"
  },

  // Analytics
  analytics: {
    insights: {
      likesIncrease: "いいねが大幅に増加しました！🎉",
      reachGrowth: "リーチが爆発的に成長しました！🚀",
      topCategory: "{{category}}関連の投稿が最も多いです",
      highActivity: "活発な投稿活動をしています！👏", 
      lowActivity: "もう少し頻繁に投稿するといいですね",
    },
    timeSlots: {
      morning: "朝 (6-9時)",
      forenoon: "午前 (9-12時)",
      lunch: "昼 (12-15時)",
      afternoon: "午後 (15-18時)",
      evening: "夕方 (18-21時)",
      night: "夜 (21-24時)",
      dawn: "明け方 (0-6時)",
    },
    sampleData: {
      categories: ["カフェ", "グルメ", "日常", "運動", "旅行"],
      hashtags: ["日常", "デイリー"],
      postContent: "サンプル投稿",
    },
  },

  // Time and Date
  time: {
    days: ["日", "月", "火", "水", "木", "金", "土"],
    none: "なし",
    hour: "時",
  },

  // Subscription Plans  
  subscription: {
    plans: {
      free: {
        name: "無料",
        priceDisplay: "無料",
        features: [
          "毎日10個のトークン",
          "3つのトーンスタイル",
          "短い/中程度の長さ",
          "広告あり",
        ],
      },
      starter: {
        features: [
          "登録時に300個のトークンを即時付与",
          "毎日10個のトークン追加充電",
          "4つのトーンスタイル",
          "長い文章作成可能",
          "広告削除",
          "MyStyle分析",
        ],
      },
      premium: {
        features: [
          "登録時に500個のトークンを即時付与",
          "毎日20個のトークン追加充電", 
          "6つのトーンスタイル",
          "すべての文章長",
          "広告削除",
          "MyStyle分析",
          "優先処理",
        ],
      },
      pro: {
        features: [
          "登録時に500個のトークンを即時付与",
          "無制限トークン (Fair Use)",
          "すべてのトーンスタイル",
          "優先処理",
          "広告完全削除",
        ],
      },
    },
  },

  // Language
  language: {
    current: "現在の言語: {{language}} {{isSystem}}",
    system: "(システム)",
    selectLanguage: "言語選択",
    resetToSystem: "システム言語にリセット",
    note: "言語を変更するとアプリが再起動されます"
  }
};
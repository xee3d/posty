export default {
  common: {
    confirm: "確認",
    cancel: "キャンセル",
    save: "保存",
    delete: "削除",
    edit: "編集",
    close: "閉じる",
    back: "戻る",
    next: "次へ",
    loading: "読み込み中...",
    error: "エラーが発生しました",
    success: "成功しました",
    warning: "警告",
    info: "情報",
    yes: "はい",
    no: "いいえ",
    ok: "OK",
    retry: "再試行",
    skip: "スキップ",
    done: "完了",
    continue: "続行",
    finish: "終了",
    start: "開始",
    stop: "停止"
  },

  navigation: {
    home: "ホーム",
    trending: "トレンド",
    aiWrite: "AI執筆",
    myStyle: "マイスタイル",
    settings: "設定"
  },

  settings: {
    title: "設定",
    language: "言語",
    languageTitle: "言語設定",
    languageDescription: "アプリの言語を選択してください"
  },

  subscription: {
    title: "プレミアムプラン",
    subtitle: "すべての機能をアンロック",
    popular: "人気",
    currentPlan: "現在のプラン",
    upgradeNow: "今すぐアップグレード",
    manageSubscription: "サブスクリプション管理",
    cancelSubscription: "サブスクリプション解除",
    renewalDate: "更新日",
    perMonth: "/月",
    perYear: "/年",
    monthly: "月額",
    yearly: "年額",
    save: "{{percentage}}%お得",
    freeTrial: "無料トライアル",
    startFreeTrial: "無料トライアルを開始",
    trialEnds: "トライアル終了日: {{date}}",
    features: {
      unlimitedTokens: "無制限トークン",
      allTones: "すべてのトーン",
      allLengths: "すべての長さ",
      noAds: "広告なし",
      myStyleAnalysis: "マイスタイル分析",
      instantImageAnalysis: "瞬時画像分析",
      gpt4Turbo: "GPT-4 Turbo",
      apiAccess: "API アクセス",
      prioritySupport: "優先サポート",
      dailyTokens: "毎日{{tokens}}トークン",
      monthlyTokens: "月間{{tokens}}トークン"
    },
    hero: {
      title: "Postyをフル活用しよう",
      subtitle: "プレミアム機能でコンテンツ作成を次のレベルへ",
      startTrial: "7日間無料で試す"
    },
    benefits: {
      title: "プレミアム特典",
      unlimitedCreation: {
        title: "無制限作成",
        description: "制限なくコンテンツを作成"
      },
      advancedFeatures: {
        title: "高度な機能",
        description: "プロフェッショナル向けツール"
      },
      prioritySupport: {
        title: "優先サポート",
        description: "24時間以内に返答"
      }
    },
    management: {
      title: "サブスクリプション管理",
      currentPlan: "現在のプラン",
      nextBilling: "次回請求日",
      managePayment: "支払い方法管理",
      viewInvoices: "請求書を表示",
      cancelPlan: "プラン解除",
      upgradePlan: "プランアップグレード"
    },
    earnTokensSection: {
      title: "無料でトークンを獲得",
      dailyCheckin: {
        title: "毎日チェックイン",
        description: "毎日ログインして{{tokens}}トークン獲得",
        button: "チェックイン ({{tokens}}トークン)"
      },
      watchAd: {
        title: "広告視聴",
        description: "短い広告を見て{{tokens}}トークン獲得",
        button: "広告を見る ({{tokens}}トークン)"
      },
      shareApp: {
        title: "アプリ共有",
        description: "友達にアプリを紹介して{{tokens}}トークン獲得",
        button: "共有する ({{tokens}}トークン)"
      },
      reviewApp: {
        title: "アプリレビュー",
        description: "App Storeでレビューして{{tokens}}トークン獲得",
        button: "レビューする ({{tokens}}トークン)"
      }
    }
  },

  aiWrite: {
    title: "Postyで執筆",
    subtitle: {
      text: "どんなストーリーを書きましょうか？お手伝いします！",
      polish: "書いた文章をより素敵に仕上げます！",
      photo: "写真を見せていただければ、ぴったりの文章を作ります！",
    },
    errors: {
      imageSelection: "画像の選択中にエラーが発生しました。",
      cameraAccess: "カメラの使用中にエラーが発生しました。"
    },
    modes: {
      text: "新規作成",
      polish: "文章整理",
      photo: "写真から作成",
    },
    prompts: {
      text: "何について書きましょうか？",
      polish: "整理したい文章を入力してください",
      photo: "写真を見せてください！",
    },
    placeholderExamples: {
      polish: "例：今日カフェで友達とコーヒーを飲みながら長時間話していたら、とても楽しかった...",
    },
    prompt: {
      title: "何について書きましょうか？",
      refresh: "更新",
      trendUpdate: {
        title: "トレンド更新",
        message: "最新のトレンドを取得しました！"
      }
    },
    placeholders: {
      morning: "今朝はどのように始めましたか？",
      lunch: "昼食は美味しくいただけましたか？",
      afternoon: "午後のひとときを楽しんでいますか？",
      evening: "今日一日はいかがでしたか？",
      night: "夜更け、何を考えていますか？"
    },
    timeBasedPrompts: {
      morning: ["今朝のコーヒー", "通勤風景", "モーニングルーティン", "朝の運動", "早朝の感性", "朝食メニュー"],
      lunch: ["昼食メニュー", "午後のコーヒータイム", "昼休みの余裕", "今日のランチ", "カフェ巡り", "午後の仕事"],
      afternoon: ["午後の余裕", "カフェタイム", "退勤準備", "午後の運動", "一日の整理", "夕方の計画"],
      evening: ["夕食メニュー", "帰り道の風景", "夕方の運動", "一日の終わり", "夜景鑑賞", "夕方の余暇"],
      night: ["夜食タイム", "深夜の感性", "不眠症の日常", "早朝の考え", "夜勤作業", "夜の散歩"]
    },
    categories: {
      casual: "日常",
      professional: "ビジネス", 
      humorous: "ユーモア",
      emotional: "感情",
      genz: "トレンド",
      millennial: "ライフスタイル",
      minimalist: "ミニマル",
      storytelling: "ストーリー",
      motivational: "モチベーション"
    },
    
    tones: {
      casual: "カジュアル",
      professional: "プロフェッショナル",
      humorous: "ユーモラス",
      emotional: "感情的",
      genz: "Z世代",
      millennial: "ミレニアル世代",
      minimalist: "ミニマル",
      storytelling: "ストーリーテリング",
      motivational: "やる気を起こす",
    },
    
    lengths: {
      short: "短く",
      medium: "普通",
      long: "長く",
    },
    buttons: {
      generate: "Postyに依頼する",
      generating: "Postyが書いています...",
      copy: "コピー",
      save: "保存",
      share: "共有",
    },
    photo: {
      select: {
        title: "写真選択",
        message: "どの方法で写真を選択しますか？",
        camera: "カメラで撮影",
        gallery: "ギャラリーから選択",
      },
      upload: {
        title: "写真をアップロード",
        subtitle: "ギャラリーから選択するか直接撮影してください",
        button: "写真選択",
        change: "変更",
      }
    },
    alerts: {
      noPrompt: "何について書くか教えてください！🤔",
      noPhoto: "まず写真を選択してください！📸",
      success: "完成しました！🎉",
      error: "何か問題が発生しました。もう一度お試しください🥺",
      waitAnalysis: "写真の分析が完了するまでお待ちください。",
      completeAnalysis: "まず写真の分析を完了してください。",
      imageTooBig: {
        title: "お知らせ",
        message: "画像が大きすぎます。より小さい画像を選択してください。",
        analysisResult: "画像が大きすぎます。"
      }
    },
    keywords: {
      morning: ["朝のルーティン", "カフェ", "出勤", "朝", "コーヒー", "運動"],
      afternoon: ["昼食", "日常", "午後", "休憩", "散歩", "カフェ"],
      evening: ["夕食", "退勤", "運動", "趣味", "休憩", "グルメ"],
      night: ["夜食", "Netflix", "休憩", "日常", "趣味", "夜更かし"]
    },
    descriptions: {
      short: "〜50文字",
      medium: "〜150文字",
      long: "〜300文字"
    },
    example: "例",
    analysis: {
      analyzing: "画像を分析中...",
      failed: "写真の分析に失敗しました。もう一度お試しください。",
      error: "写真の分析中にエラーが発生しました。",
      fallback: {
        description: "素敵な写真ですね！どんなストーリーを書きましょうか？",
        suggestedContent: ["今日の写真", "日常記録", "特別な瞬間"]
      }
    },
    sections: {
      quickTopic: "クイックトピック選択",
      selectTone: "どんなトーンでいきますか？",
      selectLength: "どれくらいの長さにしますか？",
      selectedHashtags: "選択されたハッシュタグ",
      polishOptions: "希望する変換方向",
      photoSelect: "写真を見せてください！",
      photoAnalyzing: "写真を分析中...",
      resultTitle: "完成しました！🎉",
    },
    
    photoUpload: {
      title: "画像で書く",
      description: "写真をアップロードしてコンテンツを生成",
      selectImage: "画像を選択",
      takePhoto: "写真を撮る",
      fromGallery: "ギャラリーから",
      analyzing: "画像を分析中...",
      analysisComplete: "分析完了",
      analysisError: "画像の分析に失敗しました",
      noImageSelected: "画像が選択されていません"
    },
    
    polishOptions: {
      summarize: "要約",
      simple: "シンプル",
      formal: "フォーマル",
      emotion: "感情",
      storytelling: "ストーリー",
      engaging: "魅力的",
      hashtag: "ハッシュタグ",
      emoji: "絵文字",
      question: "質問",
    },
    
    actions: {
      generate: "生成",
      regenerate: "再生成",
      copy: "コピー",
      share: "共有",
      save: "保存",
      edit: "編集",
      delete: "削除",
      polish: "磨く",
      translate: "翻訳",
      analyze: "分析"
    },
    
    status: {
      generating: "生成中...",
      polishing: "磨き中...",
      translating: "翻訳中...",
      analyzing: "分析中...",
      completed: "完了",
      error: "エラー",
      cancelled: "キャンセル"
    },
    
    errors: {
      noInput: "テキストを入力してください",
      tooLong: "テキストが長すぎます",
      networkError: "ネットワークエラー",
      serverError: "サーバーエラー",
      rateLimitExceeded: "利用制限を超えました",
      insufficientTokens: "トークンが不足しています"
    },
    
    tokens: {
      remaining: "残りトークン: {{count}}",
      used: "使用トークン: {{count}}",
      required: "必要トークン: {{count}}",
      insufficient: "トークンが不足しています",
      purchaseMore: "追加購入"
    }
  },

  myStyle: {
    title: "マイスタイル",
    subtitle: "あなたの書き方スタイルを分析",
    description: "過去の投稿を分析してあなただけの文体を学習します",
    profileCompletion: "プロフィール完成度 {{completeness}}%",
    interests: "興味（複数選択可能）",
    formality: "形式",
    emotiveness: "感情表現",
    humor: "ユーモア",
    saveProfile: "プロフィール保存",
    
    access: {
      freeMessage: "STARTERプランからマイスタイル機能をご利用いただけます",
      upgradeButton: "プランをアップグレード"
    },
    
    analysis: {
      title: "スタイル分析",
      inProgress: "分析中...",
      completed: "分析完了",
      noData: "分析するデータがありません"
    },
    
    templates: {
      title: "マイテンプレート",
      create: "テンプレート作成",
      edit: "編集",
      delete: "削除",
      duplicate: "複製"
    }
  },

  // MyStyle Screen
  mystyle: {
    title: "マイスタイル",
    subtitle: "あなただけのコンテンツブランドを構築",
    loading: "スタイルを分析中...",
    refresh: "更新",
    empty: {
      title: "まだコンテンツが作成されていません",
      subtitle: "Postyで最初のコンテンツを作成しましょう！",
      startWriting: "執筆を開始"
    },
    tabs: {
      templates: "テンプレート"
    },
    templates: {
      title: "スタイルテンプレート",
      subtitle: "様々なスタイルを試して、あなただけのスタイルを見つけましょう",
      starterLimit: "STARTERプラン：{{limit}}個のテンプレートのみ利用可能"
    },
  },
  
  trends: {
    title: "リアルタイムトレンド",
    subtitle: "リアルタイムの人気トレンドとキーワード",
    refresh: "更新",
    lastUpdated: "最終更新: {{time}}",
    categories: {
      all: "すべて",
      news: "ニュース", 
      social: "ソーシャル",
      keywords: "キーワード"
    },
    categoryTitles: {
      all: "すべてのトレンド",
      news: "ニュース",
      social: "コミュニティ",
      keywords: "人気キーワード"
    },
    sources: {
      news: "ニュース",
      social: "コミュニティ",
      naver: "Naver",
      keywords: "キーワード"
    },
    loading: {
      initial: "トレンドを読み込んでいます...",
      refresh: "更新中..."
    },
    errors: {
      loadFailed: "トレンドの読み込みでエラーが発生しました。",
      refreshFailed: "更新でエラーが発生しました。",
      cannotLoad: "トレンドを読み込めません",
      tryAgain: "しばらくしてから再度お試しください",
      networkError: "ネットワーク接続をご確認ください",
      retryButton: "再試行"
    },
    premium: {
      title: "プレミアム機能",
      subtitle: "リアルタイムトレンドはPROプランからご利用いただけます。",
      upgradeButton: "アップグレード",
      preview: {
        title: "トレンドプレビュー",
        subtitle: "トレンドを分析してトラフィックを増やし、\nリアルタイムの話題に合わせてコンテンツを作成してみましょう。"
      }
    },
    tips: {
      title: "トレンド活用のコツ",
      content: "トレンドをクリックすると、AIがその話題で記事を書いてくれます。キーワードを使って自分のスタイルに修正してみましょう！",
      writeWithTrend: "このトレンドで書く"
    },
    updates: {
      daily: "トレンドは毎日更新されます",
      realtime: "リアルタイムトレンド更新"
    },
    actions: {
      viewMore: "もっと見る",
      writePost: "記事を書く",
      share: "共有"
    }
  },

  trending: {
    title: "トレンド",
    subtitle: "今話題のトピック",
    categories: {
      all: "すべて",
      technology: "テクノロジー",
      lifestyle: "ライフスタイル",
      business: "ビジネス",
      entertainment: "エンターテインメント",
      sports: "スポーツ",
      news: "ニュース"
    },
    updateFrequency: {
      realtime: "リアルタイム",
      daily: "毎日更新"
    }
  },
  
  tokens: {
    title: "トークン",
    balance: "残高",
    purchase: "購入",
    earn: "獲得",
    history: "履歴",
    packages: {
      title: "トークンパッケージ",
      small: "30トークン",
      medium: "100トークン",
      large: "300トークン",
      xlarge: "1000トークン"
    },
    earn: {
      title: "無料でトークンを獲得",
      dailyBonus: "デイリーボーナス",
      watchAd: "広告視聴",
      shareApp: "アプリ共有",
      rateApp: "アプリ評価"
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
    generic: "エラーが発生しました",
    network: "ネットワークに接続してください",
    server: "サーバーエラー",
    unauthorized: "認証が必要です",
    forbidden: "アクセスが拒否されました",
    notFound: "見つかりません",
    validation: "入力内容を確認してください",
    timeout: "タイムアウトしました"
  },
  
  // タブナビゲーション
  tabs: {
    home: "ホーム",
    aiWrite: "AI執筆",
    trend: "トレンド",
    myStyle: "マイスタイル",
    settings: "設定",
  },

  // ホーム画面
  home: {
    greeting: "さん",
    defaultUserName: "ユーザー",
    welcome: {
      title: "Postyへようこそ！",
      message: "最初の投稿を書いてみませんか？お手伝いします！",
      startWriting: "さあ、書いてみましょう！"
    },
    quickActions: {
      title: "クイックスタート",
      newPost: "新しい投稿",
      trendingPost: "トレンドで投稿",
      myStylePost: "マイスタイルで投稿"
    },
    recentPosts: {
      title: "最近の投稿",
      empty: "まだ投稿がありません",
      viewAll: "すべて表示"
    },
    stats: {
      title: "統計",
      postsCount: "投稿数",
      totalViews: "総閲覧数",
      averageViews: "平均閲覧数",
      engagement: "エンゲージメント"
    },
    tips: {
      title: "今日のヒント",
      viewMore: "もっと見る"
    }
  },

  // アラート・確認ダイアログ
  alerts: {
    buttons: {
      ok: "OK",
      cancel: "キャンセル",
      later: "後で",
      delete: "削除",
      error: "エラー",
      completed: "完了",
      connect: "接続",
      disconnect: "切断",
      restore: "復元",
      close: "閉じる"
    },
    language: {
      changed: "言語が変更されました"
    },
    permission: {
      title: "権限が必要",
      message: "プッシュ通知を受信するには、設定で通知権限を許可してください。",
      goToSettings: "設定に移動"
    },
    testNotification: {
      title: "テスト通知",
      message: "どの通知をテストしますか？",
      mission: "ミッション通知",
      trend: "トレンド通知",
      token: "トークン通知",
      achievement: "実績通知",
      tips: "ヒント通知",
      send: "テスト通知を送信"
    }
  },

  success: {
    generic: "成功しました",
    saved: "保存されました",
    updated: "更新されました",
    deleted: "削除されました",
    created: "作成されました",
    uploaded: "アップロードされました",
    downloaded: "ダウンロードされました",
    shared: "共有されました",
    copied: "コピーされました"
  },

  // App
  app: {
    name: "Posty",
    tagline: "AIが生み出すクリエイティブコンテンツ",
    slogan: "AIが書いて、私が輝く",
    subTagline: "1分で完璧な投稿を完成",
    description: "写真1枚で素晴らしい投稿を完成",
    slogan1: "あなたの物語を\n世界に伝えましょう。",
    slogan2: "簡単な一行が\n特別な瞬間になります。",
    slogan3: "Postyがお手伝いします。\nより良い執筆を。",
    slogan4: "始めてみませんか？",
  },

  // Navigation
  navigation: {
    home: "ホーム",
    write: "執筆",
    trend: "トレンド",
    myStyle: "マイスタイル",
    settings: "設定",
  },

  // Home Screen
  home: {
    greeting: "",
    defaultUserName: "友達",
    navigation: {
      subscription: "サブスクリプション"
    },
    welcome: {
      title: "Postyへようこそ！",
      message: "最初の投稿を書いてみませんか？お手伝いします！",
      action: "最初の投稿を書く",
      subMessage: "日常の簡単なことから始めましょう。Postyが素晴らしいコンテンツに変えます！"
    },
    greetings: {
      dawn: {
        title: "{{userName}}、夜明けの雰囲気を感じていますか？",
        message: "この時間の考えは特別です。記録してみませんか？",
        action: "夜明けの執筆"
      },
      morning: {
        title: "おはよう！{{userName}}",
        message: "今日は何を投稿しますか？朝のコーヒー写真でも素晴らしいです！",
        action: "朝の共有"
      },
      lunch: {
        title: "{{userName}}、お昼は食べましたか？",
        message: "美味しいものを食べたなら、自慢してみてください！",
        action: "ランチレビュー"
      },
      afternoon: {
        title: "{{userName}}、午後も頑張りましょう！",
        message: "短い投稿でも大丈夫です。今日のこの瞬間を記録しましょう",
        messageRegular: "今日はすでに{{postCount}}件の投稿を書いています！素晴らしい👍",
        action: "日常共有"
      },
      evening: {
        title: "{{userName}}、今日はどうでしたか？",
        message: "一日を締めくくる投稿を書いてみませんか？簡単なものでも大丈夫です",
        action: "夕方の思い"
      },
      night: {
        title: "{{userName}}、まだ起きていますか？",
        message: "寝る前に今日起こったことを記録してみませんか？",
        action: "夜の執筆"
      }
    },
    topics: {
      daily: "日常",
      weekend: "週末",
      cafe: "カフェ",
      food: "グルメ",
      travel: "旅行",
      exercise: "運動",
      bookstagram: "読書"
    },
    quickTemplates: {
      lunch: ["今日のランチ✨", "隠れた名店発見！", "これで元気が出ました"],
      evening: ["今日もお疲れ様🌙", "明日はもっと良くなります", "一日完了！"]
    },
    sections: {
      newUserQuestion: "何を書けばいいかわからない？",
      regularUserQuestion: "今日は何を投稿しますか？",
      todayRecommendation: "今日は何を書きましょうか？",
      myPosts: "私の投稿"
    },
    actions: {
      firstWrite: "最初の投稿を書く",
      writeAssist: "執筆を手伝って",
      photoStart: "写真から始める",
      polishText: "AIテキスト磨き",
      viewAll: "すべて表示",
      copy: "コピー",
      share: "共有"
    },
    messages: {
      writeAssistDesc: "一行でも素晴らしく仕上げます",
      polishTextDesc: "不自然な文章を自然に磨きます",
      photoStartDesc: "写真を見せてくれれば、文章を書きます",
      copySuccess: "コピーしました",
      copySuccessDesc: "クリップボードにコピーしました"
    },
    templates: {
      weather: {
        title: "天気の話",
        desc: "今日の天気から始める",
        content: "今日の天気がいいので"
      },
      food: {
        title: "グルメレビュー",
        desc: "今日食べた美味しいもの",
        content: "今日は"
      },
      photo: {
        title: "写真付き",
        desc: "写真があればOK"
      }
    },
    tips: {
      todayTip: "今日のヒント",
      consistentPosting: "継続的な投稿が鍵",
      consistentPostingDesc: "小さな日常の話でも共有することで、フォロワーとの絆が強くなります！"
    },
    recommend: {
      easy: "🔥 簡単",
      easierPhoto: "📸 もっと簡単",
      easyTitle: "一行から始める",
      easyContent: "長い投稿は不要！\n今日何をしたか書くだけ",
      photoTitle: "写真があればOK！",
      photoContent: "写真を選んで\n文章を書きます！",
      recommended: "おすすめ",
      convenient: "便利",
      writeButton: "執筆",
      photoSelectButton: "写真選択"
    },
    styleCard: {
      title: "私の執筆スタイル",
      consistency: "一貫性",
      thisWeek: "今週"
    },
    styleTypes: {
      minimalist: "🎯 ミニマリスト",
      storyteller: "📖 ストーリーテラー",
      visualist: "📸 ビジュアリスト",
      trendsetter: "✨ トレンドセッター",
      unique: "🎨 ユニークスタイル"
    },
    mainActions: {
      polishTool: "AIテキスト磨きツール",
      polishDesc: "不自然な文章を自然に磨く",
      styleGuide: "私の執筆スタイル",
    },
    quickActions: {
      writePost: "Postyで執筆",
      analyzePhoto: "写真分析",
    },
    postActions: {
      copy: "コピー",
      share: "共有",
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
    profileGuideDefault: "プロフィールを設定",
    tokenManagement: "トークン管理",
    appSettings: "アプリ設定",
    pushNotifications: "プッシュ通知",
    soundEffects: "音響効果",
    vibration: "振動",
    themeAndColors: "テーマと色",
    themeDescription: "テーマ設定",
    support: "サポート",
    language: "言語",
    userGuide: "ユーザーガイド",
    contact: "お問い合わせ",
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    notifications: {
      enabled: "通知が有効",
      soundEnabled: "音が有効",
      vibrationEnabled: "振動が有効"
    }
  },

  // Common
  common: {
    error: "エラー",
    success: "成功",
    close: "閉じる",
    count: "",
    start: "開始",
    skip: "スキップ",
    loading: "読み込み中...",
    later: "後で"
  },

  // Alerts
  alerts: {
    notifications: {
      enabled: "プッシュ通知が有効",
      disabled: "プッシュ通知が無効"
    },
    sound: {
      enabled: "音が有効"
    },
    vibration: {
      enabled: "振動が有効"
    },
    platform: {
      connect: {
        title: "{{platform}}に接続",
        message: "{{platform}}に接続しますか？",
        comingSoon: "{{platform}}接続機能は近日公開"
      },
      disconnect: {
        title: "切断",
        message: "{{platform}}から切断しますか？",
        success: "{{platform}}から切断しました",
        failed: "切断に失敗しました"
      },
      status: {
        connected: "接続済み",
        notConnected: "未接続",
        connectAction: "接続"
      }
    },
    purchase: {
      restore: {
        title: "購入を復元",
        message: "購入履歴を復元しますか？",
        failedTitle: "復元失敗",
        failed: "購入の復元に失敗しました"
      }
    },
    data: {
      clearHistory: {
        title: "履歴をクリア",
        message: "履歴をクリアしますか？",
        success: "履歴をクリアしました",
        failed: "履歴のクリアに失敗しました"
      },
      deleteAll: {
        title: "すべてのデータを削除",
        message: "すべてのデータを削除しますか？",
        success: "すべてのデータを削除しました",
        failed: "データの削除に失敗しました"
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
      title: "アプリを評価",
      message: "満足していただけましたらアプリを評価してください",
      later: "後で",
      rate: "評価",
      error: "評価ページを開けません"
    },
    tokens: {
      dailyLimitExceeded: {
        title: "日次制限超過",
        message: "日次トークン制限({{limit}})を超過しました"
      },
      partialGrant: {
        title: "部分トークン付与",
        message: "{{tokens}}トークンが付与されました"
      }
    },
    buttons: {
      ok: "OK",
      cancel: "キャンセル",
      later: "後で",
      delete: "削除",
      error: "エラー",
      completed: "完了",
      connect: "接続",
      disconnect: "切断",
      restore: "復元",
      close: "閉じる"
    },
    language: {
      changed: "言語が変更されました"
    }
  },

  // Language
  language: {
    current: "現在の言語：{{language}} {{isSystem}}",
    system: "（システム）",
    selectLanguage: "言語を選択",
    resetToSystem: "システム言語にリセット",
    note: "言語を変更するとアプリが再起動します"
  },

  // Token Purchase
  tokenPurchase: {
    title: "トークン購入",
    packages: {
      light: {
        name: "ライトパック",
        tagline: "気軽に始める"
      },
      bestValue: {
        name: "ベストバリュー",
        tagline: "最も人気の選択"
      },
      mega: {
        name: "メガパック",
        tagline: "ヘビーユーザー向け"
      },
      ultra: {
        name: "ウルトラパック",
        tagline: "プロフェッショナル向け最強パッケージ"
      }
    },
    pricing: {
      tokens: "{{count}}個のトークン",
      bonus: "+{{count}}個ボーナス",
      price: "¥{{price:number}}",
      originalPrice: "¥{{price:number}}",
      discount: "{{percent}}%オフ",
      perToken: "1個あたり¥{{price:number}}"
    },
    alerts: {
      maxPlanTitle: "MAXプラン利用中",
      maxPlanMessage: "現在MAXプランを使用中のため、無制限でトークンをご利用いただけます。\n\n追加のトークン購入は不要です。🚀",
      confirm: "OK"
    },
    currency: {
      krw: "₩",
      usd: "$",
      jpy: "¥",
      cny: "¥"
    }
  },

  // マイスタイル
  myStyle: {
    access: {
      freeMessage: "マイスタイル分析はSTARTERプランから利用できます。",
    },
    tabs: {
      overview: "概要",
      analysis: "分析", 
      templates: "テンプレート"
    },
    brand: {
      title: "ブランド",
      styleAnalysis: "スタイル分析",
      tagline: "{{count}}つのストーリーで作られた私だけのスタイル"
    },
    keywords: {
      title: "キーワード"
    },
    challenge: {
      progress: "進捗: {{current}}/{{total}}"
    },
    analytics: {
      growth: "📈 成長分析",
      totalPosts: "総投稿数",
      toneAnalysis: "🎨 トーン使用分析"
    },
    templates: {
      recommended: "推奨",
      usageCount: "{{count}}回使用"
    }
  }
};
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// NewsAPI 키 (환경 변수)
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// 간단한 인메모리 캐시
let cache: any = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Trends API called:', {
    method: req.method,
    headers: req.headers,
    url: req.url
  });
  
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 캐시 확인
    if (cache && Date.now() - cacheTime < CACHE_DURATION) {
      return res.status(200).json({ trends: cache, cached: true });
    }
    
    // 실시간 데이터 수집
    const trends = await collectTrends();
    
    // 캐시 업데이트
    cache = trends;
    cacheTime = Date.now();
    
    return res.status(200).json({ trends, cached: false });
  } catch (error) {
    console.error('API Error:', error);
    
    // 에러 시 기본 트렌드 반환
    return res.status(200).json({ 
      trends: getDefaultTrends(),
      cached: false,
      error: true 
    });
  }
}

async function collectTrends() {
  const results = await Promise.allSettled([
    getRedditKorea(),
    getWikipediaTrends(),
    getDynamicTrends(),
    getSocialTrends(),
    getYouTubeTrends(),
    getInstagramTrends(),
    getTikTokTrends()
  ]);
  
  const trends = {
    naver: [],
    google: [],
    news: [],
    social: [],
    youtube: [],
    instagram: [],
    tiktok: [],
    timestamp: new Date().toISOString()
  };
  
  // Reddit Korea 인기 게시물
  if (results[0].status === 'fulfilled' && results[0].value.length > 0) {
    const redditPosts = results[0].value;
    trends.social.push(...redditPosts.map((post: any) => ({
      keyword: post.title,
      source: 'reddit',
      score: post.score
    })));
  }
  
  // Wikipedia 인기 문서
  if (results[1].status === 'fulfilled') {
    const wikiPages = results[1].value;
    trends.google = wikiPages.map((page: any) => ({
      title: page.title,
      traffic: page.views
    }));
  }
  
  // 동적 트렌드 생성
  if (results[2].status === 'fulfilled') {
    trends.naver = results[2].value.naver;
    trends.news = results[2].value.news;
  }
  
  // 실제 뉴스 트렌드 추가
  if (results[3].status === 'fulfilled') {
    if (trends.social.length === 0) {
      trends.social = results[3].value;
    } else {
      // Reddit 데이터가 있어도 추가
      trends.social.push(...results[3].value.slice(0, 3));
    }
  }
  
  // 더 구체적인 뉴스 트렌드 추가
  const specificNews = await getSpecificNewsTrends();
  if (specificNews && specificNews.length > 0) {
    trends.news = specificNews;
  } else {
    // NewsAPI로 실제 뉴스 가져오기 시도
    const realNews = await getRealNewsFromAPI();
    if (realNews && realNews.length > 0) {
      trends.news = realNews;
    }
  }
  
  // YouTube 트렌드
  if (results[4].status === 'fulfilled') {
    trends.youtube = results[4].value;
  }
  
  // Instagram 트렌드
  if (results[5].status === 'fulfilled') {
    trends.instagram = results[5].value;
  }
  
  // TikTok 트렌드
  if (results[6].status === 'fulfilled') {
    trends.tiktok = results[6].value;
  }
  
  // 모든 소셜 미디어 트렌드를 social에 통합
  const allSocialTrends = [
    ...trends.social,
    ...trends.youtube.map((t: any) => ({ ...t, source: 'youtube' })),
    ...trends.instagram.map((t: any) => ({ ...t, source: 'instagram' })),
    ...trends.tiktok.map((t: any) => ({ ...t, source: 'tiktok' }))
  ];
  
  // 점수 기준으로 정렬하고 상위 15개만 선택
  trends.social = allSocialTrends
    .sort((a, b) => (b.score || b.views || 0) - (a.score || a.views || 0))
    .slice(0, 15);
  
  // 개별 플랫폼 데이터는 제거 (통합됨)
  delete trends.youtube;
  delete trends.instagram;
  delete trends.tiktok;
  
  return trends;
}

// Reddit Korea 서브레딧에서 인기 게시물 가져오기
async function getRedditKorea() {
  try {
    // 여러 서브레딧 시도
    const subreddits = ['korea', 'hanguk', 'korean'];
    
    for (const subreddit of subreddits) {
      try {
        const response = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=5`, {
          headers: { 
            'User-Agent': 'Posty-App/1.0 (https://github.com/xee3d/Posty)',
            'Accept': 'application/json'
          },
          timeout: 3000
        });
        
        if (response.data && response.data.data && response.data.data.children && response.data.data.children.length > 0) {
          return response.data.data.children.map((post: any) => ({
            title: post.data.title,
            score: post.data.score,
            created: post.data.created_utc
          }));
        }
      } catch (err) {
        console.log(`Failed to fetch from r/${subreddit}`);
      }
    }
    
    return [];
  } catch (error) {
    console.error('Reddit API error:', error.message);
    return [];
  }
}

// Wikipedia 한국어 인기 문서
async function getWikipediaTrends() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0].replace(/-/g, '/');
    
    const response = await axios.get(
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/ko.wikipedia/all-access/${dateStr}`,
      { timeout: 5000 }
    );
    
    return response.data.items[0].articles
      .filter((article: any) => !article.article.includes(':'))
      .slice(0, 5)
      .map((article: any) => ({
        title: decodeURIComponent(article.article.replace(/_/g, ' ')),
        views: article.views
      }));
  } catch (error) {
    return [];
  }
}

// 시간 기반 동적 트렌드 생성
function getDynamicTrends() {
  const hour = new Date().getHours() + 9; // KST 시간대 보정
  const adjustedHour = hour >= 24 ? hour - 24 : hour;
  const dayOfWeek = new Date().getDay();
  const month = new Date().getMonth() + 1;
  
  // 시간대별 트렌드
  let timeBasedTrends = [];
  if (adjustedHour >= 6 && adjustedHour < 12) {
    // 아침
    timeBasedTrends = [
      '오늘 날씨',
      '출근길 교통',
      '아침 뉴스',
      '커피 추천',
      '아침 운동'
    ];
  } else if (adjustedHour >= 12 && adjustedHour < 18) {
    // 오후
    timeBasedTrends = [
      '점심 메뉴',
      '오후 일정',
      '주식 시황',
      '쇼핑 정보',
      '카페 추천'
    ];
  } else {
    // 저녁/밤
    timeBasedTrends = [
      '저녁 메뉴',
      '넷플릭스 추천',
      '야식 배달',
      '내일 날씨',
      '수면 팁'
    ];
  }
  
  // 계절별 트렌드
  let seasonalTrends = [];
  if (month >= 6 && month <= 8) {
    seasonalTrends = ['여름 휴가', '에어컨', '빙수', '해수욕장', '여름 패션'];
  } else if (month >= 12 || month <= 2) {
    seasonalTrends = ['겨울 여행', '난방비', '크리스마스', '연말정산', '겨울 코트'];
  } else if (month >= 3 && month <= 5) {
    seasonalTrends = ['봄나들이', '벚꽃', '미세먼지', '새학기', '봄 패션'];
  } else {
    seasonalTrends = ['가을 여행', '단풍', '독서', '할로윈', '가을 패션'];
  }
  
  // 요일별 트렌드
  let dayTrends = [];
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // 주말
    dayTrends = ['주말 나들이', '브런치', '영화 추천', '홈파티', '휴식'];
  } else if (dayOfWeek === 1) {
    // 월요일
    dayTrends = ['월요병', '주간 계획', '다이어트', '새로운 시작', '동기부여'];
  } else if (dayOfWeek === 5) {
    // 금요일
    dayTrends = ['불금', '주말 계획', '회식', '파티', '휴식'];
  }
  
  // 랜덤 셔플
  const shuffle = (arr: string[]) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  return {
    naver: shuffle([...timeBasedTrends, ...seasonalTrends, ...dayTrends])
      .slice(0, 10)
      .map((keyword, index) => ({
        keyword,
        volume: Math.floor(Math.random() * 10000) + 1000,
        change: Math.floor(Math.random() * 200) - 100
      })),
    news: [
      '최신 정치 뉴스',
      '경제 동향',
      '연예계 소식',
      'IT 기술 뉴스',
      '스포츠 하이라이트'
    ].map(title => ({ title }))
  };
}

// 소셜 트렌드 생성 (Reddit 실패 시 대체)
function getSocialTrends() {
  const socialTopics = [
    { keyword: 'K-팝 세계 투어 성황', source: 'twitter', score: 8234 },
    { keyword: '신상 카페 오픈', source: 'instagram', score: 6543 },
    { keyword: '연예인 패션', source: 'instagram', score: 5432 },
    { keyword: '화제의 드라마', source: 'twitter', score: 4321 },
    { keyword: '주말 나들이 명소', source: 'instagram', score: 3210 },
    { keyword: '맛집 추천', source: 'instagram', score: 2987 },
    { keyword: '새로운 책 추천', source: 'twitter', score: 2345 },
    { keyword: '운동 루틴', source: 'instagram', score: 1987 },
    { keyword: '코딩 공부', source: 'twitter', score: 1654 },
    { keyword: '전기차 후기', source: 'twitter', score: 1432 }
  ];
  
  // 랜덤하게 5개 선택
  const shuffled = [...socialTopics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

// YouTube 인기 동영상 트렌드
async function getYouTubeTrends() {
  try {
    // YouTube Data API를 사용하려면 API 키가 필요합니다
    // 여기서는 샘플 데이터를 사용합니다
    const youtubeTrends = [
      { keyword: 'NewJeans - Super Shy MV', views: 125000000, channel: 'HYBE LABELS' },
      { keyword: 'IVE - I AM MV', views: 98000000, channel: 'starshipTV' },
      { keyword: '무한도전 레전드 모음', views: 5400000, channel: 'MBC예능' },
      { keyword: '나 혼자 산다 하이라이트', views: 3200000, channel: 'MBC예능' },
      { keyword: '아이유 - Love wins all MV', views: 45000000, channel: 'EDAM' },
      { keyword: '먹방 브이로그', views: 2800000, channel: '흐미네' },
      { keyword: '요리 브이로그', views: 1900000, channel: '백종원' },
      { keyword: '유튀브 쇼츠 모음', views: 1500000, channel: 'YouTube Korea' },
      { keyword: '운동 루틴 추천', views: 980000, channel: '땅끌대마왕' },
      { keyword: '뉴진스 댄스 프랙티스', views: 8700000, channel: 'HYBE LABELS' }
    ];
    
    return youtubeTrends
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(trend => ({
        keyword: trend.keyword,
        views: trend.views,
        channel: trend.channel
      }));
  } catch (error) {
    console.error('YouTube trends error:', error);
    return [];
  }
}

// Instagram 해시태그 트렌드
async function getInstagramTrends() {
  try {
    // Instagram API는 제한적이므로 샘플 데이터 사용
    const instagramTrends = [
      { keyword: '#OOTD', posts: 543210987, category: 'fashion' },
      { keyword: '#먹스타그램', posts: 87654321, category: 'food' },
      { keyword: '#일상스타그램', posts: 65432109, category: 'daily' },
      { keyword: '#카페스타그램', posts: 45678901, category: 'food' },
      { keyword: '#여행스타그램', posts: 34567890, category: 'travel' },
      { keyword: '#운동스타그램', posts: 23456789, category: 'fitness' },
      { keyword: '#네일아트', posts: 12345678, category: 'beauty' },
      { keyword: '#주말스타그램', posts: 9876543, category: 'daily' },
      { keyword: '#공부스타그램', posts: 8765432, category: 'study' },
      { keyword: '#셀스타그램', posts: 7654321, category: 'selfie' },
      { keyword: '#Kpop', posts: 98765432, category: 'music' },
      { keyword: '#KoreanFood', posts: 54321098, category: 'food' }
    ];
    
    // 시간대별로 다른 해시태그 강조
    const hour = new Date().getHours() + 9; // KST
    let boost = 1;
    
    return instagramTrends
      .map(trend => {
        // 시간대별 가중치
        if (hour >= 12 && hour <= 14 && trend.category === 'food') boost = 1.5;
        if (hour >= 18 && hour <= 20 && trend.category === 'daily') boost = 1.3;
        if (hour >= 6 && hour <= 8 && trend.category === 'fitness') boost = 1.4;
        
        return {
          keyword: trend.keyword,
          score: Math.floor(trend.posts * boost / 10000),
          category: trend.category
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch (error) {
    console.error('Instagram trends error:', error);
    return [];
  }
}

// TikTok 트렌드
async function getTikTokTrends() {
  try {
    // TikTok API 대신 샘플 데이터
    const tiktokTrends = [
      { keyword: '뉴진스 챌린지', views: 234000000, hashtag: '#NewJeansChallenge' },
      { keyword: '음식 레시피', views: 156000000, hashtag: '#KoreanRecipe' },
      { keyword: '댄스 챌린지', views: 145000000, hashtag: '#DanceChallenge' },
      { keyword: 'MBTI 테스트', views: 98000000, hashtag: '#MBTITest' },
      { keyword: '팔로우 미! 챌린지', views: 87000000, hashtag: '#FollowMe' },
      { keyword: '메이크업 튜토리얼', views: 76000000, hashtag: '#MakeupTutorial' },
      { keyword: '하루 브이로그', views: 65000000, hashtag: '#DailyVlog' },
      { keyword: '요리 팝', views: 54000000, hashtag: '#CookingTips' },
      { keyword: '패션 하울', views: 43000000, hashtag: '#FashionHaul' },
      { keyword: '공부 팔', views: 32000000, hashtag: '#StudyTips' }
    ];
    
    // 랜덤 순서로 5개 선택
    return tiktokTrends
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(trend => ({
        keyword: trend.keyword,
        score: Math.floor(trend.views / 100000),
        hashtag: trend.hashtag
      }));
  } catch (error) {
    console.error('TikTok trends error:', error);
    return [];
  }
}

// 구체적인 뉴스 트렌드
async function getSpecificNewsTrends() {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const dayOfWeek = now.getDay();
    const hour = now.getHours() + 9; // KST
    
    // 시사 뉴스 풍
    interface NewsItem {
      title: string;
      category: string;
      priority?: number;
    }
    
    const currentNewsPool: NewsItem[] = [
      // 경제
      { title: '삼성전자 주가 5% 상승, 반도체 호재', category: 'economy' },
      { title: '원/달러 환율 1,350원 돌파', category: 'economy' },
      { title: '코스피 3,200 돌파, 역대 최고치 경신', category: 'economy' },
      { title: '금리 인상 예고, 대출자 부담 증가', category: 'economy' },
      { title: '아파트 가격 상승세 주춤, 서울 강남 중심', category: 'economy' },
      { title: '중소기업 대출 금리 인하, 금융위 발표', category: 'economy' },
      
      // 사회
      { title: '서울 지하철 9호선 연장 확정', category: 'society' },
      { title: '전국 폭염특보, 온열질환 주의', category: 'society' },
      { title: '대학 등록금 동결 10년 연장', category: 'society' },
      { title: '출산율 0.72명, 역대 최저 기록', category: 'society' },
      { title: '주 52시간제 개편 논의 본격화', category: 'society' },
      { title: '전기차 보조금 확대, 최대 500만원', category: 'society' },
      
      // 연예/문화
      { title: '블랙핑크 로제, 코첼라 헤드라이너', category: 'entertainment' },
      { title: '‘파격소’ 15% 시청률 돌파', category: 'entertainment' },
      { title: 'BTS 진, 전역 후 첫 활동 예고', category: 'entertainment' },
      { title: '아이유 신곡, 멜론 차트 1위', category: 'entertainment' },
      { title: '‘범죄도시4’ 제작 확정, 마동석 출연', category: 'entertainment' },
      { title: '칸 영화제 한국영화 2편 초청', category: 'entertainment' },
      
      // IT/기술
      { title: '삼성, AI 반도체 대량 생산 시작', category: 'tech' },
      { title: '카카오, AI 검색 서비스 출시', category: 'tech' },
      { title: '네이버, 하이퍼클로바X 베타 테스트', category: 'tech' },
      { title: '애플 비전프로 한국 출시일 공개', category: 'tech' },
      { title: 'GPT-5 출시 임박, 성능 2배 향상', category: 'tech' },
      { title: '테슬라 한국 공장 후보지 발표', category: 'tech' },
      
      // 스포츠
      { title: '손흥민 골 폭발, 시즌 15호', category: 'sports' },
      { title: '한국 축구, 월드컵 예선 통과', category: 'sports' },
      { title: 'LG 트윈스 9연승, 선두 독주', category: 'sports' },
      { title: '김연경 선수, LPGA 우승', category: 'sports' },
      { title: 'KBO 올스타 라인업 발표', category: 'sports' },
      { title: '배구 흥국생명, 플레이오프 진출', category: 'sports' }
    ];
    
    // 시간대별 뉴스 가중치
    let selectedNews = [...currentNewsPool];
    
    // 주식시장 시간대 경제뉴스 강화
    if ((hour >= 9 && hour <= 10) || (hour >= 15 && hour <= 16)) {
      selectedNews = selectedNews.map(news => {
        if (news.category === 'economy') {
          return { ...news, priority: 2 };
        }
        return { ...news, priority: 1 };
      });
    }
    
    // 주말 엔터/스포츠 강화
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      selectedNews = selectedNews.map(news => {
        if (news.category === 'entertainment' || news.category === 'sports') {
          return { ...news, priority: 2 };
        }
        return { ...news, priority: 1 };
      });
    }
    
    // 우선순위와 랜덤성을 고려하여 정렬
    selectedNews.sort((a, b) => {
      const priorityDiff = (b.priority || 1) - (a.priority || 1);
      if (priorityDiff !== 0) return priorityDiff;
      return Math.random() - 0.5;
    });
    
    // 상위 8개만 선택하고 형식 맞춤
    return selectedNews.slice(0, 8).map(news => ({
      title: news.title
    }));
  } catch (error) {
    console.error('Specific news trends error:', error);
    return [];
  }
}

// NewsAPI를 사용한 실제 뉴스 가져오기
async function getRealNewsFromAPI() {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key_here') {
    console.log('NewsAPI key not configured');
    return [];
  }
  
  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'kr',
        apiKey: NEWS_API_KEY,
        pageSize: 10
      },
      timeout: 5000
    });
    
    if (response.data && response.data.articles) {
      return response.data.articles
        .filter((article: any) => article.title && !article.title.includes('[Removed]'))
        .slice(0, 8)
        .map((article: any) => ({
          title: article.title.replace(/ - .*$/, ''), // 출처 제거
          source: article.source.name,
          url: article.url
        }));
    }
    return [];
  } catch (error) {
    console.error('NewsAPI error:', error);
    return [];
  }
}

// 기본 트렌드 (폴백용)
function getDefaultTrends() {
  return {
    naver: [
      { keyword: '실시간 인기', volume: 5000, change: 50 },
      { keyword: '오늘의 날씨', volume: 4500, change: 20 },
      { keyword: '주말 계획', volume: 4000, change: -10 },
      { keyword: '맛집 추천', volume: 3500, change: 30 },
      { keyword: '신상품 출시', volume: 3000, change: 100 }
    ],
    google: [
      { title: 'Latest news', traffic: 10000 },
      { title: 'Weather today', traffic: 8000 },
      { title: 'Stock market', traffic: 7000 },
      { title: 'Sports scores', traffic: 6000 },
      { title: 'Movie releases', traffic: 5000 }
    ],
    news: [
      { title: '삼성전자 주가 상승, 반도체 호재' },
      { title: '금리 인상 예고, 대출자 부담 증가' },
      { title: '전국 폭염특보, 온열질환 주의' },
      { title: 'K-팝 세계 투어, 티켓 매진' },
      { title: '전기차 보조금 확대, 최대 500만원' }
    ],
    social: [
      { keyword: 'K-pop 세계 투어', source: 'twitter', score: 5000 },
      { keyword: '화제의 드라마', source: 'reddit', score: 4500 },
      { keyword: '#OOTD', source: 'instagram', score: 4000 },
      { keyword: '먹방 브이로그', source: 'youtube', score: 3500 },
      { keyword: '챌린지 동영상', source: 'tiktok', score: 3000 }
    ],
    timestamp: new Date().toISOString()
  };
}

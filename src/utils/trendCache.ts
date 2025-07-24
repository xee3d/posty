/**
 * 트렌드 데이터 전역 캐시
 * 앱 세션 동안 메모리에서 유지되어 빠른 접근 제공
 */

interface TrendCacheData {
  trends: any[];
  userTrends: any;
  lastLoadTime: number;
  error: string | null;
}

class TrendCache {
  private cache: TrendCacheData | null = null;
  private readonly CACHE_DURATION = 4 * 60 * 60 * 1000; // 4시간

  // 캐시 저장
  set(data: TrendCacheData): void {
    this.cache = {
      ...data,
      lastLoadTime: Date.now()
    };
    console.log('[TrendCache] Data cached successfully');
  }

  // 캐시 조회
  get(): TrendCacheData | null {
    if (!this.cache) {
      console.log('[TrendCache] No cache found');
      return null;
    }

    const now = Date.now();
    const isExpired = (now - this.cache.lastLoadTime) > this.CACHE_DURATION;

    if (isExpired) {
      console.log('[TrendCache] Cache expired, clearing');
      this.cache = null;
      return null;
    }

    console.log('[TrendCache] Cache hit - returning cached data');
    return this.cache;
  }

  // 캐시 삭제
  clear(): void {
    this.cache = null;
    console.log('[TrendCache] Cache cleared');
  }

  // 캐시 존재 여부
  exists(): boolean {
    const cached = this.get();
    return cached !== null && cached.trends.length > 0;
  }

  // 캐시 나이 (분)
  getAge(): number {
    if (!this.cache) return Infinity;
    return Math.floor((Date.now() - this.cache.lastLoadTime) / (1000 * 60));
  }
}

export default new TrendCache();
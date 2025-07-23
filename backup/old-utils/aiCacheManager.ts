// utils/aiCacheManager.ts
interface CacheItem {
  content: string;
  timestamp: number;
  params: any;
}

class AICacheManager {
  private cache: Map<string, CacheItem> = new Map();
  private maxAge: number = 30 * 60 * 1000; // 30분
  private maxSize: number = 100; // 최대 100개 캐시

  // 캐시 키 생성
  private getCacheKey(params: any): string {
    const { prompt, tone, platform, length } = params;
    return `${prompt}-${tone}-${platform}-${length}`.toLowerCase();
  }

  // 캐시 조회
  get(params: any): string | null {
    const key = this.getCacheKey(params);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // 만료 체크
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    console.log('AI Cache hit:', key);
    return cached.content;
  }

  // 캐시 저장
  set(params: any, content: string): void {
    const key = this.getCacheKey(params);

    // 크기 제한 체크
    if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      content,
      timestamp: Date.now(),
      params
    });

    console.log('AI Cache saved:', key);
  }

  // 캐시 초기화
  clear(): void {
    this.cache.clear();
  }

  // 캐시 통계
  getStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0, // 실제 구현 시 카운터 추가
      misses: 0
    };
  }
}

// 싱글톤 인스턴스
export const aiCacheManager = new AICacheManager();

// utils/imageAnalysisCache.ts
interface ImageCacheItem {
  description: string;
  analysis: any;
  timestamp: number;
}

class ImageAnalysisCache {
  private cache: Map<string, ImageCacheItem> = new Map();
  private maxAge: number = 60 * 60 * 1000; // 1시간
  private maxSize: number = 50; // 최대 50개 이미지

  // 이미지 해시 생성 (간단한 방식)
  private getImageHash(imageData: string): string {
    // base64의 일부를 해시로 사용 (실제로는 더 정교한 해싱 필요)
    const cleanData = imageData.replace(/^data:image\/\w+;base64,/, "");
    return cleanData.substring(0, 100); // 첫 100자를 키로 사용
  }

  // 캐시 조회
  get(imageData: string): any | null {
    const hash = this.getImageHash(imageData);
    const cached = this.cache.get(hash);

    if (!cached) {
      return null;
    }

    // 만료 체크
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(hash);
      return null;
    }

    console.log("Image analysis cache hit");
    return cached.analysis;
  }

  // 캐시 저장
  set(imageData: string, analysis: any): void {
    const hash = this.getImageHash(imageData);

    // 크기 제한 체크
    if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거
      const oldestKey = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      )[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(hash, {
      description: analysis.description,
      analysis,
      timestamp: Date.now(),
    });

    console.log("Image analysis cached");
  }

  // 캐시 초기화
  clear(): void {
    this.cache.clear();
  }
}

// 싱글톤 인스턴스
export const imageAnalysisCache = new ImageAnalysisCache();

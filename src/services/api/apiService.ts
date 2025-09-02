/**
 * 통합 API 서비스
 * 모든 API 호출을 중앙화하고 에러 처리, 재시도, 타임아웃 등을 관리
 */

interface ApiOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiService {
  private readonly DEFAULT_TIMEOUT = 10000; // 10초
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1초

  /**
   * API 호출 with 재시도 로직
   */
  async callWithRetry<T = any>(
    url: string,
    options: ApiOptions = {},
    retries = 0
  ): Promise<ApiResponse<T>> {
    const { timeout = this.DEFAULT_TIMEOUT, ...fetchOptions } = options;

    try {
      // AbortController로 타임아웃 구현
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 응답 처리
      const contentType = response.headers.get("content-type");
      let data: any;

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
        } catch (e) {
          console.error("[ApiService] JSON parse error:", e);
          data = null;
        }
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // 4xx 에러는 재시도하지 않음
        if (response.status >= 400 && response.status < 500) {
          return {
            error: data?.error || `Client error: ${response.status}`,
            status: response.status,
          };
        }

        // 5xx 에러는 재시도
        throw new Error(`Server error: ${response.status}`);
      }

      return {
        data,
        status: response.status,
      };
    } catch (error: any) {
      console.error(`[ApiService] Error calling ${url}:`, error.message);

      // 재시도 가능한 에러인지 확인
      const isRetryable =
        error.name === "AbortError" || // 타임아웃
        error.message.includes("network") || // 네트워크 에러
        error.message.includes("Server error"); // 서버 에러

      if (isRetryable && retries < this.MAX_RETRIES) {
        console.log(
          `[ApiService] Retry ${retries + 1}/${this.MAX_RETRIES} for ${url}`
        );

        // 지수 백오프
        await this.delay(this.RETRY_DELAY * Math.pow(2, retries));

        return this.callWithRetry(url, options, retries + 1);
      }

      return {
        error: error.message || "Unknown error",
        status: 0,
      };
    }
  }

  /**
   * GET 요청
   */
  async get<T = any>(
    url: string,
    options?: ApiOptions
  ): Promise<ApiResponse<T>> {
    return this.callWithRetry<T>(url, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST 요청
   */
  async post<T = any>(
    url: string,
    body: any,
    options?: ApiOptions
  ): Promise<ApiResponse<T>> {
    return this.callWithRetry<T>(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 헬스 체크
   */
  async healthCheck(url: string): Promise<boolean> {
    try {
      const response = await this.get(`${url}/health`, {
        timeout: 5000,
        retries: 1,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// 싱글톤 인스턴스
const apiService = new ApiService();

export default apiService;
export type { ApiResponse, ApiOptions };

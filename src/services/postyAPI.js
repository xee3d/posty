import API_CONFIG, { getApiUrl, getAuthHeader } from '../config/api';

class PostyAPIService {
  // Health check
  async checkHealth() {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: API_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Generate content
  async generateContent(prompt, options = {}) {
    try {
      const { tone = 'friendly', platform = 'instagram' } = options;

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GENERATE), {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          prompt,
          tone,
          platform,
        }),
        timeout: API_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Generate content failed:', error);
      throw error;
    }
  }

  // Test generate endpoint (GET request)
  async testGenerate() {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GENERATE_TEST), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: API_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Test generate failed:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
const postyAPI = new PostyAPIService();
export default postyAPI;

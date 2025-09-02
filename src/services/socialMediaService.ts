// SNS API 서비스 - Facebook/Instagram 데이터 연동
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SocialMediaPost {
  id: string;
  platform: "instagram" | "facebook";
  mediaId: string; // SNS 플랫폼의 실제 게시물 ID
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    saved?: number;
  };
  lastUpdated: string;
}

interface AccessTokens {
  instagram?: string;
  facebook?: string;
}

class SocialMediaService {
  private STORAGE_KEYS = {
    ACCESS_TOKENS: "SOCIAL_MEDIA_TOKENS",
    POST_MAPPINGS: "SOCIAL_MEDIA_POST_MAPPINGS",
  };

  // 액세스 토큰 저장
  async saveAccessToken(
    platform: "instagram" | "facebook",
    token: string
  ): Promise<void> {
    try {
      const tokens = await this.getAccessTokens();
      tokens[platform] = token;
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.ACCESS_TOKENS,
        JSON.stringify(tokens)
      );
    } catch (error) {
      console.error("Failed to save access token:", error);
      throw error;
    }
  }

  // 액세스 토큰 가져오기
  async getAccessTokens(): Promise<AccessTokens> {
    try {
      const tokensJson = await AsyncStorage.getItem(
        this.STORAGE_KEYS.ACCESS_TOKENS
      );
      return tokensJson ? JSON.parse(tokensJson) : {};
    } catch (error) {
      console.error("Failed to get access tokens:", error);
      return {};
    }
  }

  // Instagram 게시물 인사이트 가져오기
  async getInstagramInsights(mediaId: string): Promise<SocialMediaPost | null> {
    try {
      const tokens = await this.getAccessTokens();
      if (!tokens.instagram) {
        throw new Error("Instagram access token not found");
      }

      // Instagram Graph API 호출
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${mediaId}?` +
          "fields=id,media_type,media_url,caption,timestamp," +
          "likes_count,comments_count,insights.metric(reach,impressions,saved)&" +
          `access_token=${tokens.instagram}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Instagram insights");
      }

      const data = await response.json();

      // 인사이트 데이터 파싱
      const insights = data.insights?.data || [];
      const reach =
        insights.find((i) => i.name === "reach")?.values[0]?.value || 0;
      const saved =
        insights.find((i) => i.name === "saved")?.values[0]?.value || 0;

      return {
        id: data.id,
        platform: "instagram",
        mediaId: data.id,
        metrics: {
          likes: data.likes_count || 0,
          comments: data.comments_count || 0,
          shares: 0, // Instagram은 공유 수 제공 안함
          reach: reach,
          saved: saved,
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to get Instagram insights:", error);
      return null;
    }
  }

  // Facebook 페이지 게시물 인사이트 가져오기
  async getFacebookInsights(postId: string): Promise<SocialMediaPost | null> {
    try {
      const tokens = await this.getAccessTokens();
      if (!tokens.facebook) {
        throw new Error("Facebook access token not found");
      }

      // Facebook Graph API 호출
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?` +
          "fields=id,message,created_time," +
          "reactions.summary(total_count)," +
          "comments.summary(total_count)," +
          "shares," +
          "insights.metric(post_impressions_unique,post_engaged_users)&" +
          `access_token=${tokens.facebook}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Facebook insights");
      }

      const data = await response.json();

      // 인사이트 데이터 파싱
      const insights = data.insights?.data || [];
      const reach =
        insights.find((i) => i.name === "post_impressions_unique")?.values[0]
          ?.value || 0;

      return {
        id: data.id,
        platform: "facebook",
        mediaId: data.id,
        metrics: {
          likes: data.reactions?.summary?.total_count || 0,
          comments: data.comments?.summary?.total_count || 0,
          shares: data.shares?.count || 0,
          reach: reach,
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to get Facebook insights:", error);
      return null;
    }
  }

  // 게시물 ID 매핑 저장 (로컬 게시물 ID와 SNS 게시물 ID 연결)
  async savePostMapping(
    localPostId: string,
    platform: "instagram" | "facebook",
    mediaId: string
  ): Promise<void> {
    try {
      const mappings = await this.getPostMappings();
      mappings[localPostId] = {
        platform,
        mediaId,
      };
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.POST_MAPPINGS,
        JSON.stringify(mappings)
      );
    } catch (error) {
      console.error("Failed to save post mapping:", error);
    }
  }

  // 게시물 ID 매핑 가져오기
  async getPostMappings(): Promise<
    Record<string, { platform: string; mediaId: string }>
  > {
    try {
      const mappingsJson = await AsyncStorage.getItem(
        this.STORAGE_KEYS.POST_MAPPINGS
      );
      return mappingsJson ? JSON.parse(mappingsJson) : {};
    } catch (error) {
      console.error("Failed to get post mappings:", error);
      return {};
    }
  }

  // 자동으로 모든 연결된 게시물의 인사이트 업데이트
  async syncAllPostInsights(): Promise<void> {
    try {
      const mappings = await this.getPostMappings();
      const updatePromises = [];

      for (const [localPostId, mapping] of Object.entries(mappings)) {
        if (mapping.platform === "instagram") {
          updatePromises.push(
            this.getInstagramInsights(mapping.mediaId).then((insights) => {
              if (insights) {
                return { localPostId, insights };
              }
              return null;
            })
          );
        } else if (mapping.platform === "facebook") {
          updatePromises.push(
            this.getFacebookInsights(mapping.mediaId).then((insights) => {
              if (insights) {
                return { localPostId, insights };
              }
              return null;
            })
          );
        }
      }

      const results = await Promise.all(updatePromises);

      // localAnalyticsService와 연동하여 메트릭 업데이트
      // TODO: localAnalyticsService.updatePostMetrics 호출
      console.log(
        "Synced insights:",
        results.filter((r) => r !== null)
      );
    } catch (error) {
      console.error("Failed to sync insights:", error);
    }
  }

  // OAuth 로그인 URL 생성
  getInstagramAuthUrl(appId: string, redirectUri: string): string {
    return (
      "https://api.instagram.com/oauth/authorize?" +
      `client_id=${appId}&` +
      `redirect_uri=${redirectUri}&` +
      "scope=user_profile,user_media&" +
      "response_type=code"
    );
  }

  getFacebookAuthUrl(appId: string, redirectUri: string): string {
    return (
      "https://www.facebook.com/v18.0/dialog/oauth?" +
      `client_id=${appId}&` +
      `redirect_uri=${redirectUri}&` +
      "scope=pages_show_list,pages_read_engagement,pages_read_user_content&" +
      "response_type=code"
    );
  }
}

export default new SocialMediaService();

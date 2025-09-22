import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTION_API_KEY } from '@env';

// Notion API 구성
const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

// 환경 설정 (.env 파일에서 가져옴)
const NOTION_CONFIG = {
  // Notion API 키 (.env 파일에서 설정)
  API_KEY: NOTION_API_KEY || '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',
  // Legal Documents 메인 페이지 ID (데이터베이스가 아님)
  MAIN_PAGE_ID: '26cdc2bce21c81f28723fc6d2a0ed157',
};

export interface NotionDocument {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  language: string;
  type: 'privacy' | 'terms';
}

export interface NotionApiError {
  code: string;
  message: string;
}

class NotionApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${NOTION_API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${NOTION_CONFIG.API_KEY}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Notion API Error:', error);
      throw error;
    }
  }

  async getPage(pageId: string) {
    return this.makeRequest(`/pages/${pageId}`);
  }

  async getBlockChildren(blockId: string) {
    return this.makeRequest(`/blocks/${blockId}/children?page_size=100`);
  }

  async queryDatabase(databaseId: string, filter?: any) {
    return this.makeRequest(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        filter,
        sorts: [
          {
            property: 'Last Updated',
            direction: 'descending',
          },
        ],
      }),
    });
  }

  private parseBlockToText(block: any): string {
    const blockType = block.type;
    
    switch (blockType) {
      case 'paragraph':
        return this.parseRichText(block.paragraph.rich_text);
      case 'heading_1':
        return `# ${this.parseRichText(block.heading_1.rich_text)}`;
      case 'heading_2':
        return `## ${this.parseRichText(block.heading_2.rich_text)}`;
      case 'heading_3':
        return `### ${this.parseRichText(block.heading_3.rich_text)}`;
      case 'bulleted_list_item':
        return `• ${this.parseRichText(block.bulleted_list_item.rich_text)}`;
      case 'numbered_list_item':
        return `${this.parseRichText(block.numbered_list_item.rich_text)}`;
      case 'quote':
        return `> ${this.parseRichText(block.quote.rich_text)}`;
      case 'code':
        return `\`\`\`\n${this.parseRichText(block.code.rich_text)}\n\`\`\``;
      default:
        return '';
    }
  }

  private parseRichText(richText: any[]): string {
    return richText.map(text => text.plain_text).join('');
  }

  async getDocumentContent(pageId: string): Promise<string> {
    try {
      const blocks = await this.getBlockChildren(pageId);
      
      const content = blocks.results
        .map((block: any) => this.parseBlockToText(block))
        .filter((text: string) => text.trim().length > 0)
        .join('\n\n');

      return content;
    } catch (error) {
      console.error('Failed to get document content:', error);
      throw error;
    }
  }

  async getDocumentsByType(type: 'privacy' | 'terms', language: string): Promise<NotionDocument[]> {
    try {
      // 페이지 기반 구조에서 문서 찾기
      const documentKey = `${type}-${language}`;
      const pageId = this.getPageIdByDocumentKey(documentKey);
      
      if (!pageId) {
        console.warn(`Document not found for key: ${documentKey}`);
        return [];
      }

      const content = await this.getDocumentContent(pageId);
      const pageInfo = await this.getPage(pageId);
      
      const documents: NotionDocument[] = [{
        id: pageId,
        title: this.parseRichText(pageInfo.properties?.title?.title || []),
        content,
        lastUpdated: pageInfo.last_edited_time,
        language,
        type,
      }];

      return documents;
    } catch (error) {
      console.error('Failed to get documents by type:', error);
      throw error;
    }
  }

  // 문서 키로 페이지 ID 매핑
  private getPageIdByDocumentKey(documentKey: string): string | null {
    const pageMapping: Record<string, string> = {
      // 한국어
      'terms-ko': '26cdc2bc-e21c-81d6-b4ec-f69d2a3de8c1',      // [KO] 서비스 이용약관
      'privacy-ko': '26cdc2bc-e21c-8165-8456-c2e687bf1a87',    // [KO] 개인정보처리방침
      
      // 영어
      'terms-en': '26cdc2bc-e21c-815c-838f-d49eee2fcfa6',      // [EN] Terms of Service
      'privacy-en': '26cdc2bc-e21c-815b-a334-c5e6127ed2a8',    // [EN] Privacy Policy
      
      // 일본어
      'terms-ja': '26cdc2bc-e21c-812a-9389-c16f4cdc2814',      // [JA] 利用規約
      'privacy-ja': '26cdc2bc-e21c-817e-9b47-ca211be74d52',    // [JA] プライバシーポリシー
      
      // 중국어 (zh, zh-CN 모두 지원)
      'terms-zh': '26cdc2bc-e21c-81a2-99a1-f65950bf5124',      // [ZH] 服务条款
      'terms-zh-CN': '26cdc2bc-e21c-81a2-99a1-f65950bf5124',   // [ZH] 服务条款
      'privacy-zh': '26cdc2bc-e21c-8196-8557-e9a3e9f0f9d5',    // [ZH] 隐私政策
      'privacy-zh-CN': '26cdc2bc-e21c-8196-8557-e9a3e9f0f9d5', // [ZH] 隐私政策
    };
    
    return pageMapping[documentKey] || null;
  }

  async getDocument(documentKey: string): Promise<NotionDocument | null> {
    try {
      // documentKey 형식: 'terms-en', 'privacy-ja' 등
      const [type, language] = documentKey.split('-') as ['privacy' | 'terms', string];
      
      const documents = await this.getDocumentsByType(type, language);
      
      if (documents.length === 0) {
        return null;
      }

      // 가장 최근 문서 반환
      return documents[0];
    } catch (error) {
      console.error(`Failed to get document ${documentKey}:`, error);
      return null;
    }
  }

  // 캐시 관리
  private getCacheKey(documentKey: string): string {
    return `notion_document_${documentKey}`;
  }

  async getCachedDocument(documentKey: string): Promise<NotionDocument | null> {
    try {
      const cached = await AsyncStorage.getItem(this.getCacheKey(documentKey));
      if (cached) {
        const parsed = JSON.parse(cached);
        // 캐시가 24시간 이내인 경우에만 사용
        const cacheTime = new Date(parsed.cachedAt).getTime();
        const now = new Date().getTime();
        const dayInMs = 24 * 60 * 60 * 1000;
        
        if (now - cacheTime < dayInMs) {
          return parsed.document;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached document:', error);
      return null;
    }
  }

  async setCachedDocument(documentKey: string, document: NotionDocument): Promise<void> {
    try {
      const cacheData = {
        document,
        cachedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(this.getCacheKey(documentKey), JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache document:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const notionKeys = keys.filter(key => key.startsWith('notion_document_'));
      await AsyncStorage.multiRemove(notionKeys);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // API 키가 설정되어 있는지 확인
  isConfigured(): boolean {
    const hasKey = !!NOTION_CONFIG.API_KEY && NOTION_CONFIG.API_KEY.trim().length > 0;
    console.log('🔍 Notion API Configuration Check:', {
      hasKey,
      keyLength: NOTION_CONFIG.API_KEY ? NOTION_CONFIG.API_KEY.length : 0,
      keyPreview: NOTION_CONFIG.API_KEY ? `${NOTION_CONFIG.API_KEY.substring(0, 10)}...` : 'NO_KEY'
    });
    return hasKey;
  }
}

export const notionApiService = new NotionApiService();

// 테스트용 함수 (개발 환경에서만 사용)
export const testNotionConnection = async (): Promise<boolean> => {
  try {
    if (!notionApiService.isConfigured()) {
      console.warn('Notion API key is not configured');
      return false;
    }

    // 간단한 페이지 조회로 연결 테스트
    await notionApiService.getPage(NOTION_CONFIG.MAIN_PAGE_ID);
    console.log('✅ Notion API connection successful');
    return true;
  } catch (error) {
    console.error('❌ Notion API connection failed:', error);
    return false;
  }
};
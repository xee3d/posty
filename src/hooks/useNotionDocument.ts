import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotionSync } from '../context/NotionSyncContext';
import { notionApiService } from '../services/notionApi';

export interface NotionDocument {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  lastUpdated: string;  // Add this for compatibility with components
  url?: string;
  properties?: Record<string, any>;
}

interface UseNotionDocumentReturn {
  document: NotionDocument | null;
  isLoading: boolean;
  error: string | null;
  loadDocument: (documentId: string) => Promise<void>;
  refreshDocument: () => Promise<void>;
  cacheDocument: (doc: NotionDocument) => Promise<void>;
  loading: boolean;  // alias for isLoading
  refresh: () => Promise<void>; // alias for refreshDocument
  isNotionEnabled: boolean;
}

const DOCUMENT_CACHE_KEY = 'notionDocumentCache';

export const useNotionDocument = (initialDocumentId?: string): UseNotionDocumentReturn => {
  const [document, setDocument] = useState<NotionDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | undefined>(initialDocumentId);
  
  const { syncData } = useNotionSync();

  // Load document from cache
  const loadFromCache = useCallback(async (documentId: string): Promise<NotionDocument | null> => {
    try {
      const cached = await notionApiService.getCachedDocument(documentId);
      if (cached) {
        return {
          id: cached.id,
          title: cached.title,
          content: cached.content,
          lastModified: new Date(cached.lastUpdated),
          lastUpdated: cached.lastUpdated,
          url: `https://notion.so/${cached.id}`,
          properties: {
            language: cached.language,
            type: cached.type,
          },
        };
      }
    } catch (err) {
      console.error('Error loading document from cache:', err);
    }
    return null;
  }, []);

  // Cache document
  const cacheDocument = useCallback(async (doc: NotionDocument): Promise<void> => {
    try {
      // Convert our interface back to Notion format for caching
      const notionDoc = {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        lastUpdated: doc.lastModified.toISOString(),
        language: doc.properties?.language || 'en',
        type: doc.properties?.type as 'privacy' | 'terms' || 'privacy',
      };
      await notionApiService.setCachedDocument(doc.id, notionDoc);
    } catch (err) {
      console.error('Error caching document:', err);
    }
  }, []);

  // Fetch document from Notion API
  const fetchDocumentFromNotion = useCallback(async (documentId: string): Promise<NotionDocument | null> => {
    try {
      const notionDoc = await notionApiService.getDocument(documentId);
      
      if (!notionDoc) {
        return null;
      }

      // Convert Notion document format to our interface
      const document: NotionDocument = {
        id: notionDoc.id,
        title: notionDoc.title,
        content: notionDoc.content,
        lastModified: new Date(notionDoc.lastUpdated),
        lastUpdated: notionDoc.lastUpdated,
        url: `https://notion.so/${notionDoc.id}`,
        properties: {
          language: notionDoc.language,
          type: notionDoc.type,
        },
      };

      return document;
    } catch (error) {
      console.error('Error fetching document from Notion:', error);
      throw error;
    }
  }, []);

  // Load document
  const loadDocument = useCallback(async (documentId: string): Promise<void> => {
    console.log('📄 Loading document:', documentId);
    console.log('📡 Notion sync status:', {
      isConnected: syncData.isConnected,
      isConfigured: notionApiService.isConfigured(),
      documentsCount: syncData.documentsCount
    });

    setIsLoading(true);
    setError(null);
    setCurrentDocumentId(documentId);

    try {
      // First try to load from cache
      const cachedDoc = await loadFromCache(documentId);
      console.log('💾 Cached document found:', !!cachedDoc);
      if (cachedDoc) {
        setDocument(cachedDoc);
        setIsLoading(false);
      }

      // If connected to Notion, fetch fresh data
      if (syncData.isConnected) {
        console.log('🔄 Fetching fresh document from Notion...');
        const freshDoc = await fetchDocumentFromNotion(documentId);
        if (freshDoc) {
          console.log('✅ Fresh document loaded from Notion');
          setDocument(freshDoc);
          await cacheDocument(freshDoc);
        } else if (!cachedDoc) {
          throw new Error('Document not found in Notion and no cached version available');
        }
      } else if (!cachedDoc) {
        console.log('❌ Not connected to Notion and no cached document found');
        throw new Error('Not connected to Notion and no cached document found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
      console.error('❌ Document loading error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [syncData.isConnected, loadFromCache, fetchDocumentFromNotion, cacheDocument]);

  // Refresh current document
  const refreshDocument = useCallback(async (): Promise<void> => {
    if (!currentDocumentId) {
      setError('No document ID specified');
      return;
    }

    if (!syncData.isConnected) {
      setError('Not connected to Notion');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const freshDoc = await fetchDocumentFromNotion(currentDocumentId);
      if (freshDoc) {
        setDocument(freshDoc);
        await cacheDocument(freshDoc);
      } else {
        throw new Error('Document not found in Notion');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh document';
      setError(errorMessage);
      console.error('Error refreshing document:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentDocumentId, syncData.isConnected, fetchDocumentFromNotion, cacheDocument]);

  // Load initial document if provided
  useEffect(() => {
    if (initialDocumentId) {
      loadDocument(initialDocumentId);
    }
  }, [initialDocumentId, loadDocument]);

  const isNotionEnabled = syncData.isConnected && notionApiService.isConfigured();

  return {
    document,
    isLoading,
    error,
    loadDocument,
    refreshDocument,
    cacheDocument,
    loading: isLoading,  // alias for isLoading
    refresh: refreshDocument, // alias for refreshDocument
    isNotionEnabled,
  };
};

export default useNotionDocument;
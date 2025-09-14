import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notionApiService, testNotionConnection } from '../services/notionApi';

export interface NotionSyncData {
  isConnected: boolean;
  lastSyncTime?: Date;
  documentsCount: number;
  error?: string;
}

interface NotionSyncContextType {
  syncData: NotionSyncData;
  connectToNotion: () => Promise<void>;
  syncDocuments: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
}

const NotionSyncContext = createContext<NotionSyncContextType | undefined>(undefined);

interface NotionSyncProviderProps {
  children: ReactNode;
}

export const NotionSyncProvider: React.FC<NotionSyncProviderProps> = ({ children }) => {
  const [syncData, setSyncData] = useState<NotionSyncData>({
    isConnected: false,
    documentsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved sync state and auto-connect if configured
    loadSyncStateAndConnect();
  }, []);

  const loadSyncStateAndConnect = async () => {
    try {
      // Load saved state first
      const savedState = await AsyncStorage.getItem('notionSyncState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setSyncData({
          ...parsedState,
          lastSyncTime: parsedState.lastSyncTime ? new Date(parsedState.lastSyncTime) : undefined,
        });
      }

      // Auto-connect if API key is configured but not connected
      if (notionApiService.isConfigured()) {
        const isConnected = await testNotionConnection();
        if (isConnected) {
          console.log('✅ Auto-connecting to Notion API');
          const newSyncData: NotionSyncData = {
            isConnected: true,
            lastSyncTime: new Date(),
            documentsCount: 0,
          };
          
          setSyncData(newSyncData);
          await saveSyncState(newSyncData);
          
          // Auto-sync documents after connecting
          setTimeout(() => {
            syncDocuments().catch(console.error);
          }, 1000);
        } else {
          console.warn('❌ Notion API key configured but connection failed');
        }
      }
    } catch (error) {
      console.error('Error loading Notion sync state:', error);
    }
  };

  const loadSyncState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('notionSyncState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setSyncData({
          ...parsedState,
          lastSyncTime: parsedState.lastSyncTime ? new Date(parsedState.lastSyncTime) : undefined,
        });
      }
    } catch (error) {
      console.error('Error loading Notion sync state:', error);
    }
  };

  const saveSyncState = async (data: NotionSyncData) => {
    try {
      await AsyncStorage.setItem('notionSyncState', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving Notion sync state:', error);
    }
  };

  const connectToNotion = async () => {
    setIsLoading(true);
    try {
      // Test actual Notion API connection
      const isConnected = await testNotionConnection();
      
      if (isConnected) {
        const newSyncData: NotionSyncData = {
          isConnected: true,
          lastSyncTime: new Date(),
          documentsCount: 0,
        };
        
        setSyncData(newSyncData);
        await saveSyncState(newSyncData);
      } else {
        throw new Error('Notion API connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      const errorData: NotionSyncData = {
        ...syncData,
        error: error instanceof Error ? error.message : 'Failed to connect to Notion',
      };
      setSyncData(errorData);
      await saveSyncState(errorData);
    } finally {
      setIsLoading(false);
    }
  };

  const syncDocuments = async () => {
    if (!syncData.isConnected) {
      throw new Error('Not connected to Notion');
    }

    setIsLoading(true);
    try {
      // Clear existing cache and sync new documents
      await notionApiService.clearCache();
      
      // Count documents by trying to fetch each type/language combination
      const documentTypes = ['terms', 'privacy'];
      const languages = ['en', 'ja', 'zh', 'ko'];
      let documentsCount = 0;

      for (const type of documentTypes) {
        for (const language of languages) {
          const documentKey = `${type}-${language}`;
          try {
            const document = await notionApiService.getDocument(documentKey);
            if (document) {
              await notionApiService.setCachedDocument(documentKey, document);
              documentsCount++;
            }
          } catch (error) {
            console.warn(`Failed to sync ${documentKey}:`, error);
          }
        }
      }
      
      const newSyncData: NotionSyncData = {
        ...syncData,
        lastSyncTime: new Date(),
        documentsCount,
        error: undefined,
      };
      
      setSyncData(newSyncData);
      await saveSyncState(newSyncData);
    } catch (error) {
      console.error('Sync error:', error);
      const errorData: NotionSyncData = {
        ...syncData,
        error: error instanceof Error ? error.message : 'Failed to sync documents',
      };
      setSyncData(errorData);
      await saveSyncState(errorData);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      // Clear all cached documents
      await notionApiService.clearCache();
      
      const newSyncData: NotionSyncData = {
        isConnected: false,
        documentsCount: 0,
        error: undefined,
      };
      
      setSyncData(newSyncData);
      await saveSyncState(newSyncData);
      await AsyncStorage.removeItem('notionSyncState');
    } catch (error) {
      console.error('Error disconnecting from Notion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: NotionSyncContextType = {
    syncData,
    connectToNotion,
    syncDocuments,
    disconnect,
    isLoading,
  };

  return (
    <NotionSyncContext.Provider value={value}>
      {children}
    </NotionSyncContext.Provider>
  );
};

export const useNotionSync = (): NotionSyncContextType => {
  const context = useContext(NotionSyncContext);
  if (!context) {
    throw new Error('useNotionSync must be used within a NotionSyncProvider');
  }
  return context;
};

export default NotionSyncContext;
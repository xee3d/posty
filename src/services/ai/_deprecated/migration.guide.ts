// AI 서비스 마이그레이션 가이드
// 이 파일은 기존 import를 새로운 구조로 변경하는 방법을 안내합니다.

/* 
기존 import:
import aiService from '../services/aiService';
import openaiService from '../services/openaiService';
import enhancedOpenAIService from '../services/enhancedOpenAIService';

새로운 import:
import aiService from '../services/ai';

또는 특정 타입이 필요한 경우:
import aiService, { 
  GenerateContentParams, 
  GeneratedContent 
} from '../services/ai';
*/

// 마이그레이션이 필요한 파일 목록:
const filesToMigrate = [
  'src/screens/AIWriteScreen.tsx',
  'src/screens/HomeScreen.tsx',
  'src/screens/MyStyleScreen.tsx',
  'src/hooks/useAIService.ts',
  // 기타 AI 서비스를 사용하는 파일들
];

// 검색할 패턴:
const searchPatterns = [
  "from '../services/aiService'",
  "from '../../services/aiService'",
  "from '../services/openaiService'",
  "from '../services/enhancedOpenAIService'",
  "from '../services/improvedAIService'",
  "from '../services/simpleAIService'",
];

// 교체할 패턴:
const replaceWith = "from '../services/ai'";

export { filesToMigrate, searchPatterns, replaceWith };
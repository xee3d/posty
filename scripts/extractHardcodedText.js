// 하드코딩된 한국어 텍스트를 찾아서 추출하는 스크립트
// scripts/extractHardcodedText.js

const fs = require('fs');
const path = require('path');

// 한국어 텍스트 패턴
const koreanPattern = /['"`]([^'"`]*[가-힣]+[^'"`]*)['"`]/g;

// 제외할 파일/폴더
const excludePaths = [
  'node_modules',
  '.git',
  'android',
  'ios',
  '__tests__',
  'locales',
  'textConstants.ts'
];

// 추출된 텍스트 저장
const extractedTexts = new Map();

// 디렉토리 순회
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // 제외 경로 체크
    if (excludePaths.some(exclude => filePath.includes(exclude))) {
      return;
    }
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      extractFromFile(filePath);
    }
  });
}

// 파일에서 텍스트 추출
function extractFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(koreanPattern)];
  
  if (matches.length > 0) {
    const fileName = path.relative(process.cwd(), filePath);
    extractedTexts.set(fileName, []);
    
    matches.forEach(match => {
      const text = match[1];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      extractedTexts.get(fileName).push({
        text,
        line: lineNumber,
        context: getContext(content, match.index)
      });
    });
  }
}

// 텍스트 주변 컨텍스트 가져오기
function getContext(content, index) {
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + 100);
  return content.substring(start, end).replace(/\s+/g, ' ').trim();
}

// 결과를 JSON으로 저장
function saveResults() {
  const output = {
    totalFiles: extractedTexts.size,
    totalTexts: Array.from(extractedTexts.values()).reduce((sum, texts) => sum + texts.length, 0),
    files: Object.fromEntries(extractedTexts),
    summary: generateSummary()
  };
  
  fs.writeFileSync('hardcoded-texts.json', JSON.stringify(output, null, 2));
  console.log(`✅ 추출 완료: ${output.totalTexts}개의 텍스트를 ${output.totalFiles}개 파일에서 발견`);
}

// 요약 생성
function generateSummary() {
  const categories = {
    alerts: [],
    buttons: [],
    labels: [],
    messages: [],
    titles: []
  };
  
  extractedTexts.forEach((texts, file) => {
    texts.forEach(({ text, context }) => {
      if (context.includes('Alert.alert')) {
        categories.alerts.push(text);
      } else if (context.includes('Button') || context.includes('TouchableOpacity')) {
        categories.buttons.push(text);
      } else if (context.includes('label') || context.includes('Label')) {
        categories.labels.push(text);
      } else if (context.includes('message') || context.includes('Message')) {
        categories.messages.push(text);
      } else if (context.includes('title') || context.includes('Title')) {
        categories.titles.push(text);
      }
    });
  });
  
  return categories;
}

// 실행
console.log('🔍 하드코딩된 한국어 텍스트 검색 중...');
walkDir('./src');
saveResults();
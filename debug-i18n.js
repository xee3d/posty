#!/usr/bin/env node

// i18n 디버깅 스크립트
const path = require('path');
const fs = require('fs');

console.log('🔍 React Native i18n 디버깅 스크립트');
console.log('=====================================');

// 1. 번역 파일 존재 확인
const localesDir = path.join(__dirname, 'src', 'locales');
const koFile = path.join(localesDir, 'ko.ts');

console.log('\n📁 번역 파일 확인:');
console.log('ko.ts 존재:', fs.existsSync(koFile));

if (fs.existsSync(koFile)) {
  console.log('ko.ts 파일 크기:', fs.statSync(koFile).size, 'bytes');

  // 2. theme 섹션 확인
  const content = fs.readFileSync(koFile, 'utf8');
  const hasThemeSection = content.includes('theme: {');
  const hasThemeTitle = content.includes('title: "테마 설정"');

  console.log('theme 섹션 존재:', hasThemeSection);
  console.log('theme.title 존재:', hasThemeTitle);

  if (hasThemeSection) {
    // theme 섹션 추출
    const themeMatch = content.match(/theme: \{([^}]+)\}/s);
    if (themeMatch) {
      console.log('\n🎨 Theme 섹션 내용:');
      console.log(themeMatch[0]);
    }
  }
}

// 3. i18n 설정 파일 확인
const i18nFile = path.join(localesDir, 'i18n.ts');
console.log('\n⚙️ i18n 설정 파일:');
console.log('i18n.ts 존재:', fs.existsSync(i18nFile));

if (fs.existsSync(i18nFile)) {
  const i18nContent = fs.readFileSync(i18nFile, 'utf8');
  const activeLanguages = i18nContent.match(/ko: \{ translation: ko \}/g);
  const disabledLanguages = i18nContent.match(/\/\/ (en|ja|zh-CN): \{/g);

  console.log('활성화된 언어:', activeLanguages ? activeLanguages.length : 0);
  console.log('비활성화된 언어:', disabledLanguages ? disabledLanguages.length : 0);
}

// 4. 캐시 디렉토리 확인
console.log('\n🗂️ 캐시 상태:');
const possibleCacheDirs = [
  '/tmp/metro-cache',
  '/tmp/react-native',
  path.join(process.env.HOME, 'Library', 'Caches', 'Metro'),
  path.join(__dirname, 'node_modules', '.cache')
];

possibleCacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log('캐시 발견:', dir);
  }
});

console.log('\n✅ 디버깅 완료');
console.log('\n🔧 권장 해결 단계:');
console.log('1. ./clear-i18n-cache.sh 실행');
console.log('2. npm run start:clean 실행');
console.log('3. 앱 재시작 후 로그 확인');
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const localesDir = path.join(__dirname, '../src/locales');

console.log('👀 번역 파일 실시간 모니터링 시작...\n');

// 파일 변경 감지
const watcher = chokidar.watch(`${localesDir}/*.ts`, {
  ignored: /node_modules/,
  persistent: true
});

watcher
  .on('change', (filePath) => {
    const locale = path.basename(filePath, '.ts');
    console.log(`🔄 ${locale} 번역 파일이 업데이트되었습니다`);

    // 짧은 지연 후 재분석
    setTimeout(() => {
      console.log('📊 번역 상태 재분석 중...\n');
      require('child_process').exec('node scripts/check-translations.js', (error, stdout) => {
        if (error) {
          console.error('❌ 분석 오류:', error);
          return;
        }
        console.log(stdout);
        console.log('─'.repeat(50));
      });
    }, 1000);
  })
  .on('ready', () => {
    console.log('✅ 모니터링 준비 완료');
    console.log('📁 감시 중인 파일들:');
    console.log('   • en.ts, ko.ts, ja.ts, zh-CN.ts');
    console.log('   • Ctrl+C로 종료\n');
  });

process.on('SIGINT', () => {
  console.log('\n👋 번역 모니터링을 종료합니다.');
  watcher.close();
  process.exit(0);
});
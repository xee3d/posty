#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 번역 파일 경로
const localesDir = path.join(__dirname, '../src/locales');
const supportedLocales = ['en', 'ko', 'ja', 'zh-CN'];

// 객체를 플랫한 키-값 쌍으로 변환
function flattenObject(obj, prefix = '') {
  const flattened = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }

  return flattened;
}

// 번역 파일 로드 및 분석
function analyzeTranslations() {
  const translations = {};
  const results = {
    summary: {},
    missingKeys: {},
    extraKeys: {},
    emptyValues: {}
  };

  console.log('🌍 글로벌 번역 상태 체크\n');

  // 각 언어별 번역 파일 로드
  for (const locale of supportedLocales) {
    const filePath = path.join(localesDir, `${locale}.ts`);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${locale}.ts 파일을 찾을 수 없습니다.`);
      continue;
    }

    try {
      // TypeScript 파일을 동적으로 로드
      delete require.cache[require.resolve(filePath)];
      const content = require(filePath).default;
      translations[locale] = flattenObject(content);

      console.log(`✅ ${locale}: ${Object.keys(translations[locale]).length}개 키 로드됨`);
    } catch (error) {
      console.log(`❌ ${locale} 파일 로드 실패: ${error.message}`);
    }
  }

  // 기준 언어 설정 (한국어 - 원본 개발 언어)
  const baseLocale = 'ko';
  const baseKeys = new Set(Object.keys(translations[baseLocale] || {}));

  // 각 언어별 분석
  for (const locale of supportedLocales) {
    if (!translations[locale]) continue;

    const localeKeys = new Set(Object.keys(translations[locale]));
    const missing = [];
    const extra = [];
    const empty = [];

    // 누락된 키 찾기
    for (const key of baseKeys) {
      if (!localeKeys.has(key)) {
        missing.push(key);
      }
    }

    // 추가된 키 찾기
    for (const key of localeKeys) {
      if (!baseKeys.has(key)) {
        extra.push(key);
      }
    }

    // 빈 값 찾기
    for (const [key, value] of Object.entries(translations[locale])) {
      if (!value || value.toString().trim() === '') {
        empty.push(key);
      }
    }

    // 결과 저장
    results.summary[locale] = {
      total: localeKeys.size,
      missing: missing.length,
      extra: extra.length,
      empty: empty.length,
      coverage: Math.round(((baseKeys.size - missing.length) / baseKeys.size) * 100)
    };

    results.missingKeys[locale] = missing;
    results.extraKeys[locale] = extra;
    results.emptyValues[locale] = empty;
  }

  return results;
}

// 결과 출력
function printResults(results) {
  console.log('\n📊 번역 완성도 요약');
  console.log('─'.repeat(60));

  for (const [locale, summary] of Object.entries(results.summary)) {
    const { total, missing, extra, empty, coverage } = summary;
    const status = coverage >= 95 ? '🟢' : coverage >= 80 ? '🟡' : '🔴';

    console.log(`${status} ${locale.toUpperCase()}: ${coverage}% (${total}개)`);
    if (missing > 0) console.log(`   📝 누락: ${missing}개`);
    if (extra > 0) console.log(`   ➕ 추가: ${extra}개`);
    if (empty > 0) console.log(`   🫗 빈값: ${empty}개`);
  }

  // 상세 분석 출력
  console.log('\n🔍 상세 분석');
  console.log('─'.repeat(60));

  for (const [locale, missing] of Object.entries(results.missingKeys)) {
    if (missing.length > 0) {
      console.log(`\n❌ ${locale} - 누락된 키 (${missing.length}개):`);
      missing.slice(0, 10).forEach(key => console.log(`   • ${key}`));
      if (missing.length > 10) {
        console.log(`   ... 외 ${missing.length - 10}개`);
      }
    }
  }

  for (const [locale, empty] of Object.entries(results.emptyValues)) {
    if (empty.length > 0) {
      console.log(`\n🫗 ${locale} - 빈 값 (${empty.length}개):`);
      empty.slice(0, 5).forEach(key => console.log(`   • ${key}`));
      if (empty.length > 5) {
        console.log(`   ... 외 ${empty.length - 5}개`);
      }
    }
  }
}

// 추천 사항 출력
function printRecommendations(results) {
  console.log('\n💡 최적화 추천사항');
  console.log('─'.repeat(60));

  const priorities = [];

  for (const [locale, summary] of Object.entries(results.summary)) {
    if (summary.coverage < 95) {
      priorities.push({
        locale,
        priority: summary.coverage < 80 ? 'HIGH' : 'MEDIUM',
        issues: summary.missing + summary.empty
      });
    }
  }

  if (priorities.length === 0) {
    console.log('🎉 모든 번역이 최적화되어 있습니다!');
  } else {
    priorities.sort((a, b) => b.issues - a.issues);

    priorities.forEach(({ locale, priority, issues }) => {
      const icon = priority === 'HIGH' ? '🔴' : '🟡';
      console.log(`${icon} ${locale}: ${priority} 우선순위 (${issues}개 이슈)`);
    });
  }
}

// 실행
try {
  const results = analyzeTranslations();
  printResults(results);
  printRecommendations(results);

  // JSON 결과 저장
  fs.writeFileSync(
    path.join(__dirname, '../translation-analysis.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n📄 상세 결과가 translation-analysis.json에 저장되었습니다.');
} catch (error) {
  console.error('❌ 분석 중 오류 발생:', error.message);
  process.exit(1);
}
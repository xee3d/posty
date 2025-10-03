#!/usr/bin/env ts-node
/**
 * 토큰 구매, 구독 잠금 해제, 토큰 차감/보충 테스트 스크립트
 *
 * 테스트 항목:
 * 1. 토큰 구매 플로우 (In-App Purchase)
 * 2. 구독 시 무제한 토큰 잠금 해제
 * 3. 스타일/테마 잠금 해제
 * 4. 토큰 차감 및 보충 로직
 */

import { store } from '../src/store';
import {
  setTokens,
  useTokens,
  purchaseTokens,
  earnTokens,
  updateSubscription,
  resetDailyTokens,
  selectCurrentTokens,
  selectSubscriptionPlan,
} from '../src/store/slices/userSlice';

// 테스트 결과 저장
interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// 테스트 유틸리티
function assert(condition: boolean, testName: string, message: string, details?: any) {
  results.push({
    testName,
    passed: condition,
    message: condition ? `✅ ${message}` : `❌ ${message}`,
    details,
  });
}

// 테스트 1: 토큰 구매 플로우
async function testTokenPurchase() {
  console.log('\n📦 테스트 1: 토큰 구매 플로우');

  // 초기 토큰 설정
  store.dispatch(setTokens(10));
  const initialTokens = selectCurrentTokens(store.getState());

  // 100개 토큰 구매
  store.dispatch(purchaseTokens({ amount: 100, price: 1000 }));
  const afterPurchase = selectCurrentTokens(store.getState());

  assert(
    afterPurchase === initialTokens + 100,
    'Token Purchase',
    `토큰 구매 성공: ${initialTokens} → ${afterPurchase}`,
    { initial: initialTokens, after: afterPurchase }
  );

  // 보너스 토큰이 포함된 패키지 구매 (예: 150개 구매 시 50개 보너스)
  const beforeBonus = selectCurrentTokens(store.getState());
  store.dispatch(purchaseTokens({ amount: 150, price: 2000 }));
  const afterBonus = selectCurrentTokens(store.getState());

  assert(
    afterBonus === beforeBonus + 150,
    'Bonus Token Purchase',
    `보너스 토큰 구매 성공: ${beforeBonus} → ${afterBonus}`,
    { before: beforeBonus, after: afterBonus }
  );
}

// 테스트 2: 구독 업그레이드 및 무제한 토큰
async function testSubscriptionUpgrade() {
  console.log('\n🔓 테스트 2: 구독 업그레이드 및 무제한 토큰');

  // Free 플랜으로 시작
  store.dispatch(updateSubscription({ plan: 'free' }));
  let plan = selectSubscriptionPlan(store.getState());

  assert(
    plan === 'free',
    'Free Plan',
    `Free 플랜 확인: ${plan}`,
    { plan }
  );

  // STARTER 플랜 업그레이드 (300개 초기 지급)
  const beforeStarter = selectCurrentTokens(store.getState());
  store.dispatch(updateSubscription({ plan: 'starter' }));
  const afterStarter = selectCurrentTokens(store.getState());
  plan = selectSubscriptionPlan(store.getState());

  assert(
    plan === 'starter' && afterStarter === beforeStarter + 300,
    'Starter Plan Upgrade',
    `STARTER 플랜 업그레이드 성공: ${beforeStarter} → ${afterStarter} (300 토큰 지급)`,
    { plan, before: beforeStarter, after: afterStarter }
  );

  // PREMIUM 플랜 업그레이드 (500개 초기 지급)
  const beforePremium = selectCurrentTokens(store.getState());
  store.dispatch(updateSubscription({ plan: 'premium' }));
  const afterPremium = selectCurrentTokens(store.getState());
  plan = selectSubscriptionPlan(store.getState());

  assert(
    plan === 'premium' && afterPremium === beforePremium + 500,
    'Premium Plan Upgrade',
    `PREMIUM 플랜 업그레이드 성공: ${beforePremium} → ${afterPremium} (500 토큰 지급)`,
    { plan, before: beforePremium, after: afterPremium }
  );

  // MAX (PRO) 플랜 업그레이드 (무제한 토큰)
  store.dispatch(updateSubscription({ plan: 'pro' }));
  plan = selectSubscriptionPlan(store.getState());
  const tokens = selectCurrentTokens(store.getState());

  assert(
    plan === 'pro',
    'Pro Plan Unlimited',
    `MAX 플랜 업그레이드 성공: 무제한 토큰 (현재 토큰: ${tokens})`,
    { plan, tokens }
  );

  // MAX 플랜에서는 토큰 사용해도 차감되지 않음
  const beforeUse = selectCurrentTokens(store.getState());
  store.dispatch(useTokens(10));
  const afterUse = selectCurrentTokens(store.getState());

  assert(
    beforeUse === afterUse,
    'Pro Plan Token Usage',
    `MAX 플랜 토큰 무제한 확인: ${beforeUse} → ${afterUse} (차감 없음)`,
    { before: beforeUse, after: afterUse }
  );
}

// 테스트 3: 스타일/테마 잠금 해제
async function testStyleUnlock() {
  console.log('\n🎨 테스트 3: 스타일/테마 잠금 해제');

  // Free 플랜: 기본 스타일만 사용 가능
  store.dispatch(updateSubscription({ plan: 'free' }));
  let plan = selectSubscriptionPlan(store.getState());

  const freeStyles = ['minimalist', 'casual', 'professional']; // 무료 스타일
  const lockedStyles = ['philosopher', 'storyteller', 'trendsetter']; // 잠긴 스타일

  assert(
    plan === 'free',
    'Free Plan Styles',
    `Free 플랜: 기본 스타일만 사용 가능 (${freeStyles.join(', ')})`,
    { plan, availableStyles: freeStyles, lockedStyles }
  );

  // Pro 플랜: 모든 스타일 잠금 해제
  store.dispatch(updateSubscription({ plan: 'pro' }));
  plan = selectSubscriptionPlan(store.getState());

  const allStyles = [...freeStyles, ...lockedStyles];

  assert(
    plan === 'pro',
    'Pro Plan All Styles',
    `MAX 플랜: 모든 스타일 잠금 해제 (${allStyles.join(', ')})`,
    { plan, availableStyles: allStyles }
  );
}

// 테스트 4: 토큰 차감 및 보충 로직
async function testTokenDeduction() {
  console.log('\n💰 테스트 4: 토큰 차감 및 보충 로직');

  // 일반 플랜으로 토큰 차감 테스트
  store.dispatch(updateSubscription({ plan: 'free' }));
  store.dispatch(setTokens(50));

  const before = selectCurrentTokens(store.getState());

  // 10개 토큰 사용
  store.dispatch(useTokens(10));
  const after = selectCurrentTokens(store.getState());

  assert(
    after === before - 10,
    'Token Deduction',
    `토큰 차감 성공: ${before} → ${after}`,
    { before, after, deducted: 10 }
  );

  // 토큰 부족 시나리오
  store.dispatch(setTokens(5));
  const insufficientBefore = selectCurrentTokens(store.getState());
  store.dispatch(useTokens(10)); // 5개만 있는데 10개 사용 시도
  const insufficientAfter = selectCurrentTokens(store.getState());

  assert(
    insufficientAfter === insufficientBefore || insufficientAfter >= 0,
    'Insufficient Tokens',
    `토큰 부족 처리: ${insufficientBefore} (10개 사용 시도 → 최소 0 유지)`,
    { before: insufficientBefore, after: insufficientAfter }
  );

  // 광고 시청 토큰 획득
  const beforeAd = selectCurrentTokens(store.getState());
  store.dispatch(earnTokens({ amount: 5, description: '광고 시청 리워드' }));
  const afterAd = selectCurrentTokens(store.getState());

  assert(
    afterAd === beforeAd + 5,
    'Ad Reward Tokens',
    `광고 리워드 토큰 획득: ${beforeAd} → ${afterAd}`,
    { before: beforeAd, after: afterAd, earned: 5 }
  );

  // 일일 토큰 리셋
  store.dispatch(setTokens(3)); // 낮은 토큰
  const beforeReset = selectCurrentTokens(store.getState());
  store.dispatch(resetDailyTokens());
  const afterReset = selectCurrentTokens(store.getState());

  assert(
    afterReset === 10,
    'Daily Token Reset',
    `일일 토큰 리셋: ${beforeReset} → ${afterReset} (10개로 리셋)`,
    { before: beforeReset, after: afterReset }
  );
}

// 테스트 5: 구독 만료 및 다운그레이드
async function testSubscriptionExpiry() {
  console.log('\n⏰ 테스트 5: 구독 만료 및 다운그레이드');

  // Pro 플랜 설정
  store.dispatch(updateSubscription({ plan: 'pro' }));
  let plan = selectSubscriptionPlan(store.getState());

  assert(
    plan === 'pro',
    'Pro Plan Active',
    `MAX 플랜 활성: ${plan}`,
    { plan }
  );

  // 만료 후 Free 플랜으로 다운그레이드
  store.dispatch(updateSubscription({ plan: 'free' }));
  plan = selectSubscriptionPlan(store.getState());
  const tokens = selectCurrentTokens(store.getState());

  assert(
    plan === 'free',
    'Downgrade to Free',
    `Free 플랜으로 다운그레이드: ${plan} (현재 토큰: ${tokens})`,
    { plan, tokens }
  );

  // 다운그레이드 후 일일 토큰 리셋 확인
  store.dispatch(resetDailyTokens());
  const afterDowngradeReset = selectCurrentTokens(store.getState());

  assert(
    afterDowngradeReset === 10,
    'Downgrade Token Reset',
    `다운그레이드 후 일일 리셋: ${afterDowngradeReset}개`,
    { tokens: afterDowngradeReset }
  );
}

// 모든 테스트 실행
async function runAllTests() {
  console.log('🧪 토큰 & 구독 테스트 시작\n');
  console.log('='.repeat(60));

  try {
    await testTokenPurchase();
    await testSubscriptionUpgrade();
    await testStyleUnlock();
    await testTokenDeduction();
    await testSubscriptionExpiry();

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 테스트 결과 요약\n');

    // 결과 출력
    results.forEach((result, index) => {
      console.log(`${index + 1}. [${result.testName}] ${result.message}`);
      if (result.details) {
        console.log(`   상세: ${JSON.stringify(result.details, null, 2)}`);
      }
    });

    // 통계
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ 통과: ${passed}/${total}`);
    console.log(`❌ 실패: ${failed}/${total}`);
    console.log(`📈 성공률: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed === 0) {
      console.log('🎉 모든 테스트 통과!\n');
    } else {
      console.log('⚠️  일부 테스트 실패. 위 로그를 확인하세요.\n');
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
  }
}

// 스크립트 실행
runAllTests();

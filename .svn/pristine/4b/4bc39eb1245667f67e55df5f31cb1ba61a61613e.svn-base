// 1단계 구현을 위한 패키지 설치 스크립트

const { execSync } = require('child_process');

console.log('🚀 Molly 앱 1단계 구현 패키지 설치 시작...\n');

const packages = [
  {
    name: '@react-native-async-storage/async-storage',
    description: '로컬 데이터 저장',
  },
  {
    name: 'react-native-image-picker',
    description: '이미지 선택 및 카메라',
  },
  {
    name: '@react-native-clipboard/clipboard',
    description: '클립보드 복사 기능',
  },
  {
    name: 'react-native-dotenv',
    description: '환경 변수 관리',
  },
];

packages.forEach((pkg) => {
  console.log(`📦 ${pkg.description} - ${pkg.name} 설치 중...`);
  try {
    execSync(`npm install ${pkg.name}`, { stdio: 'inherit' });
    console.log(`✅ ${pkg.name} 설치 완료!\n`);
  } catch (error) {
    console.error(`❌ ${pkg.name} 설치 실패:`, error.message);
  }
});

console.log('\n📱 Android 설정 안내:');
console.log('1. android/app/src/main/AndroidManifest.xml에 권한 추가:');
console.log('   <uses-permission android:name="android.permission.CAMERA" />');
console.log('   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />');
console.log('   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />');

console.log('\n🍎 iOS 설정 안내 (Mac에서만):');
console.log('1. ios/Molly/Info.plist에 권한 설명 추가');
console.log('2. cd ios && pod install 실행');

console.log('\n✨ 설치 완료! 다음 단계:');
console.log('1. .env.example을 .env로 복사하고 API 키 입력');
console.log('2. 앱 재시작: npm run android');
console.log('\n행운을 빕니다! 🚀');
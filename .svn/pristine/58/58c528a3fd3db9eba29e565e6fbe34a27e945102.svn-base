#!/bin/bash
# 소셜 로그인 패키지 설치 스크립트

echo "🔧 소셜 로그인 패키지 설치 시작..."

# Google Sign-In
echo "📦 Google Sign-In 설치 중..."
npm install @react-native-google-signin/google-signin@latest

# Naver Login
echo "📦 Naver Login 설치 중..."
npm install @react-native-seoul/naver-login@latest

# Kakao Login
echo "📦 Kakao Login 설치 중..."
npm install @react-native-seoul/kakao-login@latest

# iOS 설정
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "🍎 iOS 설정 중..."
  cd ios && pod install && cd ..
fi

echo "✅ 소셜 로그인 패키지 설치 완료!"
echo ""
echo "⚠️  추가 설정이 필요합니다:"
echo "1. Firebase Console에서 각 소셜 로그인 활성화"
echo "2. 각 플랫폼별 API 키 설정 (.env 파일)"
echo "3. Android/iOS 네이티브 설정"
echo ""
echo "자세한 내용은 SOCIAL_LOGIN_SETUP.md 참고"

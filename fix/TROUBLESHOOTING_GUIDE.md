# Posty 앱 문제 해결 가이드

## 🚨 현재 확인된 문제
1. **카카오 로그인 불가**
2. **네이버 로그인 불가**
3. **트렌드 서버 연결 오류**
4. **AI 서버 응답 없음**

## 🔧 빠른 해결 방법

### 1. 통합 문제 해결 (권장)
```bash
cd C:\Users\xee3d\Documents\Posty\fix
fix-all-issues.bat
```

### 2. 개별 문제 해결

#### 소셜 로그인 문제
```bash
cd C:\Users\xee3d\Documents\Posty\fix
fix-social-login.bat
```

#### 서버 문제
```bash
cd C:\Users\xee3d\Documents\Posty\fix
fix-servers.bat
```

## 📋 수동 해결 가이드

### 1. 소셜 로그인 설정

#### 환경 변수 확인 (.env 파일)
```env
# 네이버 로그인
NAVER_CONSUMER_KEY=jXC0jUWPhSCotIWBrKrB
NAVER_CONSUMER_SECRET=RND5w7pcJt

# 카카오 로그인
KAKAO_APP_KEY=566cba5c08009852b6b5f1a31c3b28d8

# 구글 로그인
GOOGLE_WEB_CLIENT_ID=457030848293-ln3opq1i78fqglmq1tt8h0ajt4oo2n83.apps.googleusercontent.com
```

#### 키 해시 생성 및 등록

1. **SHA1 지문 획득**
```bash
cd android
gradlew signingReport
```

2. **카카오 키 해시 생성**
```bash
keytool -exportcert -alias androiddebugkey -keystore android\app\debug.keystore -storepass android | openssl sha1 -binary | openssl base64
```

#### 플랫폼별 설정

**카카오 개발자 센터**
- URL: https://developers.kakao.com
- 내 애플리케이션 → Posty
- 플랫폼 → Android 플랫폼 등록
- 패키지명: `com.posty`
- 키 해시: 위에서 생성한 값
- 카카오 로그인 활성화

**네이버 개발자 센터**
- URL: https://developers.naver.com
- 내 애플리케이션 → Posty
- API 설정 → Android 설정
- 패키지명: `com.posty`
- SHA1 지문: gradlew signingReport 결과값
- 네이버 아이디로 로그인 사용 설정

**Firebase Console**
- URL: https://console.firebase.google.com
- Posty 프로젝트 → Authentication
- Sign-in method → Google 활성화
- 프로젝트 설정 → Android 앱
- SHA1 지문 추가

### 2. 서버 문제 해결

#### 서버 상태 확인
```bash
# AI 서버
curl https://posty-server-new.vercel.app/api/health

# 트렌드 서버
curl https://posty-api.vercel.app/api/trends
```

#### Vercel 재배포
```bash
# AI 서버
cd posty-ai-server
vercel --prod

# API 서버
cd posty-api-server
vercel --prod
```

#### 서버 URL 업데이트
`src/config/serverConfig.js` 파일에서 서버 URL 확인 및 수정:
```javascript
SERVERS: [
  'https://posty-server-new.vercel.app',
  'https://posty-server.vercel.app',
  // 새 서버 URL 추가
]
```

## 🔍 디버깅 팁

### 로그 확인
```bash
# Metro 번들러 로그
npx react-native start

# Android 로그
adb logcat | findstr "posty"
```

### 캐시 클리어
```bash
# Metro 캐시
npx react-native start --reset-cache

# Android 빌드 캐시
cd android && gradlew clean
```

### 종속성 재설치
```bash
rm -rf node_modules
npm install
cd android && gradlew clean
```

## ⚠️ 주의사항

1. **API 키 보안**
   - `.env` 파일은 절대 Git에 커밋하지 마세요
   - 프로덕션 키는 별도 관리

2. **서버 배포**
   - Vercel CLI 로그인 필요
   - Firebase 서비스 계정 설정 확인

3. **플랫폼 설정**
   - 개발/프로덕션 키 해시 구분
   - 패키지명 일치 확인

## 📞 추가 지원

문제가 지속되면:
1. 에러 로그 수집
2. 환경 설정 파일 검토
3. 네이티브 설정 파일 확인 (AndroidManifest.xml)

## 체크리스트

- [ ] .env 파일에 모든 API 키 설정
- [ ] 카카오 개발자 센터에 키 해시 등록
- [ ] 네이버 개발자 센터에 SHA1 등록
- [ ] Firebase Console에 SHA1 등록
- [ ] 서버 Health Check 통과
- [ ] 앱에서 로그인 테스트 완료
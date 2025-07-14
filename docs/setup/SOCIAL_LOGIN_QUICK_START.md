# 🚀 소셜 로그인 빠른 시작 가이드

## 📱 현재 상태
- ✅ 소셜 로그인 패키지 설치 완료
- ✅ 로그인 화면 구현 완료
- ✅ 개발 모드 테스트 지원

## 🧪 개발 모드로 테스트하기

API 키 설정 없이도 개발 모드에서 테스트 가능합니다:

```bash
cd C:\Users\xee3d\Documents\Posty_V74
npx react-native run-android
```

개발 모드에서는:
- 실제 소셜 로그인 대신 모의 로그인 실행
- 테스트 사용자 정보로 로그인 시뮬레이션
- API 키 설정 불필요

## 🔧 실제 소셜 로그인 설정

### 1. Google 로그인 설정

1. [Firebase Console](https://console.firebase.google.com) 접속
2. Authentication > Sign-in method > Google 활성화
3. 웹 클라이언트 ID 복사
4. `.env` 파일에 추가:
   ```
   GOOGLE_WEB_CLIENT_ID=your-web-client-id-here
   ```

### 2. Naver 로그인 설정

1. [Naver Developers](https://developers.naver.com) 접속
2. 애플리케이션 등록
3. Client ID, Client Secret 복사
4. `.env` 파일에 추가:
   ```
   NAVER_CONSUMER_KEY=your-client-id
   NAVER_CONSUMER_SECRET=your-client-secret
   ```

### 3. Kakao 로그인 설정

1. [Kakao Developers](https://developers.kakao.com) 접속
2. 애플리케이션 추가
3. 앱 키 복사
4. `.env` 파일에 추가:
   ```
   KAKAO_APP_KEY=your-app-key
   ```

### 4. Android 네이티브 설정

상세 설정은 `ANDROID_SOCIAL_LOGIN_SETUP.md` 참조

### 5. 앱 재빌드

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## ❓ 문제 해결

### "Unable to resolve module" 에러
```bash
npm install
cd android && ./gradlew clean && cd ..
npx react-native start --reset-cache
```

### 로그인 실패
- API 키가 올바른지 확인
- 패키지명이 각 플랫폼에 등록된 것과 일치하는지 확인
- SHA-1 지문이 등록되었는지 확인 (Google, Kakao)

## 📝 체크리스트

- [ ] 소셜 로그인 패키지 설치
- [ ] `.env` 파일에 API 키 설정
- [ ] Android 네이티브 설정 완료
- [ ] Firebase에 Google Provider 활성화
- [ ] 각 플랫폼에 앱 등록 및 설정
- [ ] 개발 모드 테스트 성공
- [ ] 실제 로그인 테스트 성공

## 🎉 완료!

모든 설정이 완료되면 사용자는 Google, Naver, Kakao로 로그인할 수 있습니다!

# 소셜 로그인 설정 가이드

## 📋 필요한 패키지

```bash
npm install @react-native-google-signin/google-signin
npm install @react-native-seoul/naver-login
npm install @react-native-seoul/kakao-login
```

## 🔧 환경 변수 설정 (.env)

```env
# Google
GOOGLE_WEB_CLIENT_ID=your-google-web-client-id

# Naver
NAVER_CONSUMER_KEY=your-naver-consumer-key
NAVER_CONSUMER_SECRET=your-naver-consumer-secret
NAVER_APP_NAME=Posty
NAVER_SERVICE_URL_SCHEME=postynaverlogin

# Kakao
KAKAO_APP_KEY=your-kakao-app-key
KAKAO_APP_SCHEME=kakao{your-kakao-app-key}

# Firebase Custom Token Server
API_URL=https://your-server-url.com
```

## 📱 Android 설정

### 1. Google Sign-In

**android/app/build.gradle:**

```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

### 2. Naver Login

**android/app/src/main/AndroidManifest.xml:**

```xml
<uses-permission android:name="android.permission.INTERNET" />

<application>
    <!-- Naver Login -->
    <activity
        android:name="com.naver.nid.oauth.NLoginAuthActivity"
        android:configChanges="keyboard|keyboardHidden|screenLayout|screenSize|orientation"
        android:theme="@android:style/Theme.Translucent.NoTitleBar" />
</application>
```

### 3. Kakao Login

**android/app/src/main/AndroidManifest.xml:**

```xml
<application>
    <!-- Kakao Login -->
    <activity
        android:name="com.kakao.sdk.auth.AuthCodeHandlerActivity"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="kakao{your-kakao-app-key}" android:host="oauth" />
        </intent-filter>
    </activity>
</application>
```

**android/app/build.gradle:**

```gradle
android {
    defaultConfig {
        manifestPlaceholders = [
            kakaoAppKey: "{your-kakao-app-key}"
        ]
    }
}
```

## 🍎 iOS 설정

### 1. Google Sign-In

**ios/Posty/Info.plist:**

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.{your-google-ios-client-id}</string>
        </array>
    </dict>
</array>
```

### 2. Naver Login

**ios/Posty/Info.plist:**

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>postynaverlogin</string>
        </array>
    </dict>
</array>

<key>LSApplicationQueriesSchemes</key>
<array>
    <string>naversearchapp</string>
    <string>naversearchthirdlogin</string>
</array>
```

### 3. Kakao Login

**ios/Posty/Info.plist:**

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>kakao{your-kakao-app-key}</string>
        </array>
    </dict>
</array>

<key>LSApplicationQueriesSchemes</key>
<array>
    <string>kakaokompassauth</string>
    <string>kakaolink</string>
</array>

<key>KAKAO_APP_KEY</key>
<string>{your-kakao-app-key}</string>
```

## 🔥 Firebase 설정

### 1. Firebase Console 설정

1. Firebase Console > Authentication > Sign-in method
2. 다음 Provider 활성화:
   - Google
   - 이메일/비밀번호 (Custom Token용)

### 2. Custom Token 서버 구현

네이버와 카카오 로그인을 위해서는 서버에서 Firebase Custom Token을 생성해야 합니다.

**서버 예제 (Node.js):**

```javascript
const admin = require("firebase-admin");

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post("/auth/custom-token", async (req, res) => {
  const { provider, profile } = req.body;

  try {
    let uid, email, displayName, photoURL;

    if (provider === "naver") {
      uid = `naver:${profile.id}`;
      email = profile.email;
      displayName = profile.name;
      photoURL = profile.profile_image;
    } else if (provider === "kakao") {
      uid = `kakao:${profile.id}`;
      email = profile.kakao_account?.email;
      displayName = profile.properties?.nickname;
      photoURL = profile.properties?.profile_image;
    }

    // Firebase Custom Token 생성
    const customToken = await admin.auth().createCustomToken(uid);

    // 사용자 정보 업데이트
    await admin
      .auth()
      .updateUser(uid, {
        email,
        displayName,
        photoURL,
      })
      .catch(() => {
        // 사용자가 없으면 생성
        return admin.auth().createUser({
          uid,
          email,
          displayName,
          photoURL,
        });
      });

    res.json({ customToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🚀 실행

1. 패키지 설치:

```bash
cd C:\Users\xee3d\Documents\Posty_V74
npm install @react-native-google-signin/google-signin @react-native-seoul/naver-login @react-native-seoul/kakao-login
```

2. iOS 설정 (Mac에서만):

```bash
cd ios && pod install && cd ..
```

3. 앱 실행:

```bash
npx react-native run-android
# 또는
npx react-native run-ios
```

## ⚠️ 주의사항

1. **API 키 보안**: 모든 API 키는 .env 파일에 저장하고, .gitignore에 추가
2. **Bundle ID/Package Name**: 각 플랫폼 콘솔에서 정확히 일치해야 함
3. **리다이렉트 URL**: 각 플랫폼별로 정확한 URL 스킴 설정 필요
4. **테스트**: 실제 기기에서 테스트 권장 (시뮬레이터 제한 있음)

## 📚 참고 문서

- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [React Native Seoul - Naver Login](https://github.com/react-native-seoul/react-native-naver-login)
- [React Native Seoul - Kakao Login](https://github.com/react-native-seoul/react-native-kakao-login)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

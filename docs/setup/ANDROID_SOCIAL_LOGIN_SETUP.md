# Android 소셜 로그인 설정 가이드

## 1. Google Sign-In 설정

### android/app/build.gradle 수정:

```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
    // 기존 의존성들...
}
```

## 2. Naver Login 설정

### android/app/src/main/AndroidManifest.xml 수정:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme">

        <!-- 기존 Activity들 -->

        <!-- Naver Login Activity 추가 -->
        <activity
            android:name="com.naver.nid.oauth.NLoginAuthActivity"
            android:configChanges="keyboard|keyboardHidden|screenLayout|screenSize|orientation"
            android:theme="@android:style/Theme.Translucent.NoTitleBar" />

    </application>
</manifest>
```

## 3. Kakao Login 설정

### android/app/src/main/AndroidManifest.xml에 추가:

```xml
<application>
    <!-- 기존 내용들... -->

    <!-- Kakao Login Activity -->
    <activity
        android:name="com.kakao.sdk.auth.AuthCodeHandlerActivity"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />

            <!-- "kakao{YOUR_KAKAO_APP_KEY}" 형태로 수정 필요 -->
            <data android:scheme="kakao1234567890abcdef" android:host="oauth" />
        </intent-filter>
    </activity>
</application>
```

### android/app/build.gradle에 추가:

```gradle
android {
    defaultConfig {
        // 기존 설정들...

        // Kakao App Key 추가 (실제 키로 교체)
        manifestPlaceholders = [
            kakaoAppKey: "1234567890abcdef"
        ]
    }
}
```

### android/settings.gradle에 추가:

```gradle
include ':@react-native-seoul_kakao-login'
project(':@react-native-seoul_kakao-login').projectDir = new File(rootProject.projectDir, '../node_modules/@react-native-seoul/kakao-login/android')
```

## 4. MainApplication.java 수정

경로: `android/app/src/main/java/com/posty/MainApplication.java`

```java
import com.kakao.sdk.common.KakaoSdk;

@Override
public void onCreate() {
    super.onCreate();

    // Kakao SDK 초기화 (YOUR_KAKAO_APP_KEY를 실제 키로 교체)
    KakaoSdk.init(this, "YOUR_KAKAO_APP_KEY");

    // 기존 코드...
}
```

## 5. 빌드 및 실행

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## ⚠️ 중요 사항

1. **API 키 설정**: 각 플랫폼의 실제 API 키로 교체 필요
2. **Firebase 설정**: Firebase Console에서 Google Provider 활성화
3. **패키지명 확인**: 각 플랫폼 콘솔의 패키지명과 일치해야 함
4. **SHA-1 지문**: Google과 Kakao는 SHA-1 인증서 지문 등록 필요

### SHA-1 지문 확인 방법:

```bash
cd android
./gradlew signingReport
```

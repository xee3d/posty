# 🎨 Posty 앱 아이콘 생성 가이드

## 📱 필요한 아이콘 크기

### Android (mipmap 폴더)
- `mipmap-mdpi`: 48x48 px
- `mipmap-hdpi`: 72x72 px
- `mipmap-xhdpi`: 96x96 px
- `mipmap-xxhdpi`: 144x144 px
- `mipmap-xxxhdpi`: 192x192 px

### iOS (Xcode Assets)
- 20pt: 20x20, 40x40, 60x60
- 29pt: 29x29, 58x58, 87x87
- 40pt: 40x40, 80x80, 120x120
- 60pt: 120x120, 180x180
- 1024pt: 1024x1024 (App Store)

## 🛠️ 아이콘 생성 방법

### 방법 1: 온라인 도구 사용 (추천)

#### 1. App Icon Generator
- URL: https://www.appicon.co/
- SVG 또는 고해상도 PNG 업로드
- Android + iOS 아이콘 한번에 생성

#### 2. Icon Kitchen (Android 전용)
- URL: https://icon.kitchen/
- Material Design 스타일 아이콘 생성
- Adaptive Icon 지원

#### 3. Makeappicon
- URL: https://makeappicon.com/
- 1024x1024 이미지 업로드
- 모든 크기 자동 생성

### 방법 2: 디자인 도구 사용

#### Figma (무료)
1. 512x512 캔버스 생성
2. 아이콘 디자인
3. 각 크기별로 Export

#### Canva (무료)
1. "앱 아이콘" 템플릿 선택
2. 디자인 커스터마이징
3. PNG로 다운로드

## 🎨 Posty 아이콘 디자인 컨셉

### 메인 요소
- **색상**: #FF4757 (Posty 레드)
- **모양**: 둥근 사각형 (반경 25%)
- **심볼**: 'P' + 메시지 버블
- **스타일**: 모던, 미니멀, 친근함

### 디자인 옵션

#### 옵션 1: 메시지 버블 + P
```
┌─────────────────┐
│    ╭─────╮      │
│    │  P  │ •••  │
│    ╰──▽──╯      │
└─────────────────┘
```

#### 옵션 2: AI 스파크 + P
```
┌─────────────────┐
│      ✨         │
│    【 P 】      │
│      ⚡         │
└─────────────────┘
```

#### 옵션 3: 그라데이션 P
```
┌─────────────────┐
│                 │
│       P         │
│     ═══         │
└─────────────────┘
```

## 📁 아이콘 적용 방법

### Android

1. 생성된 아이콘을 각 mipmap 폴더에 복사:
```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
├── mipmap-hdpi/
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
├── mipmap-xhdpi/
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
├── mipmap-xxhdpi/
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
└── mipmap-xxxhdpi/
    ├── ic_launcher.png
    └── ic_launcher_round.png
```

2. 앱 재빌드:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS

1. Xcode에서 프로젝트 열기
2. `Images.xcassets` > `AppIcon` 선택
3. 각 크기별로 아이콘 드래그 앤 드롭
4. 빌드 및 실행

## 🎯 빠른 시작

### 1단계: 기본 아이콘 다운로드
위의 SVG를 사용하거나 직접 디자인

### 2단계: 크기 변환
https://www.appicon.co/ 에서 변환

### 3단계: 파일 복사
생성된 파일을 각 폴더에 복사

### 4단계: 테스트
앱 설치 후 홈 화면에서 확인

## 🔧 Adaptive Icon (Android 8+)

### ic_launcher_foreground.xml
```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
  <!-- 아이콘 전경 -->
</vector>
```

### ic_launcher_background.xml
```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
  <path
      android:fillColor="#FF4757"
      android:pathData="M0,0h108v108h-108z" />
</vector>
```

## 💡 디자인 팁

1. **단순함 유지**: 작은 크기에서도 식별 가능
2. **대비 강조**: 배경과 전경의 명확한 구분
3. **브랜드 일관성**: Posty의 색상과 스타일 유지
4. **테스트**: 다양한 배경에서 확인

## 🎨 색상 팔레트

- Primary: #FF4757
- Secondary: #FF6B6B
- Accent: #FFD93D
- Background: #FFFFFF
- Text: #2C3E50

## 📱 미리보기 테스트

아이콘 적용 전 미리보기:
1. 홈 화면 스크린샷 촬영
2. 포토샵/GIMP에서 아이콘 합성
3. 다양한 배경에서 확인

---

**준비된 SVG 아이콘은 artifacts에서 확인하세요!**

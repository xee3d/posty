# Posty 앱 아이콘 변경 가이드

## 🎨 아이콘 파일 위치
- 원본 아이콘: `images/posty_icon.png`

## 📱 Android 아이콘 변경

### 방법 1: 온라인 도구 사용 (권장)

1. **Android Asset Studio** 방문
   - https://icon.kitchen/i/H4sIAAAAAAAAA6tWKkvMKU0tVrKqVkpJLUvNS0mtVrICAIgJbvYYAAAA
   - 또는 https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

2. **아이콘 업로드**
   - "Source Image" → "Browse" 클릭
   - `images/posty_icon.png` 파일 선택

3. **설정**
   - Name: `ic_launcher`
   - Shape: Circle (원형) 또는 Square (정사각형) 선택
   - Background Color: #6B46C1 (Posty 보라색)

4. **다운로드 및 배치**
   - "Download ZIP" 클릭
   - ZIP 파일 압축 해제
   - 생성된 파일들을 다음 위치에 복사:
     ```
     android/app/src/main/res/
     ├── mipmap-hdpi/
     │   ├── ic_launcher.png
     │   └── ic_launcher_round.png
     ├── mipmap-mdpi/
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

### 방법 2: 수동 리사이즈

각 해상도별 크기:
- mipmap-mdpi: 48x48
- mipmap-hdpi: 72x72
- mipmap-xhdpi: 96x96
- mipmap-xxhdpi: 144x144
- mipmap-xxxhdpi: 192x192

## 🍎 iOS 아이콘 변경

### 방법 1: 온라인 도구 사용 (권장)

1. **App Icon Generator** 방문
   - https://www.appicon.co/

2. **아이콘 업로드**
   - `images/posty_icon.png` 파일을 드래그 앤 드롭

3. **플랫폼 선택**
   - iOS 체크

4. **다운로드 및 Xcode에서 설정**
   - 생성된 아이콘 세트 다운로드
   - Xcode에서 프로젝트 열기
   - Assets.xcassets → AppIcon 선택
   - 각 크기별로 아이콘 드래그 앤 드롭

### 방법 2: Xcode에서 직접 설정

1. **Xcode 열기**
   ```bash
   cd ios
   open Posty.xcworkspace
   ```

2. **Assets.xcassets 열기**
   - 왼쪽 네비게이터에서 `Posty/Images.xcassets` 선택
   - `AppIcon` 선택

3. **아이콘 드래그 앤 드롭**
   - 각 크기별 슬롯에 `posty_icon.png` 드래그
   - Xcode가 자동으로 리사이즈

## 🚀 빌드 및 확인

### Android
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### iOS
```bash
cd ios
pod install
# Xcode에서 빌드
```

## ⚠️ 주의사항

1. **아이콘 요구사항**
   - PNG 형식
   - 투명 배경 지원
   - 최소 1024x1024 권장
   - 정사각형 비율

2. **Android Adaptive Icon**
   - Android 8.0 이상에서는 adaptive icon 지원
   - foreground와 background 레이어 분리 가능

3. **iOS 아이콘**
   - 투명도 사용 불가
   - 모서리 둥글기는 시스템이 자동 적용

## 🎯 빠른 설정 (Windows PowerShell)

```powershell
# Android 아이콘 백업
$androidResPath = "android\app\src\main\res"
$backupPath = "android\app\src\main\res_backup"

# 백업 생성
Copy-Item -Path $androidResPath -Destination $backupPath -Recurse

# 아이콘 교체 후 확인
cd android
.\gradlew clean
.\gradlew assembleDebug
```

## 📝 완료 체크리스트

- [ ] Android 아이콘 생성 (5개 해상도)
- [ ] Android round 아이콘 생성
- [ ] iOS 아이콘 생성 (AppIcon set)
- [ ] Android 디버그 빌드 테스트
- [ ] iOS 시뮬레이터 테스트
- [ ] 아이콘이 잘 보이는지 확인

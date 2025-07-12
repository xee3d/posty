# SVN 제외 파일 목록 (svn:ignore)

## 필수 제외 항목

### Node.js 관련
- node_modules/  # npm 패키지 (크기가 크고 npm install로 복원 가능)
- npm-debug.log*
- yarn-error.log*
- yarn-debug.log*

### Android 빌드 관련
- android/build/
- android/app/build/
- android/.gradle/
- android/local.properties  # 로컬 SDK 경로
- *.apk
- *.aab
- *.hprof

### iOS 빌드 관련 (Mac에서만)
- ios/build/
- ios/Pods/
- ios/.xcode.env.local
- *.ipa

### IDE 관련
- .idea/
- *.iml
- .vscode/
- *.swp
- *.swo

### OS 관련
- .DS_Store
- Thumbs.db
- desktop.ini

### 임시 파일
- *.log
- *.tmp
- *.temp
- *.cache
- .metro-health-check*
- metro-cache/

### 환경 설정 (주의!)
- .env.local
- .env.*.local
- local.properties

### 보안 관련 (절대 커밋 금지!)
- *.keystore  (debug.keystore 제외)
- *.jks
- *.pem
- *.p12

## 확인 필요 항목

### 환경 설정 파일
- .env  # 이미 커밋된 경우 샘플 파일로 대체 권장
- .env.production
- .env.development

### 빌드 결과물
- android/gradle-wrapper.jar  # 필요한 경우도 있음

## SVN 명령어

### 제외 설정 추가
```bash
# 단일 파일/폴더 제외
svn propset svn:ignore "node_modules" .

# 여러 항목 제외
svn propset svn:ignore -F svnignore.txt .

# Android 폴더에서
cd android
svn propset svn:ignore "build
.gradle
local.properties" .
```

### 제외 설정 확인
```bash
svn propget svn:ignore .
svn status --no-ignore  # 제외된 파일 포함 표시
```

### 이미 추가된 파일 제거
```bash
svn rm --keep-local filename
svn commit -m "Remove file from version control"
```

# Java 메모리 누수 해결 가이드

## 문제 진단

Java(TM) Platform SE binary의 메모리 누수는 주로 다음과 같은 원인으로 발생합니다:

1. **Gradle Daemon이 종료되지 않음**
2. **Metro bundler의 캐시 문제**
3. **Android Studio의 인덱싱 문제**
4. **React Native의 hot reload 메모리 누적**

## 즉시 해결 방법

### 1. 모든 Java 프로세스 종료
```bash
# Windows
cd C:\Users\xee3d\Documents\Posty_V74
scripts\clean-java-memory.bat

# 또는 수동으로
taskkill /F /IM java.exe
taskkill /F /IM javaw.exe
```

### 2. Gradle Daemon 정리
```bash
cd C:\Users\xee3d\Documents\Posty_V74\android
gradlew --stop
gradlew clean
```

### 3. Metro 캐시 정리
```bash
cd C:\Users\xee3d\Documents\Posty_V74
npx react-native start --reset-cache
```

## 영구적 해결 방법

### 1. gradle.properties 수정 (완료됨)
```properties
# 메모리 할당 증가 및 GC 최적화
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -XX:+UseParallelGC

# 병렬 빌드 활성화
org.gradle.parallel=true

# 데몬 활성화
org.gradle.daemon=true
```

### 2. Android Studio 설정
1. File → Settings → Build, Execution, Deployment → Build Tools → Gradle
2. Gradle JDK: JDK 17 사용
3. Use Gradle from: gradle-wrapper.properties
4. Run tests using: Gradle (not Android Studio)

### 3. 시스템 환경 변수 설정
```bash
# Windows 환경 변수
GRADLE_OPTS=-Xmx4096m -XX:MaxPermSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
_JAVA_OPTIONS=-Xmx4096m
```

### 4. 개발 중 주의사항
- 장시간 개발 시 주기적으로 Metro bundler 재시작
- Android Studio와 에뮬레이터를 동시에 사용하지 않기
- 불필요한 브라우저 탭 닫기 (특히 React DevTools)

## 모니터링

### Windows에서 Java 메모리 사용량 확인
```bash
# Task Manager에서 확인
# 또는 PowerShell에서
Get-Process java* | Select-Object Name, @{Name="Memory(MB)";Expression={[Math]::Round($_.WorkingSet64/1MB)}}
```

### 자동 정리 스케줄 설정
Windows 작업 스케줄러에서 매일 자정에 `clean-java-memory.bat` 실행하도록 설정

## 추가 최적화 옵션

### 1. React Native 0.74.5 특화 설정
```bash
# .env 파일에 추가
REACT_NATIVE_CACHE_DIR=C:\temp\rn-cache
```

### 2. 빌드 속도 개선
```bash
# android/app/build.gradle
android {
    ...
    dexOptions {
        preDexLibraries true
        maxProcessCount 8
        javaMaxHeapSize "4g"
    }
}
```

## 문제가 지속될 경우

1. Windows 재시작
2. Node.js 재설치 (v18 LTS 권장)
3. Android SDK 캐시 정리
4. 안티바이러스 실시간 검사에서 프로젝트 폴더 제외

## 주의사항

- 메모리를 너무 많이 할당하면 시스템 전체가 느려질 수 있음
- 개발 PC의 RAM이 16GB 이상인 경우에만 위 설정 사용 권장
- 8GB RAM인 경우 Xmx를 2048m으로 낮춰서 사용

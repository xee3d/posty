# AI 작성 화면 사운드/진동 적용 가이드

## 적용된 효과

### 1. 생성 버튼

- **생성 시작**: `soundManager.playGenerate()` - AI 생성 시작음
- **생성 성공**: `soundManager.playSuccess()` - 성공 효과음
- **생성 실패**: `soundManager.playError()` - 에러 효과음
- **토큰 부족**: `soundManager.playError()` - 에러 효과음

### 2. 모드 전환

- **탭 전환**: `soundManager.haptic('light')` - 가벼운 진동

### 3. 옵션 선택

- **톤 선택**: `soundManager.playTap()` - 탭 효과음
- **길이 선택**: `soundManager.playTap()` - 탭 효과음
- **해시태그 선택**: `soundManager.haptic('light')` - 가벼운 진동

### 4. 텍스트 작업

- **복사**: `soundManager.playCopy()` - 복사 효과음
- **저장**: `soundManager.playSuccess()` - 저장 성공음
- **새로고침**: `soundManager.playRefresh()` - 새로고침 효과음

### 5. 사진 모드

- **사진 선택**: `soundManager.playTap()` - 선택 효과음
- **분석 완료**: `soundManager.playSuccess()` - 분석 성공음

## 구현 방법

1. **handleGenerate 함수 수정**

```javascript
const handleGenerate = async () => {
  // 토큰 체크
  if (!checkTokenAvailability(requiredTokens)) {
    soundManager.playError(); // 토큰 부족 에러음
    return;
  }

  // 입력 검증
  if (!prompt.trim() && writeMode !== "photo") {
    soundManager.playError(); // 빈 입력 에러음
    Alert.alert("포스티 알림", "무엇에 대해 쓸지 알려주세요! 🤔");
    return;
  }

  soundManager.playGenerate(); // 생성 시작음
  setIsGenerating(true);

  try {
    // ... 생성 로직 ...
    soundManager.playSuccess(); // 생성 성공음
  } catch (error) {
    soundManager.playError(); // 생성 실패음
    // ... 에러 처리 ...
  }
};
```

2. **GeneratedContentDisplay 컴포넌트 내부**

```javascript
// 복사 버튼
const handleCopy = () => {
  soundManager.playCopy();
  Clipboard.setString(content);
  // ...
};

// 저장 버튼
const handleSave = () => {
  soundManager.playSuccess();
  onSave(platform);
  // ...
};
```

3. **모드 전환 버튼**

```javascript
<SoundButton
  style={[styles.modeButton, writeMode === "text" && styles.modeButtonActive]}
  onPress={() => {
    if (writeMode !== "text") {
      resetAllStates();
    }
    setWriteMode("text");
  }}
  soundType="none"
  hapticType="light"
>
  {/* 버튼 내용 */}
</SoundButton>
```

4. **톤/길이 선택**

```javascript
<SoundButton
  style={[styles.toneCard, ...]}
  onPress={() => setSelectedTone(tone.id)}
  soundType="tap"
>
  {/* 카드 내용 */}
</SoundButton>
```

## 추가 개선 사항

### 1. 타이핑 피드백

- 텍스트 입력 시 가벼운 햅틱 피드백 (선택적)
- 100자 도달 시 경고음

### 2. 로딩 중 피드백

- 생성 중 주기적인 진동 (1초마다)
- 완료 시 성공 패턴

### 3. 미션 완료

- 미션 달성 시 축하 사운드/진동

## 테스트 체크리스트

- [ ] 생성 버튼 클릭 시 사운드
- [ ] 토큰 부족 시 에러 사운드
- [ ] 생성 성공 시 성공 사운드
- [ ] 모드 전환 시 햅틱
- [ ] 복사 시 복사 사운드
- [ ] 저장 시 성공 사운드
- [ ] 설정에서 사운드/진동 끄기 테스트

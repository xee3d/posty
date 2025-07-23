# AIWriteScreen handleGenerate 함수 사운드 추가 패치

## 적용할 수정사항

### 1. handleGenerate 함수 시작 부분
```javascript
const handleGenerate = async () => {
  if (!prompt.trim() && writeMode !== 'photo') {
    soundManager.playError(); // 추가: 빈 입력 에러음
    Alert.alert('포스티 알림', '무엇에 대해 쓸지 알려주세요! 🤔');
    return;
  }

  if (writeMode === 'photo' && !selectedImage) {
    soundManager.playError(); // 추가: 사진 없음 에러음
    Alert.alert('포스티 알림', '사진을 먼저 선택해주세요! 📸');
    return;
  }

  // 토큰 체크 - 플랜별 이미지 분석 토큰 적용
  const requiredTokens = writeMode === 'photo' ? getImageAnalysisTokens(userPlan) : 1;
  if (!checkTokenAvailability(requiredTokens)) {
    soundManager.playError(); // 추가: 토큰 부족 에러음
    return;
  }

  soundManager.playGenerate(); // 추가: AI 생성 시작음
  setIsGenerating(true);
```

### 2. 생성 성공 부분
```javascript
  setGeneratedContent(result);
  console.log('[AIWriteScreen] generatedContent set, now releasing loading state');
  
  soundManager.playSuccess(); // 추가: 생성 성공음
  
  // 로딩 상태를 먼저 해제
  setIsGenerating(false);
```

### 3. 에러 처리 부분
```javascript
} catch (error) {
  console.error('Generation error:', error);
  soundManager.playError(); // 추가: 생성 실패음
  Alert.alert('포스티 알림', '앗! 뭔가 문제가 생겼어요. 다시 시도해주세요 🥺');
  // 에러 발생 시에만 로딩 해제
  setIsGenerating(false);
}
```

## 적용 방법

1. AIWriteScreen.tsx 파일을 열어서
2. handleGenerate 함수를 찾아서
3. 위의 주석이 표시된 부분에 사운드 관련 코드를 추가

## 추가로 적용할 부분

### 모드 전환 버튼
```javascript
<ScaleButton
  style={[styles.modeButton, writeMode === 'text' && styles.modeButtonActive]}
  onPress={() => {
    soundManager.haptic('light'); // 추가: 모드 전환 햅틱
    if (writeMode !== 'text') {
      resetAllStates();
    }
    setWriteMode('text');
  }}
>
```

### 톤 선택
```javascript
<TouchableOpacity
  onPress={() => {
    if (!canAccessTone(userPlan, tone.id)) {
      soundManager.playError(); // 추가: 잠긴 톤 선택 시
      Alert.alert(...);
      return;
    }
    soundManager.playTap(); // 추가: 톤 선택 시
    setSelectedTone(tone.id);
  }}
>
```

### 빠른 주제 선택
```javascript
<TouchableOpacity
  onPress={() => {
    soundManager.haptic('light'); // 추가: 빠른 주제 선택
    handleQuickPrompt(quickPrompt)
  }}
>
```

### 새로고침 버튼
```javascript
<TouchableOpacity
  onPress={async () => {
    soundManager.playRefresh(); // 추가: 새로고침 사운드
    await loadTrendingData(true);
    Alert.alert('트렌드 업데이트', '최신 트렌드를 불러왔어요!');
  }}
>
```

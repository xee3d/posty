# Firebase Admin SDK 설정 가이드

## 1. Firebase Console에서 서비스 계정 키 가져오기

1. https://console.firebase.google.com 접속
2. Posty 프로젝트 선택
3. 프로젝트 설정 (톱니바퀴 아이콘) 클릭
4. 서비스 계정 탭 선택
5. "새 비공개 키 생성" 클릭
6. JSON 파일 다운로드

## 2. JSON 파일에서 필요한 값 추출

다운로드한 JSON 파일을 열어서 다음 값들을 찾습니다:

```json
{
  "type": "service_account",
  "project_id": "postyai-app",  // 이 값을 FIREBASE_PROJECT_ID로
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  // 이 값을 FIREBASE_PRIVATE_KEY로
  "client_email": "firebase-adminsdk-xxxxx@postyai-app.iam.gserviceaccount.com",  // 이 값을 FIREBASE_CLIENT_EMAIL로
  ...
}
```

## 3. Vercel 환경 변수 설정

Vercel 대시보드 (https://vercel.com) → posty-api 프로젝트 → Settings → Environment Variables

### FIREBASE_PROJECT_ID
- Name: `FIREBASE_PROJECT_ID`
- Value: `postyai-app`
- Environment: Production, Preview, Development

### FIREBASE_CLIENT_EMAIL
- Name: `FIREBASE_CLIENT_EMAIL`
- Value: `firebase-adminsdk-xxxxx@postyai-app.iam.gserviceaccount.com`
- Environment: Production, Preview, Development

### FIREBASE_PRIVATE_KEY
- Name: `FIREBASE_PRIVATE_KEY`
- Value: (전체 private key 복사 - BEGIN과 END 포함)
- Environment: Production, Preview, Development

⚠️ 주의: FIREBASE_PRIVATE_KEY를 입력할 때 줄바꿈(\n)이 제대로 포함되어야 합니다.

## 4. 환경 변수 저장 후 재배포

1. 모든 환경 변수 저장
2. Deployments 탭으로 이동
3. 최근 배포의 ⋮ 메뉴 클릭
4. "Redeploy" 선택
5. "Redeploy" 버튼 클릭

## 5. 확인

재배포 후 다음 URL로 확인:
https://posty-api.vercel.app/api/health

성공하면 서버가 정상 작동합니다.

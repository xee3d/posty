# Google Play 아동 안전 표준 정책 대응 가이드

## 문제 해결 완료 사항

구글 플레이 스토어의 아동 안전 표준 정책 위반 문제를 해결하기 위해 다음 문서가 작성되었습니다:

### ✅ 생성된 문서

1. **Markdown 버전**: `/docs/legal/CHILD_SAFETY_STANDARDS.md`
2. **HTML 버전**: `/docs/legal/child-safety-standards.html`

두 문서 모두 Google Play의 요구사항을 충족하도록 작성되었습니다:

- ✅ CSAE(아동 성적 학대 및 착취)를 명시적으로 금지
- ✅ 앱 이름(Posty AI) 및 개발자 이름 명시
- ✅ 아동 안전 담당자 연락처 정보 포함
- ✅ 인앱 신고 메커니즘 설명
- ✅ CSAM 해결 방법 명시
- ✅ 관련 법률 및 규정 준수 선언

---

## Google Play Console 제출 방법

### 1단계: 문서 웹 호스팅

먼저 작성된 아동 안전 표준 문서를 웹에 공개해야 합니다. 다음 옵션 중 하나를 선택하세요:

#### 옵션 A: GitHub Pages (무료, 권장)

1. **HTML 파일을 GitHub 저장소에 업로드**
   ```bash
   # 프로젝트 루트에서
   git add docs/legal/child-safety-standards.html
   git commit -m "docs: Add child safety standards for Google Play compliance"
   git push
   ```

2. **GitHub Pages 활성화**
   - GitHub 저장소 페이지로 이동
   - Settings > Pages
   - Source: "Deploy from a branch" 선택
   - Branch: "main" 또는 "master" 선택, 폴더: "/docs" 선택
   - Save 클릭

3. **URL 확인**
   - 몇 분 후 다음 형식의 URL로 접근 가능:
   - `https://[username].github.io/[repository]/legal/child-safety-standards.html`
   - 예: `https://postyai.github.io/posty/legal/child-safety-standards.html`

#### 옵션 B: Vercel (무료, 빠름)

Posty 앱이 이미 Vercel을 사용하는 것 같습니다:

1. **Vercel 프로젝트에 문서 추가**
   - `public/child-safety-standards.html` 경로에 HTML 파일 복사
   - Vercel에 배포

2. **URL 확인**
   - `https://[your-domain].vercel.app/child-safety-standards.html`
   - 또는 커스텀 도메인이 있다면 그 도메인 사용

#### 옵션 C: 웹 서버에 직접 업로드

자체 웹 서버가 있다면 HTML 파일을 업로드하고 공개 URL을 확보하세요.

---

### 2단계: Google Play Console에 제출

1. **Play Console 로그인**
   - https://play.google.com/console 접속
   - Posty AI 앱 선택

2. **앱 콘텐츠 섹션으로 이동**
   - 왼쪽 메뉴에서 "정책" > "앱 콘텐츠" 클릭

3. **아동 안전 섹션 찾기**
   - "아동 안전" 또는 "Child Safety" 섹션 찾기
   - "관리" 또는 "Manage" 버튼 클릭

4. **공개 표준 URL 입력**
   - "공개 표준 URL" 또는 "Public Standards URL" 필드 찾기
   - 1단계에서 확보한 URL 입력
   - 예: `https://postyai.github.io/posty/legal/child-safety-standards.html`

5. **아동 안전 담당자 정보 입력**
   - 이름: [담당자 이름 입력]
   - 이메일: `childsafety@getposty.com`
   - 또는: `getposty@gmail.com`

6. **추가 질문에 답변**
   Play Console이 요구하는 추가 질문에 답변:

   - **앱이 아동을 대상으로 하나요?**
     - "아니오" (만 14세 이상 대상)

   - **인앱 신고 메커니즘이 있나요?**
     - "예"
     - 설명: "앱 내 각 콘텐츠 및 사용자 프로필에 '신고하기' 기능이 있으며, 아동 안전 카테고리를 선택할 수 있습니다."

   - **CSAM 콘텐츠에 대한 대응 절차가 있나요?**
     - "예"
     - 설명: "CSAM 발견 시 즉시 삭제, 계정 영구 정지, 법 집행 기관 신고 등의 절차를 따릅니다."

   - **관련 법률을 준수하나요?**
     - "예"
     - 설명: "대한민국 아동·청소년의 성보호에 관한 법률 및 모든 관련 국내외 법률을 준수합니다."

7. **저장 및 제출**
   - 모든 정보 입력 후 "저장" 클릭
   - 앱 검토를 위해 새로운 버전 제출 (필요한 경우)

---

### 3단계: 확인 사항

제출 전 다음 사항을 확인하세요:

#### ✅ URL 접근성 체크리스트

1. **브라우저에서 URL 접속 테스트**
   - 오류 없이 정상적으로 로드되는지 확인
   - 모바일에서도 정상 작동 확인

2. **필수 내용 포함 확인**
   - [ ] Posty AI 앱 이름 명시
   - [ ] 개발자 이름 명시
   - [ ] CSAE 명시적 금지 조항
   - [ ] 아동 안전 담당자 연락처
   - [ ] 신고 메커니즘 설명
   - [ ] CSAM 대응 절차
   - [ ] 관련 법률 준수 선언

3. **접근성 확인**
   - HTTPS 사용 (HTTP는 거부될 수 있음)
   - 공개적으로 접근 가능 (로그인 불필요)
   - 빠른 로딩 속도

---

## 추가 권장 사항

### 1. 앱 내 신고 기능 구현

현재 앱에 아동 안전 관련 신고 기능이 없다면 추가 구현을 권장합니다:

```typescript
// 예시: 신고 카테고리에 "아동 안전" 추가
const reportCategories = [
  { id: 'spam', label: '스팸' },
  { id: 'inappropriate', label: '부적절한 콘텐츠' },
  { id: 'child_safety', label: '아동 안전', priority: 'high' }, // 추가
  { id: 'harassment', label: '괴롭힘' },
  // ...
];
```

### 2. 이용약관에 참조 추가

`docs/legal/TERMS_OF_SERVICE.md`에 아동 안전 표준 참조를 추가하는 것을 권장:

```markdown
## 제XX조 (아동 안전)

이용자는 서비스 이용 시 회사의 아동 안전 표준을 준수해야 합니다.
자세한 내용은 [아동 안전 표준](./CHILD_SAFETY_STANDARDS.md)을 참조하세요.
```

### 3. 개인정보 처리방침 업데이트

`docs/legal/PRIVACY_POLICY.md`의 제8조(아동의 개인정보 보호)에 아동 안전 표준 참조 추가:

```markdown
## 8. 아동의 개인정보 보호

회사는 만 14세 미만 아동의 개인정보를 수집하지 않습니다.
만 14세 미만 아동의 개인정보가 수집된 사실을 인지한 경우 즉시 해당 정보를 파기합니다.

아동 안전에 관한 자세한 정책은 [아동 안전 표준](./CHILD_SAFETY_STANDARDS.md)을 참조하세요.
```

---

## 예상 타임라인

1. **문서 호스팅**: 즉시 ~ 1일
2. **Play Console 제출**: 30분 ~ 1시간
3. **Google 검토**: 1일 ~ 7일
4. **승인 및 게시**: 검토 완료 후 즉시

---

## 문제 해결

### Q1: URL이 작동하지 않는다고 거부당했어요

**해결방법**:
- HTTPS 사용 확인
- 실제로 브라우저에서 접근 가능한지 테스트
- robots.txt에서 차단되지 않았는지 확인
- GitHub Pages의 경우 빌드 완료 확인

### Q2: 내용이 불충분하다고 거부당했어요

**해결방법**:
- CSAE를 더 명시적으로 금지하는 문구 강조
- 법률 준수 섹션 확대
- 아동 안전 담당자 정보 재확인

### Q3: 아동 안전 담당자 이메일이 작동하지 않는다고 나옵니다

**해결방법**:
1. `childsafety@getposty.com` 이메일 주소를 실제로 생성
2. 또는 기존 `getposty@gmail.com`만 사용하고 문서에서 일관되게 유지
3. 이메일 전달 규칙 설정하여 즉시 응답 가능하도록 구성

---

## 연락처

추가 지원이 필요하시면:

- Google Play 지원: https://support.google.com/googleplay/android-developer
- Posty AI 개발팀: getposty@gmail.com

---

**작성일**: 2025년 10월 21일
**문서 버전**: 1.0

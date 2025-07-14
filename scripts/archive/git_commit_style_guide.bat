@echo off
echo === Git Commit: Style Guide Integration ===
echo.

REM Git 상태 확인
echo 1. Checking git status...
git status

echo.
echo 2. Adding modified files...
git add src/screens/AIWriteScreen.tsx
git add src/screens/MyStyleScreen.tsx
git add src/navigation/AppNavigator.tsx
git add App.tsx

echo.
echo 3. Creating commit...
git commit -m "feat: 템플릿에서 글쓰기로 스타일 가이드 연동 구현

- MyStyleScreen에서 AIWriteScreen으로 스타일 정보 전달
- 스타일 가이드 배너 추가 (축소/확장 가능)
- 스타일별 맞춤형 placeholder 및 빠른 주제 제공
- 스타일에 따른 기본 글 길이 자동 설정
- AI 생성 시 스타일 특성 반영하여 품질 향상"

echo.
echo 4. Commit completed!
echo.
echo To push changes, run: git push origin [branch-name]
pause

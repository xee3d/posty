#!/bin/bash

# Posty 앱의 에러/경고 로그만 확인
# 실행: ./scripts/view-errors-only.sh

echo "🚨 Posty 에러/경고 로그 스트리밍..."
echo "종료하려면 Ctrl+C를 누르세요"
echo ""

log stream \
  --predicate '(process == "Posty" OR processImagePath CONTAINS "Posty") AND (messageType == "Error" OR messageType == "Fault" OR messageType == "Warning")' \
  --style syslog \
  --color auto \
  --level error

#!/bin/bash

# TestFlight 디바이스 로그 확인 스크립트
# 실행: ./scripts/view-device-logs.sh

echo "📱 연결된 iOS 디바이스 확인 중..."
echo ""

# 연결된 디바이스 목록 표시
xcrun devicectl list devices 2>/dev/null || instruments -s devices | grep -v "Simulator"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Posty 앱 로그 스트리밍 시작..."
echo "종료하려면 Ctrl+C를 누르세요"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 디바이스 로그를 실시간으로 스트리밍 (Posty 앱만 필터링)
# --predicate: 로그 필터링 조건
# --style: 로그 출력 스타일 (syslog, json, compact)
# --color: 컬러 출력 활성화

log stream \
  --predicate 'process == "Posty" OR processImagePath CONTAINS "Posty"' \
  --style syslog \
  --color auto \
  --level debug

# 대안: iOS Console 로그 (더 많은 시스템 로그 포함)
# xcrun devicectl device-log stream --device <device-id>

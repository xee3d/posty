#!/bin/bash

# TestFlight 디바이스 로그를 파일로 저장
# 실행: ./scripts/save-device-logs.sh [시간(초)]
# 예시: ./scripts/save-device-logs.sh 60  (60초 동안 로그 수집)

DURATION=${1:-30}  # 기본 30초
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_DIR="logs/device"
LOG_FILE="$LOG_DIR/posty_device_${TIMESTAMP}.log"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

echo "📱 연결된 디바이스:"
xcrun devicectl list devices 2>/dev/null || instruments -s devices | grep -v "Simulator"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 로그 수집 중... (${DURATION}초)"
echo "저장 위치: $LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 로그 헤더 작성
cat > "$LOG_FILE" <<EOF
Posty Device Log
Generated: $(date)
Duration: ${DURATION} seconds
Device: $(instruments -s devices | grep -v "Simulator" | head -n 1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

# 지정된 시간 동안 로그 수집
timeout "$DURATION" log stream \
  --predicate 'process == "Posty" OR processImagePath CONTAINS "Posty"' \
  --style syslog \
  --level debug \
  >> "$LOG_FILE" 2>&1

echo ""
echo "✅ 로그 저장 완료!"
echo "📂 파일: $LOG_FILE"
echo "📊 파일 크기: $(du -h "$LOG_FILE" | cut -f1)"
echo ""
echo "로그 확인: cat $LOG_FILE"
echo "에러만 보기: grep -i error $LOG_FILE"

#!/bin/bash

# Xcode Devices Console을 열어서 디바이스 로그 확인
# 실행: ./scripts/open-xcode-console.sh

echo "🔧 Xcode 실행 중..."
open -a Xcode

sleep 2

echo "📱 Devices and Simulators 창 열기..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 다음 단계를 따라주세요:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Xcode 메뉴: Window > Devices and Simulators"
echo "   또는 단축키: ⌘⇧2 (Cmd+Shift+2)"
echo ""
echo "2️⃣  왼쪽에서 연결된 '💚 Ethan의 iPhone' 선택"
echo ""
echo "3️⃣  우측 하단의 '📋 Open Console' 버튼 클릭"
echo ""
echo "4️⃣  검색창에 'Posty' 입력하여 앱 로그만 필터링"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 팁:"
echo "   • 'Error', 'Warning' 등으로 검색하여 문제 진단"
echo "   • Console에서 우클릭 > 'Save' 로 로그 저장 가능"
echo "   • 'Clear' 버튼으로 기존 로그 지우고 새로 수집 가능"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# AppleScript로 Devices and Simulators 창 자동 열기 시도
osascript <<EOF 2>/dev/null
tell application "Xcode"
    activate
end tell

tell application "System Events"
    tell process "Xcode"
        keystroke "2" using {command down, shift down}
    end tell
end tell
EOF

echo "✅ Xcode Devices Console이 열렸습니다!"

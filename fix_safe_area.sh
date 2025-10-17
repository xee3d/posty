#!/bin/bash

# SafeAreaView를 사용하는 모든 tsx 파일 찾기
find src/screens -name "*.tsx" -type f | while IFS= read -r file; do
  # SafeAreaView를 사용하는 파일만 처리
  if grep -q "SafeAreaView" "$file"; then
    # 이미 react-native-safe-area-context를 사용하는지 확인
    if ! grep -q "from 'react-native-safe-area-context'" "$file"; then
      echo "Processing: $file"
      
      # Python을 사용해서 정확하게 수정
      python3 << 'PYEOF'
import re
import sys

filepath = sys.argv[1]

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# react-native 임포트에서 SafeAreaView 제거
# 여러 줄에 걸친 임포트 처리
lines = content.split('\n')
new_lines = []
in_react_native_import = False
react_native_import_lines = []
import_start_idx = -1

for i, line in enumerate(lines):
    if 'from "react-native"' in line or "from 'react-native'" in line:
        # react-native 임포트 시작
        if '{' in line:
            in_react_native_import = True
            import_start_idx = len(new_lines)
            react_native_import_lines.append(line)
            if '}' in line:
                # 한 줄로 끝나는 경우
                in_react_native_import = False
                # SafeAreaView 제거
                import_line = ''.join(react_native_import_lines)
                import_line = re.sub(r',?\s*SafeAreaView\s*,?', '', import_line)
                # 연속 쉼표 정리
                import_line = re.sub(r',\s*,', ',', import_line)
                import_line = re.sub(r'\{\s*,', '{', import_line)
                import_line = re.sub(r',\s*\}', '}', import_line)
                new_lines.append(import_line)
                # safe-area-context 임포트 추가
                new_lines.append("import { SafeAreaView } from 'react-native-safe-area-context';")
                react_native_import_lines = []
        else:
            new_lines.append(line)
    elif in_react_native_import:
        react_native_import_lines.append(line)
        if '}' in line:
            # 임포트 끝
            in_react_native_import = False
            # SafeAreaView 제거
            import_text = '\n'.join(react_native_import_lines)
            import_text = re.sub(r',?\s*SafeAreaView\s*,?', '', import_text)
            # 연속 쉼표 정리
            import_text = re.sub(r',\s*,', ',', import_text)
            import_text = re.sub(r'\{\s*,', '{', import_text)
            import_text = re.sub(r',\s*\}', '}', import_text)
            new_lines.extend(import_text.split('\n'))
            # safe-area-context 임포트 추가
            new_lines.append("import { SafeAreaView } from 'react-native-safe-area-context';")
            react_native_import_lines = []
    else:
        new_lines.append(line)

new_content = '\n'.join(new_lines)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"  ✓ Updated: {filepath}")
PYEOF
python3 - "$file"
    else
      echo "Skipping (already using safe-area-context): $file"
    fi
  fi
done

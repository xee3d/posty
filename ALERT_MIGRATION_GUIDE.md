# React Native Alert → Custom Alert 마이그레이션 가이드

## 개요
프로젝트 전체에서 React Native의 기본 Alert를 커스텀 Alert로 일괄 변환하는 방법입니다.

## 자동화 스크립트

### 1. PowerShell 스크립트 (Windows)
`migrate-alerts.ps1` 파일을 생성하고 아래 내용을 저장하세요:

```powershell
# 프로젝트 루트 경로 설정
$projectPath = "C:\Users\xee3d\Documents\Posty_V74\src"

# Alert를 import하는 모든 파일 찾기
Write-Host "Finding files with React Native Alert..." -ForegroundColor Yellow

$files = Get-ChildItem -Path $projectPath -Include *.ts,*.tsx,*.js,*.jsx -Recurse | 
    Where-Object { 
        $content = Get-Content $_.FullName -Raw
        $content -match "import\s*{[^}]*Alert[^}]*}\s*from\s*['""]react-native['""]" -and
        $content -notmatch "from\s*['""].*customAlert['""]"
    }

Write-Host "Found $($files.Count) files to update:" -ForegroundColor Green
$files | ForEach-Object { Write-Host "  - $($_.FullName.Replace($projectPath, ''))" }

# 사용자 확인
$response = Read-Host "`nDo you want to update these files? (Y/N)"
if ($response -ne 'Y') {
    Write-Host "Migration cancelled." -ForegroundColor Red
    exit
}

# 각 파일 수정
foreach ($file in $files) {
    Write-Host "`nProcessing: $($file.Name)" -ForegroundColor Cyan
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # React Native import에서 Alert 제거
    if ($content -match "(import\s*{\s*)([^}]*Alert[^}]*)(}\s*from\s*['""]react-native['""])") {
        $imports = $matches[2] -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne 'Alert' }
        
        if ($imports.Count -gt 0) {
            # 다른 import가 남아있는 경우
            $newImports = $imports -join ', '
            $content = $content -replace "(import\s*{\s*)([^}]*)(}\s*from\s*['""]react-native['""])", "`$1$newImports`$3"
        } else {
            # Alert만 있었던 경우 - import 문 전체 제거
            $content = $content -replace "import\s*{\s*Alert\s*}\s*from\s*['""]react-native['""];?\s*\n", ""
        }
    }
    
    # 상대 경로 계산
    $fileDir = Split-Path $file.FullName -Parent
    $relativePath = ""
    $depth = ($fileDir.Replace($projectPath, '').Split('\').Count) - 1
    
    if ($depth -eq 0) {
        $relativePath = "./utils/customAlert"
    } else {
        $relativePath = "../" * $depth + "utils/customAlert"
    }
    
    # Custom Alert import 추가
    $customImport = "import { Alert } from '$relativePath';"
    
    # 적절한 위치에 import 추가 (다른 import 문 다음)
    if ($content -match "(import[^;]+;[\r\n]+)*") {
        $lastImportIndex = $matches[0].Length
        $content = $content.Insert($lastImportIndex, "$customImport`n")
    } else {
        $content = "$customImport`n$content"
    }
    
    # 파일 저장
    if ($content -ne $originalContent) {
        $content | Set-Content $file.FullName -NoNewline
        Write-Host "  ✓ Updated successfully" -ForegroundColor Green
    } else {
        Write-Host "  - No changes needed" -ForegroundColor Gray
    }
}

Write-Host "`nMigration completed!" -ForegroundColor Green
```

### 2. Node.js 스크립트 (크로스 플랫폼)
`migrate-alerts.js` 파일을 생성하고 아래 내용을 저장하세요:

```javascript
const fs = require('fs');
const path = require('path');

const projectPath = 'C:/Users/xee3d/Documents/Posty_V74/src';
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// 파일에서 Alert import 찾기
function hasReactNativeAlert(content) {
  const importRegex = /import\s*{[^}]*Alert[^}]*}\s*from\s*['"]react-native['"]/;
  const customAlertRegex = /from\s*['"].*customAlert['"]/;
  
  return importRegex.test(content) && !customAlertRegex.test(content);
}

// 디렉토리 재귀 탐색
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      findFiles(filePath, fileList);
    } else if (fileExtensions.includes(path.extname(file))) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (hasReactNativeAlert(content)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Alert import 수정
function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // React Native import에서 Alert 제거
  const importRegex = /import\s*{([^}]*)}\s*from\s*['"]react-native['"]/;
  const match = content.match(importRegex);
  
  if (match) {
    const imports = match[1].split(',').map(i => i.trim());
    const filteredImports = imports.filter(i => i !== 'Alert');
    
    if (filteredImports.length > 0) {
      content = content.replace(importRegex, `import { ${filteredImports.join(', ')} } from 'react-native'`);
    } else {
      content = content.replace(/import\s*{\s*Alert\s*}\s*from\s*['"]react-native['"];\s*\n?/, '');
    }
  }
  
  // 상대 경로 계산
  const relativePath = path.relative(path.dirname(filePath), path.join(projectPath, 'utils/customAlert'))
    .replace(/\\/g, '/');
  
  // Custom Alert import 추가
  const customImport = `import { Alert } from '${relativePath}';\n`;
  
  // 다른 import 문 다음에 추가
  const importEndRegex = /(import[^;]+;\s*\n)*/;
  content = content.replace(importEndRegex, (match) => match + customImport);
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Updated: ${path.relative(projectPath, filePath)}`);
}

// 실행
console.log('Finding files with React Native Alert...\n');
const files = findFiles(projectPath);

console.log(`Found ${files.length} files to update:\n`);
files.forEach(file => {
  console.log(`  - ${path.relative(projectPath, file)}`);
});

console.log('\nStarting migration...\n');
files.forEach(updateFile);

console.log('\nMigration completed!');
```

### 3. 사용 방법

#### PowerShell 스크립트 실행:
```bash
cd C:\Users\xee3d\Documents\Posty_V74
.\migrate-alerts.ps1
```

#### Node.js 스크립트 실행:
```bash
cd C:\Users\xee3d\Documents\Posty_V74
node migrate-alerts.js
```

## 수동 확인 사항

스크립트 실행 후 다음 사항을 확인하세요:

1. **import 경로 확인**
   - 파일 위치에 따라 상대 경로가 올바른지 확인
   - 예: `../utils/customAlert`, `../../utils/customAlert`

2. **Alert 사용 패턴 확인**
   - `Alert.alert()` 호출이 정상 작동하는지 확인
   - 파라미터가 커스텀 Alert와 호환되는지 확인

3. **테스트**
   - 각 화면에서 Alert가 정상적으로 표시되는지 확인
   - 커스텀 디자인이 적용되는지 확인

## 추가 검색 명령어

### 변경이 필요한 파일 찾기:
```bash
# Git Bash 또는 WSL
grep -r "from 'react-native'" src/ | grep Alert | grep -v customAlert

# PowerShell
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx,*.js,*.jsx | Select-String -Pattern "Alert.*from.*react-native" | Select-String -NotMatch "customAlert"
```

### 변경 확인:
```bash
# 커스텀 Alert 사용 파일 확인
grep -r "from.*customAlert" src/
```

## 주의사항

1. **백업**: 스크립트 실행 전 Git commit 또는 백업 생성
2. **테스트**: 변경 후 앱 빌드 및 테스트 필수
3. **코드 리뷰**: 자동 변경된 코드 검토 권장

이 방법을 사용하면 프로젝트 전체의 Alert를 효율적으로 마이그레이션할 수 있습니다.

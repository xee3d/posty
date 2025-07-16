const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, 'src');
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// 파일에서 React Native Alert import 찾기
function hasReactNativeAlert(content) {
  const importRegex = /import\s*{[^}]*Alert[^}]*}\s*from\s*['"]react-native['"]/;
  const customAlertRegex = /from\s*['"].*customAlert['"]/;
  
  return importRegex.test(content) && !customAlertRegex.test(content);
}

// 디렉토리 재귀 탐색
function findFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
          findFiles(filePath, fileList);
        } else if (fileExtensions.includes(path.extname(file))) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (hasReactNativeAlert(content)) {
            fileList.push(filePath);
          }
        }
      } catch (err) {
        // 파일 접근 오류 무시
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  
  return fileList;
}

// Alert import 수정
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // React Native import에서 Alert 제거
    const importRegex = /import\s*{([^}]*)}\s*from\s*['"]react-native['"]/g;
    
    content = content.replace(importRegex, (match, imports) => {
      const importList = imports.split(',').map(i => i.trim());
      const filteredImports = importList.filter(i => i !== 'Alert');
      
      if (filteredImports.length > 0) {
        return `import { ${filteredImports.join(', ')} } from 'react-native'`;
      } else {
        return ''; // 전체 import 제거
      }
    });
    
    // 빈 줄 정리
    content = content.replace(/\n\n+/g, '\n\n');
    
    // 상대 경로 계산
    const fileDir = path.dirname(filePath);
    const utilsPath = path.join(projectPath, 'utils', 'customAlert');
    let relativePath = path.relative(fileDir, utilsPath).replace(/\\/g, '/');
    
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    // Custom Alert import 추가 (다른 import 문 다음에)
    const customImport = `import { Alert } from '${relativePath}';`;
    
    // import 문들을 찾아서 그 다음에 추가
    const importMatches = content.match(/^import.*from.*;\s*$/gm);
    if (importMatches && importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      content = content.replace(lastImport, lastImport + '\n' + customImport);
    } else {
      // import 문이 없으면 파일 시작 부분에 추가
      content = customImport + '\n\n' + content;
    }
    
    // 변경사항이 있을 때만 저장
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`${colors.green}✓${colors.reset} Updated: ${colors.cyan}${path.relative(projectPath, filePath)}${colors.reset}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`${colors.red}✗${colors.reset} Error updating ${filePath}:`, err.message);
    return false;
  }
}

// 메인 실행
console.log(`${colors.yellow}Finding files with React Native Alert...${colors.reset}\n`);

if (!fs.existsSync(projectPath)) {
  console.error(`${colors.red}Error: Source directory not found: ${projectPath}${colors.reset}`);
  process.exit(1);
}

const files = findFiles(projectPath);

if (files.length === 0) {
  console.log(`${colors.green}No files found with React Native Alert import.${colors.reset}`);
  console.log('All files are already using custom Alert! 🎉');
  process.exit(0);
}

console.log(`${colors.bright}Found ${files.length} files to update:${colors.reset}\n`);
files.forEach(file => {
  console.log(`  ${colors.blue}-${colors.reset} ${path.relative(projectPath, file)}`);
});

console.log(`\n${colors.yellow}Starting migration...${colors.reset}\n`);

let successCount = 0;
files.forEach(file => {
  if (updateFile(file)) {
    successCount++;
  }
});

console.log(`\n${colors.green}${colors.bright}Migration completed!${colors.reset}`);
console.log(`Successfully updated ${successCount}/${files.length} files.`);

if (successCount < files.length) {
  console.log(`\n${colors.yellow}Warning: Some files could not be updated. Please check them manually.${colors.reset}`);
}

console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
console.log('1. Review the changes');
console.log('2. Test your app');
console.log('3. Commit the changes');

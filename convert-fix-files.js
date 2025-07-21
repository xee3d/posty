const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

// UTF-8로 저장된 파일들을 ANSI(CP949)로 변환
const files = [
  'fix/fix-all-issues.bat',
  'fix/fix-social-login.bat', 
  'fix/fix-servers.bat'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    // UTF-8로 읽기
    const content = fs.readFileSync(filePath, 'utf8');
    
    // CP949로 인코딩
    const encoded = iconv.encode(content, 'cp949');
    
    // 파일 다시 쓰기
    fs.writeFileSync(filePath, encoded);
    
    console.log(`✓ ${file} 변환 완료`);
  } catch (error) {
    console.error(`✗ ${file} 변환 실패:`, error.message);
  }
});

console.log('\n모든 파일 변환 완료!');

const fs = require('fs').promises;
const path = require('path');
const iconv = require('iconv-lite');

// 배치 파일 목록
const batchFiles = [
    'clean-build.bat',
    'cleanup-final.bat',
    'cleanup-safe.bat',
    'cleanup-temp.bat',
    'connect-phone.bat',
    'debug-deployment.bat',
    'debug-trends.bat',
    'deploy-all.bat',
    'deploy-monorepo.bat',
    'deploy-public-api.bat',
    'device-manager.bat',
    'do-cleanup.bat',
    'fix-phone-connection.bat',
    'fresh-deploy.bat',
    'install-phone.bat',
    'monitor-servers-live.bat',
    'quick-test.bat',
    'reconnect-metro.bat',
    'redeploy-servers.bat',
    'reset-tokens.bat',
    'run-all.bat',
    'run-emulator-only.bat',
    'run-multi-device.bat',
    'run-phone-only.bat',
    'safe-setup.bat',
    'security-fix.bat',
    'setup-domain-alias.bat',
    'start-dev.bat',
    'start-metro.bat',
    'verify-deployment.bat'
];

async function convertToAnsi() {
    for (const file of batchFiles) {
        try {
            const filePath = path.join(__dirname, file);
            
            // 파일을 UTF-8로 읽기
            const content = await fs.readFile(filePath, 'utf8');
            
            // CP949 (ANSI)로 변환
            const ansiBuffer = iconv.encode(content, 'cp949');
            
            // 파일 다시 쓰기
            await fs.writeFile(filePath, ansiBuffer);
            
            console.log(`✓ ${file} - ANSI(CP949) 형식으로 변환 완료`);
        } catch (error) {
            console.log(`✗ ${file} - 오류: ${error.message}`);
        }
    }
    
    console.log('\n모든 배치 파일 변환 작업 완료!');
}

convertToAnsi();

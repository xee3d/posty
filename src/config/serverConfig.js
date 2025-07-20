// 서버 URL 동적 설정을 위한 설정 파일
// src/config/serverConfig.js

const SERVER_CONFIGS = {
  // 가능한 서버 URL들 (우선순위 순)
  SERVERS: [
    'https://posty-server-new.vercel.app',
    'https://posty-server.vercel.app',
    'https://posty-server-xee3d.vercel.app',
    'https://posty-server-git-main-xee3d.vercel.app',
  ],
  
  // 현재 작동하는 서버 URL (동적으로 설정됨)
  CURRENT_SERVER: null,
  
  // 서버 체크 함수
  async findWorkingServer() {
    for (const server of this.SERVERS) {
      try {
        console.log(`Checking server: ${server}`);
        const response = await fetch(`${server}/api/health`, {
          method: 'GET',
          timeout: 5000,
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok') {
            console.log(`✅ Working server found: ${server}`);
            this.CURRENT_SERVER = server;
            return server;
          }
        }
      } catch (error) {
        console.log(`❌ Server ${server} failed:`, error.message);
      }
    }
    
    // 모든 서버가 실패하면 기본값 사용
    console.warn('⚠️ No working server found, using default');
    this.CURRENT_SERVER = this.SERVERS[0];
    return this.SERVERS[0];
  },
  
  // 현재 서버 URL 가져오기
  async getServerUrl() {
    if (!this.CURRENT_SERVER) {
      await this.findWorkingServer();
    }
    return this.CURRENT_SERVER;
  }
};

export default SERVER_CONFIGS;

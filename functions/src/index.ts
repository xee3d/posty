import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { tokenValidationService } from './services/tokenValidationService';
import { adVerificationService } from './services/adVerificationService';
import { analyticsService } from './services/analyticsService';
import subscriptionVerificationService from './services/subscriptionVerificationService';

// Firebase Admin 초기화
admin.initializeApp();

const app = express();

// 보안 미들웨어
app.use(helmet());
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://posty.app', 'https://www.posty.app'] 
    : true 
}));

// Rate limiting - 사용자당 분당 30회 요청 제한
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 30, // 최대 30회 요청
  message: {
    error: 'Too many requests',
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));

// 🔒 토큰 검증 엔드포인트
app.post('/validate-token-request', async (req, res) => {
  try {
    const result = await tokenValidationService.validateTokenRequest(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 🔒 광고 시청 검증 엔드포인트
app.post('/verify-ad-completion', async (req, res) => {
  try {
    const result = await adVerificationService.verifyAdCompletion(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Ad verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '광고 검증 중 오류가 발생했습니다.'
    });
  }
});

// 🔒 디바이스 무결성 검증
app.post('/verify-device-integrity', async (req, res) => {
  try {
    const result = await tokenValidationService.verifyDeviceIntegrity(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Device integrity error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '디바이스 검증 중 오류가 발생했습니다.'
    });
  }
});

// 🔒 보안 분석 및 차단 시스템
app.post('/analyze-security-threat', async (req, res) => {
  try {
    const result = await analyticsService.analyzeThreat(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Security analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 🔒 구독 영수증 검증 엔드포인트
app.post('/verify-subscription-receipt', async (req, res) => {
  try {
    const result = await subscriptionVerificationService.verifyReceipt(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Subscription verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '구독 검증 중 오류가 발생했습니다.'
    });
  }
});

// 🔒 구독 상태 실시간 확인
app.get('/subscription-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const status = await subscriptionVerificationService.checkSubscriptionStatus(userId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    res.status(200).json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 🔒 관리자 통계 조회 (인증 필요)
app.get('/admin/security-stats', async (req, res) => {
  try {
    // Firebase Auth 토큰 검증
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // 관리자 권한 확인 (Firebase Custom Claims 사용)
    if (!decodedToken.admin) {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    const stats = await analyticsService.getSecurityStatistics();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Firebase Functions로 Express 앱 배포
export const api = functions
  .region('asia-northeast3') // 서울 리전
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB',
    maxInstances: 100
  })
  .https
  .onRequest(app);

// 🔒 실시간 보안 모니터링 (Firestore 트리거)
export const securityMonitor = functions
  .region('asia-northeast3')
  .firestore
  .document('security_events/{eventId}')
  .onCreate(async (snap, context) => {
    const eventData = snap.data();
    
    // 심각한 보안 이벤트 감지 시 즉시 대응
    if (eventData.severity === 'critical') {
      await analyticsService.handleCriticalThreat(eventData);
    }
    
    // 패턴 분석을 위한 데이터 수집
    await analyticsService.collectSecurityMetrics(eventData);
  });

// 🔒 일일 보안 리포트 생성 (스케줄 함수)
export const dailySecurityReport = functions
  .region('asia-northeast3')
  .pubsub
  .schedule('0 9 * * *') // 매일 오전 9시
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    await analyticsService.generateDailySecurityReport();
  });

// 🔒 의심스러운 디바이스 자동 차단 (스케줄 함수)
export const autoBlockSuspiciousDevices = functions
  .region('asia-northeast3')
  .pubsub
  .schedule('*/30 * * * *') // 30분마다
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    await analyticsService.autoBlockSuspiciousDevices();
  });
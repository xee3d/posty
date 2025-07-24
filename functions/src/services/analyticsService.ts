import * as admin from 'firebase-admin';

interface ThreatAnalysisRequest {
  deviceFingerprint: string;
  eventType: string;
  metadata?: any;
  timestamp: number;
}

interface ThreatAnalysisResult {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
  reason?: string;
  actions: string[];
}

interface SecurityStatistics {
  totalEvents: number;
  threatsByLevel: Record<string, number>;
  blockedDevices: number;
  topThreats: Array<{ type: string; count: number }>;
  dailyStats: Record<string, number>;
}

class AnalyticsService {
  private readonly db = admin.firestore();

  /**
   * 보안 위협 분석
   */
  async analyzeThreat(request: ThreatAnalysisRequest): Promise<ThreatAnalysisResult> {
    try {
      console.log('🔍 Analyzing security threat:', request.eventType);

      // 1. 기본 위협 수준 결정
      let threatLevel = this.getBaseThreatLevel(request.eventType);
      const actions: string[] = [];

      // 2. 디바이스 히스토리 분석으로 위협 수준 조정
      const historyAnalysis = await this.analyzeDeviceHistory(request.deviceFingerprint);
      if (historyAnalysis.escalate) {
        threatLevel = this.escalateThreatLevel(threatLevel);
        actions.push('threat_escalated');
      }

      // 3. 실시간 패턴 분석
      const patternAnalysis = await this.analyzeRealTimePatterns(request);
      if (patternAnalysis.suspicious) {
        threatLevel = this.escalateThreatLevel(threatLevel);
        actions.push('pattern_suspicious');
      }

      // 4. 차단 결정
      const shouldBlock = this.shouldBlockDevice(threatLevel, historyAnalysis.riskScore);
      
      if (shouldBlock) {
        await this.executeBlockAction(request.deviceFingerprint, threatLevel, request.eventType);
        actions.push('device_blocked');
      }

      // 5. 위협 기록
      await this.recordThreatAnalysis(request, threatLevel, actions);

      return {
        threatLevel,
        blocked: shouldBlock,
        reason: shouldBlock ? `위협 수준: ${threatLevel}` : undefined,
        actions
      };

    } catch (error) {
      console.error('Threat analysis error:', error);
      return {
        threatLevel: 'medium',
        blocked: false,
        actions: ['analysis_error']
      };
    }
  }

  /**
   * 디바이스 히스토리 분석
   */
  private async analyzeDeviceHistory(deviceFingerprint: string): Promise<{ escalate: boolean; riskScore: number }> {
    try {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      // 최근 7일간 보안 이벤트 조회
      const events = await this.db
        .collection('security_events')
        .where('deviceFingerprint', '==', deviceFingerprint)
        .where('timestamp', '>', sevenDaysAgo)
        .get();

      let riskScore = 0;
      const eventCounts: Record<string, number> = {};

      events.docs.forEach(doc => {
        const data = doc.data();
        eventCounts[data.eventType] = (eventCounts[data.eventType] || 0) + 1;
        
        // 위험도 점수 계산
        switch (data.severity) {
          case 'low': riskScore += 1; break;
          case 'medium': riskScore += 3; break;
          case 'high': riskScore += 7; break;
          case 'critical': riskScore += 15; break;
        }
      });

      // 패턴 기반 위험도 증가
      if (eventCounts['invalid_signature'] > 3) riskScore += 20;
      if (eventCounts['suspicious_pattern'] > 5) riskScore += 15;
      if (eventCounts['hardware_mismatch'] > 0) riskScore += 25;

      const escalate = riskScore > 30; // 30점 이상 시 위협 수준 상승

      return { escalate, riskScore };
    } catch (error) {
      console.error('Device history analysis error:', error);
      return { escalate: false, riskScore: 0 };
    }
  }

  /**
   * 실시간 패턴 분석
   */
  private async analyzeRealTimePatterns(request: ThreatAnalysisRequest): Promise<{ suspicious: boolean; patterns: string[] }> {
    try {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const patterns: string[] = [];
      let suspicious = false;

      // 1. 같은 이벤트 타입의 빈발성 체크
      const sameEventQuery = await this.db
        .collection('security_events')
        .where('deviceFingerprint', '==', request.deviceFingerprint)
        .where('eventType', '==', request.eventType)
        .where('timestamp', '>', oneHourAgo)
        .get();

      if (sameEventQuery.size > 5) {
        suspicious = true;
        patterns.push('frequent_same_event');
      }

      // 2. 전체 보안 이벤트 빈발성 체크
      const allEventsQuery = await this.db
        .collection('security_events')
        .where('deviceFingerprint', '==', request.deviceFingerprint)
        .where('timestamp', '>', oneHourAgo)
        .get();

      if (allEventsQuery.size > 20) {
        suspicious = true;
        patterns.push('excessive_events');
      }

      // 3. 여러 디바이스에서 같은 패턴 체크 (분산 공격 탐지)
      const globalPatternQuery = await this.db
        .collection('security_events')
        .where('eventType', '==', request.eventType)
        .where('timestamp', '>', oneHourAgo)
        .get();

      const deviceSet = new Set();
      globalPatternQuery.docs.forEach(doc => {
        deviceSet.add(doc.data().deviceFingerprint);
      });

      if (deviceSet.size > 10 && globalPatternQuery.size > 50) {
        suspicious = true;
        patterns.push('coordinated_attack');
      }

      return { suspicious, patterns };
    } catch (error) {
      console.error('Real-time pattern analysis error:', error);
      return { suspicious: false, patterns: [] };
    }
  }

  /**
   * 기본 위협 수준 결정
   */
  private getBaseThreatLevel(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const threatLevels: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'basic_validation_failed': 'low',
      'invalid_signature': 'high',
      'suspicious_pattern': 'medium',
      'hardware_mismatch': 'critical',
      'ad_invalid_signature': 'high',
      'admob_ssv_failed': 'critical',
      'excessive_events': 'high'
    };

    return threatLevels[eventType] || 'medium';
  }

  /**
   * 위협 수준 상승
   */
  private escalateThreatLevel(currentLevel: 'low' | 'medium' | 'high' | 'critical'): 'low' | 'medium' | 'high' | 'critical' {
    const escalation: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'low': 'medium',
      'medium': 'high',
      'high': 'critical',
      'critical': 'critical'
    };

    return escalation[currentLevel];
  }

  /**
   * 디바이스 차단 결정
   */
  private shouldBlockDevice(threatLevel: 'low' | 'medium' | 'high' | 'critical', riskScore: number): boolean {
    if (threatLevel === 'critical') return true;
    if (threatLevel === 'high' && riskScore > 20) return true;
    if (riskScore > 50) return true;
    
    return false;
  }

  /**
   * 차단 액션 실행
   */
  private async executeBlockAction(deviceFingerprint: string, threatLevel: string, eventType: string): Promise<void> {
    try {
      // 차단 기간 결정
      let blockDuration = 0;
      switch (threatLevel) {
        case 'high':
          blockDuration = 24 * 60 * 60 * 1000; // 24시간
          break;
        case 'critical':
          blockDuration = 7 * 24 * 60 * 60 * 1000; // 7일
          break;
        default:
          blockDuration = 60 * 60 * 1000; // 1시간
      }

      await this.db.collection('blocked_devices').doc(deviceFingerprint).set({
        reason: `Threat level: ${threatLevel}, Event: ${eventType}`,
        blockedAt: admin.firestore.FieldValue.serverTimestamp(),
        blockUntil: Date.now() + blockDuration,
        threatLevel,
        permanentBlock: threatLevel === 'critical'
      });

      console.log(`🚫 Auto-blocked device: ${deviceFingerprint} (${threatLevel})`);
    } catch (error) {
      console.error('Execute block action error:', error);
    }
  }

  /**
   * 위협 분석 기록
   */
  private async recordThreatAnalysis(
    request: ThreatAnalysisRequest,
    threatLevel: string,
    actions: string[]
  ): Promise<void> {
    try {
      await this.db.collection('threat_analysis').add({
        ...request,
        threatLevel,
        actions,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Record threat analysis error:', error);
    }
  }

  /**
   * 심각한 위협 처리
   */
  async handleCriticalThreat(eventData: any): Promise<void> {
    try {
      console.log('🚨 Handling critical threat:', eventData);

      // 즉시 디바이스 영구 차단
      if (eventData.deviceFingerprint) {
        await this.db.collection('blocked_devices').doc(eventData.deviceFingerprint).set({
          reason: `Critical threat: ${eventData.eventType}`,
          blockedAt: admin.firestore.FieldValue.serverTimestamp(),
          permanentBlock: true,
          threatLevel: 'critical'
        });
      }

      // 관리자 알림 (실제로는 이메일, 슬랙 등)
      await this.db.collection('admin_alerts').add({
        type: 'critical_threat',
        data: eventData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        resolved: false
      });

      console.log('🚫 Critical threat handled with permanent block');
    } catch (error) {
      console.error('Handle critical threat error:', error);
    }
  }

  /**
   * 보안 메트릭 수집
   */
  async collectSecurityMetrics(eventData: any): Promise<void> {
    try {
      const today = new Date().toDateString();
      
      // 일일 메트릭 업데이트
      await this.db.collection('daily_security_metrics').doc(today).set({
        date: today,
        totalEvents: admin.firestore.FieldValue.increment(1),
        [`eventTypes.${eventData.eventType}`]: admin.firestore.FieldValue.increment(1),
        [`severityLevels.${eventData.severity}`]: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error('Collect security metrics error:', error);
    }
  }

  /**
   * 보안 통계 조회
   */
  async getSecurityStatistics(): Promise<SecurityStatistics> {
    try {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

      // 최근 7일간 이벤트 조회
      const eventsQuery = await this.db
        .collection('security_events')
        .where('timestamp', '>', sevenDaysAgo)
        .get();

      // 차단된 디바이스 수 조회
      const blockedDevicesQuery = await this.db
        .collection('blocked_devices')
        .get();

      // 통계 계산
      const threatsByLevel: Record<string, number> = {
        low: 0, medium: 0, high: 0, critical: 0
      };
      const eventTypeCounts: Record<string, number> = {};
      const dailyStats: Record<string, number> = {};

      eventsQuery.docs.forEach(doc => {
        const data = doc.data();
        threatsByLevel[data.severity]++;
        eventTypeCounts[data.eventType] = (eventTypeCounts[data.eventType] || 0) + 1;
        
        const date = new Date(data.timestamp).toDateString();
        dailyStats[date] = (dailyStats[date] || 0) + 1;
      });

      const topThreats = Object.entries(eventTypeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([type, count]) => ({ type, count }));

      return {
        totalEvents: eventsQuery.size,
        threatsByLevel,
        blockedDevices: blockedDevicesQuery.size,
        topThreats,
        dailyStats
      };

    } catch (error) {
      console.error('Get security statistics error:', error);
      return {
        totalEvents: 0,
        threatsByLevel: { low: 0, medium: 0, high: 0, critical: 0 },
        blockedDevices: 0,
        topThreats: [],
        dailyStats: {}
      };
    }
  }

  /**
   * 의심스러운 디바이스 자동 차단
   */
  async autoBlockSuspiciousDevices(): Promise<void> {
    try {
      console.log('🔍 Running auto-block for suspicious devices...');

      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      // 최근 1시간 내 고위험 이벤트가 많은 디바이스 찾기
      const suspiciousEvents = await this.db
        .collection('security_events')
        .where('timestamp', '>', oneHourAgo)
        .where('severity', 'in', ['high', 'critical'])
        .get();

      const deviceRiskScores: Record<string, number> = {};
      
      suspiciousEvents.docs.forEach(doc => {
        const data = doc.data();
        const device = data.deviceFingerprint;
        const score = data.severity === 'critical' ? 10 : 5;
        deviceRiskScores[device] = (deviceRiskScores[device] || 0) + score;
      });

      // 위험 점수가 20 이상인 디바이스 차단
      const devicesToBlock = Object.entries(deviceRiskScores)
        .filter(([, score]) => score >= 20)
        .map(([device]) => device);

      for (const device of devicesToBlock) {
        await this.db.collection('blocked_devices').doc(device).set({
          reason: 'Auto-blocked for suspicious activity',
          blockedAt: admin.firestore.FieldValue.serverTimestamp(),
          blockUntil: Date.now() + (24 * 60 * 60 * 1000), // 24시간
          autoBlocked: true,
          riskScore: deviceRiskScores[device]
        });
      }

      console.log(`🚫 Auto-blocked ${devicesToBlock.length} suspicious devices`);
    } catch (error) {
      console.error('Auto-block suspicious devices error:', error);
    }
  }

  /**
   * 일일 보안 리포트 생성
   */
  async generateDailySecurityReport(): Promise<void> {
    try {
      console.log('📊 Generating daily security report...');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      const stats = await this.getSecurityStatistics();
      
      const report = {
        date: yesterdayStr,
        summary: {
          totalEvents: stats.dailyStats[yesterdayStr] || 0,
          newThreats: stats.topThreats.slice(0, 5),
          blockedDevices: stats.blockedDevices,
          threatDistribution: stats.threatsByLevel
        },
        recommendations: this.generateSecurityRecommendations(stats),
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await this.db.collection('security_reports').doc(yesterdayStr).set(report);
      
      console.log('📊 Daily security report generated');
    } catch (error) {
      console.error('Generate daily security report error:', error);
    }
  }

  /**
   * 보안 권장사항 생성
   */
  private generateSecurityRecommendations(stats: SecurityStatistics): string[] {
    const recommendations: string[] = [];

    if (stats.threatsByLevel.critical > 10) {
      recommendations.push('Critical threats detected - Review security measures');
    }

    if (stats.blockedDevices > 100) {
      recommendations.push('High number of blocked devices - Consider threat patterns');
    }

    const topThreat = stats.topThreats[0];
    if (topThreat && topThreat.count > 50) {
      recommendations.push(`Top threat "${topThreat.type}" needs attention`);
    }

    return recommendations;
  }
}

export const analyticsService = new AnalyticsService();
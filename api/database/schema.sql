-- 구독 시스템 데이터베이스 스키마

-- 사용자 테이블 (기존 users 테이블에 구독 관련 컬럼 추가)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;

-- 구독 테이블
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  platform VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  cancelled_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 구독 이력 테이블
CREATE TABLE IF NOT EXISTS subscription_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 구독 플랜 테이블
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 구독 플랜 데이터 삽입
INSERT INTO subscription_plans (plan_id, name, description, price, currency, duration_days, features) VALUES
('starter', 'Starter Plan', 'Basic features with limited tokens', 1.99, 'USD', 30, '{"tokens": 100, "ads": true, "ai_agents": false}'),
('premium', 'Premium Plan', 'Enhanced features with more tokens', 3.99, 'USD', 30, '{"tokens": 200, "ads": false, "ai_agents": false}'),
('pro', 'Pro Plan', 'Full features with unlimited tokens', 9.99, 'USD', 30, '{"tokens": -1, "ads": false, "ai_agents": true}');

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

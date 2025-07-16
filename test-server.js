// 서버 API 테스트 스크립트
const API_URL = 'https://posty-server-hhk3b5y9s-ethan-chois-projects.vercel.app/api';

// 1. Health check
fetch(`${API_URL}/health`)
  .then(res => res.json())
  .then(data => console.log('Health check:', data))
  .catch(err => console.error('Health check error:', err));

// 2. Generate test (텍스트만)
fetch(`${API_URL}/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer posty-secret-key-change-this-in-production',
    'User-Agent': 'Posty-Test/1.0.0'
  },
  body: JSON.stringify({
    prompt: '오늘의 날씨에 대한 짧은 글',
    tone: 'casual',
    platform: 'instagram',
    length: 'short'
  })
})
  .then(res => {
    console.log('Generate status:', res.status);
    return res.text();
  })
  .then(text => {
    console.log('Generate response:', text);
    try {
      const data = JSON.parse(text);
      console.log('Parsed data:', data);
    } catch (e) {
      console.log('Not JSON:', text.substring(0, 200));
    }
  })
  .catch(err => console.error('Generate error:', err));

// 3. Generate test (작은 이미지)
const smallImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

setTimeout(() => {
  fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer posty-secret-key-change-this-in-production',
      'User-Agent': 'Posty-Test/1.0.0'
    },
    body: JSON.stringify({
      prompt: '이미지 테스트',
      image: smallImage,
      tone: 'casual',
      platform: 'instagram',
      length: 'short'
    })
  })
    .then(res => {
      console.log('Image test status:', res.status);
      return res.text();
    })
    .then(text => {
      console.log('Image test response:', text.substring(0, 200));
    })
    .catch(err => console.error('Image test error:', err));
}, 2000);

#!/usr/bin/env node

// Node.js 스크립트로 앱 아이콘 생성
// 이 스크립트는 Canvas API를 사용해서 앱 아이콘을 생성합니다.

const fs = require('fs');
const path = require('path');

// SVG 기반 앱 아이콘 템플릿 생성
function generateAppIconSVG(size) {
  const borderRadius = Math.max(6, size * 0.18); // 최소 6px, 또는 사이즈의 18%
  const fontSize = size * 0.5;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9333EA;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="${size * 0.08}" stdDeviation="${size * 0.16}" flood-color="#7C3AED" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${borderRadius}" ry="${borderRadius}" fill="url(#grad)" filter="url(#shadow)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="white" letter-spacing="-${fontSize * 0.04}">P</text>
</svg>`;
}

// Contents.json 업데이트
function updateContentsJson() {
  const contentsPath = path.join(__dirname, 'ios/Posty/Images.xcassets/AppIcon.appiconset/Contents.json');
  
  const contents = {
    "images": [
      {
        "filename": "icon-20x20@2x.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "20x20"
      },
      {
        "filename": "icon-20x20@3x.png", 
        "idiom": "iphone",
        "scale": "3x",
        "size": "20x20"
      },
      {
        "filename": "icon-29x29@2x.png",
        "idiom": "iphone", 
        "scale": "2x",
        "size": "29x29"
      },
      {
        "filename": "icon-29x29@3x.png",
        "idiom": "iphone",
        "scale": "3x", 
        "size": "29x29"
      },
      {
        "filename": "icon-40x40@2x.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "40x40"
      },
      {
        "filename": "icon-40x40@3x.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "40x40"
      },
      {
        "filename": "icon-60x60@2x.png",
        "idiom": "iphone",
        "scale": "2x", 
        "size": "60x60"
      },
      {
        "filename": "icon-60x60@3x.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "60x60"
      },
      {
        "filename": "icon-1024x1024.png",
        "idiom": "ios-marketing",
        "scale": "1x",
        "size": "1024x1024"
      }
    ],
    "info": {
      "author": "xcode",
      "version": 1
    }
  };
  
  fs.writeFileSync(contentsPath, JSON.stringify(contents, null, 2));
  console.log('✅ Contents.json 업데이트 완료');
}

// SVG 파일들 생성
function generateSVGIcons() {
  const iconSizes = [
    { filename: 'icon-20x20@2x', size: 40 },
    { filename: 'icon-20x20@3x', size: 60 },
    { filename: 'icon-29x29@2x', size: 58 },
    { filename: 'icon-29x29@3x', size: 87 },
    { filename: 'icon-40x40@2x', size: 80 },
    { filename: 'icon-40x40@3x', size: 120 },
    { filename: 'icon-60x60@2x', size: 120 },
    { filename: 'icon-60x60@3x', size: 180 },
    { filename: 'icon-1024x1024', size: 1024 }
  ];
  
  const outputDir = path.join(__dirname, 'ios/Posty/Images.xcassets/AppIcon.appiconset');
  
  iconSizes.forEach(({ filename, size }) => {
    const svgContent = generateAppIconSVG(size);
    const svgPath = path.join(outputDir, `${filename}.svg`);
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ 생성 완료: ${filename}.svg (${size}x${size})`);
  });
}

// 메인 실행
function main() {
  try {
    console.log('🎨 Posty 앱 아이콘 생성 시작...');
    
    // 디렉토리 확인
    const outputDir = path.join(__dirname, 'ios/Posty/Images.xcassets/AppIcon.appiconset');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // SVG 아이콘들 생성
    generateSVGIcons();
    
    // Contents.json 업데이트
    updateContentsJson();
    
    console.log('');
    console.log('🎉 앱 아이콘 생성 완료!');
    console.log('');
    console.log('📝 다음 단계:');
    console.log('1. SVG를 PNG로 변환 (온라인 도구 또는 디자인 소프트웨어 사용)');
    console.log('2. 각 SVG 파일을 같은 이름의 PNG 파일로 저장');
    console.log('3. Xcode에서 프로젝트 열고 아이콘 확인');
    console.log('');
    console.log('🎨 디자인 정보:');
    console.log('- 색상: 보라색 그라디언트 (#7C3AED → #9333EA)');
    console.log('- 글자: 흰색 "P" (Arial 폰트, 굵기 800)');
    console.log('- 모양: 둥근 모서리 사각형');
    console.log('- 효과: 보라색 그림자');
    
  } catch (error) {
    console.error('❌ 아이콘 생성 실패:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateAppIconSVG, updateContentsJson };
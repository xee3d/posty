#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG를 PNG로 변환하는 함수
async function convertSVGtoPNG(svgPath, pngPath, size) {
  try {
    await sharp(svgPath, { density: 300 })
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 0 })
      .toFile(pngPath);
    
    console.log(`✅ 변환 완료: ${path.basename(pngPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ 변환 실패: ${path.basename(svgPath)}`, error.message);
  }
}

// 모든 아이콘 변환
async function convertAllIcons() {
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
  
  const baseDir = path.join(__dirname, 'ios/Posty/Images.xcassets/AppIcon.appiconset');
  
  console.log('🎨 SVG를 PNG로 변환 시작...');
  console.log('');
  
  for (const { filename, size } of iconSizes) {
    const svgPath = path.join(baseDir, `${filename}.svg`);
    const pngPath = path.join(baseDir, `${filename}.png`);
    
    if (fs.existsSync(svgPath)) {
      await convertSVGtoPNG(svgPath, pngPath, size);
    } else {
      console.error(`❌ SVG 파일이 없습니다: ${svgPath}`);
    }
  }
  
  console.log('');
  console.log('🎉 모든 아이콘 변환 완료!');
  console.log('');
  console.log('📱 생성된 파일들:');
  
  // 생성된 PNG 파일들 확인
  iconSizes.forEach(({ filename, size }) => {
    const pngPath = path.join(baseDir, `${filename}.png`);
    if (fs.existsSync(pngPath)) {
      const stats = fs.statSync(pngPath);
      console.log(`   ✅ ${filename}.png (${size}x${size}) - ${(stats.size / 1024).toFixed(1)}KB`);
    }
  });
  
  console.log('');
  console.log('🔧 다음 단계:');
  console.log('1. Xcode에서 프로젝트 열기');
  console.log('2. Images.xcassets > AppIcon 확인');
  console.log('3. iOS 시뮬레이터 빌드하여 아이콘 확인');
}

// 실행
if (require.main === module) {
  convertAllIcons().catch(console.error);
}

module.exports = { convertSVGtoPNG };
#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// RGB 형식으로 고품질 PNG 생성
async function convertToRGB(svgPath, pngPath, size) {
  try {
    await sharp(svgPath, { density: 300 })
      .resize(size, size, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill'
      })
      .png({ 
        quality: 100, 
        compressionLevel: 0,
        palette: false, // RGB 모드 강제
        colours: 16777216, // 24-bit RGB
        effort: 10 // 최고 품질
      })
      .toColourspace('srgb')
      .toFile(pngPath);
    
    console.log(`✅ RGB 변환 완료: ${path.basename(pngPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ 변환 실패: ${path.basename(svgPath)}`, error.message);
  }
}

// 모든 아이콘을 RGB 형식으로 재변환
async function fixAllIcons() {
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
  
  console.log('🔧 아이콘을 RGB 형식으로 재변환 중...');
  console.log('');
  
  for (const { filename, size } of iconSizes) {
    const svgPath = path.join(baseDir, `${filename}.svg`);
    const pngPath = path.join(baseDir, `${filename}.png`);
    
    if (fs.existsSync(svgPath)) {
      await convertToRGB(svgPath, pngPath, size);
    } else {
      console.error(`❌ SVG 파일이 없습니다: ${svgPath}`);
    }
  }
  
  console.log('');
  console.log('🎉 RGB 형식 변환 완료!');
  console.log('');
  console.log('📱 Xcode에서 확인:');
  console.log('1. Xcode를 완전히 종료');
  console.log('2. Xcode 재시작');
  console.log('3. Product > Clean Build Folder');
  console.log('4. Images.xcassets > AppIcon 확인');
  
  // 파일 정보 확인
  console.log('');
  console.log('📊 변환된 파일 정보:');
  for (const { filename, size } of iconSizes) {
    const pngPath = path.join(baseDir, `${filename}.png`);
    if (fs.existsSync(pngPath)) {
      const stats = fs.statSync(pngPath);
      console.log(`   ✅ ${filename}.png (${size}x${size}) - ${(stats.size / 1024).toFixed(1)}KB`);
    }
  }
}

// 실행
if (require.main === module) {
  fixAllIcons().catch(console.error);
}
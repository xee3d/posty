#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 간단한 RGB 변환
async function convertToRGB(svgPath, pngPath, size) {
  try {
    await sharp(svgPath, { density: 300 })
      .resize(size, size)
      .png({ 
        compressionLevel: 0,
        palette: false, // 팔레트 모드 비활성화
        force: true
      })
      .toFile(pngPath);
    
    console.log(`✅ RGB 변환 완료: ${path.basename(pngPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ 변환 실패: ${path.basename(svgPath)}`, error.message);
  }
}

// 모든 아이콘을 RGB 형식으로 재변환
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
  
  console.log('🔧 아이콘을 RGB 형식으로 재변환...');
  console.log('');
  
  for (const { filename, size } of iconSizes) {
    const svgPath = path.join(baseDir, `${filename}.svg`);
    const pngPath = path.join(baseDir, `${filename}.png`);
    
    if (fs.existsSync(svgPath)) {
      await convertToRGB(svgPath, pngPath, size);
    }
  }
  
  console.log('');
  console.log('🎉 변환 완료!');
}

// 실행
if (require.main === module) {
  convertAllIcons().catch(console.error);
}
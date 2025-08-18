const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// 보라색 배경 색상
const PURPLE_BACKGROUND = '#8B5CF6';

// iOS 아이콘 크기 정의
const iOS_SIZES = {
  'icon-20x20@2x.png': 40,
  'icon-20x20@3x.png': 60,
  'icon-29x29@2x.png': 58,
  'icon-29x29@3x.png': 87,
  'icon-40x40@2x.png': 80,
  'icon-40x40@3x.png': 120,
  'icon-60x60@2x.png': 120,
  'icon-60x60@3x.png': 180,
  'icon-1024x1024.png': 1024
};

// Android 아이콘 크기 정의
const ANDROID_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

async function addPurpleBackground(inputPath, outputPath, size) {
  try {
    // 원본 이미지 로드
    const originalImage = await loadImage(inputPath);
    
    // 캔버스 생성
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // 보라색 배경 그리기
    ctx.fillStyle = PURPLE_BACKGROUND;
    ctx.fillRect(0, 0, size, size);
    
    // 원본 이미지를 중앙에 그리기
    const scale = Math.min(size / originalImage.width, size / originalImage.height);
    const scaledWidth = originalImage.width * scale;
    const scaledHeight = originalImage.height * scale;
    const x = (size - scaledWidth) / 2;
    const y = (size - scaledHeight) / 2;
    
    ctx.drawImage(originalImage, x, y, scaledWidth, scaledHeight);
    
    // 결과 저장
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Generated: ${outputPath} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
  }
}

async function generateiOSIcons() {
  console.log('🎨 Generating iOS icons with purple background...');
  
  const iosIconDir = path.join(__dirname, '..', 'ios', 'Posty', 'Images.xcassets', 'AppIcon.appiconset');
  
  for (const [filename, size] of Object.entries(iOS_SIZES)) {
    const inputPath = path.join(iosIconDir, filename);
    const outputPath = path.join(iosIconDir, filename);
    
    if (fs.existsSync(inputPath)) {
      await addPurpleBackground(inputPath, outputPath, size);
    } else {
      console.log(`⚠️  Skipping ${filename} - file not found`);
    }
  }
}

async function generateAndroidIcons() {
  console.log('🎨 Generating Android icons with purple background...');
  
  // 기본 아이콘 이미지 경로 (투명 배경)
  const baseIconPath = path.join(__dirname, '..', 'src', 'assets', 'icons', 'logo_medium.png');
  
  if (!fs.existsSync(baseIconPath)) {
    console.log('⚠️  Base icon not found, creating simple purple icon...');
    // 기본 아이콘이 없으면 간단한 보라색 아이콘 생성
    for (const [folder, size] of Object.entries(ANDROID_SIZES)) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // 보라색 배경
      ctx.fillStyle = PURPLE_BACKGROUND;
      ctx.fillRect(0, 0, size, size);
      
      // 흰색 P 문자
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${size * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', size / 2, size / 2);
      
      const folderPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      
      const outputPath = path.join(folderPath, 'ic_launcher.png');
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✅ Generated: ${folder}/ic_launcher.png (${size}x${size})`);
    }
  } else {
    // 기본 아이콘이 있으면 보라색 배경 추가
    for (const [folder, size] of Object.entries(ANDROID_SIZES)) {
      const folderPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      
      const outputPath = path.join(folderPath, 'ic_launcher.png');
      await addPurpleBackground(baseIconPath, outputPath, size);
    }
  }
}

async function main() {
  try {
    await generateiOSIcons();
    await generateAndroidIcons();
    console.log('🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

main();

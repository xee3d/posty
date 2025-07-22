const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '../images/posty_icon.png');

// Android 아이콘 크기
const androidSizes = [
  { size: 48, folder: 'mipmap-mdpi', name: 'ic_launcher.png' },
  { size: 72, folder: 'mipmap-hdpi', name: 'ic_launcher.png' },
  { size: 96, folder: 'mipmap-xhdpi', name: 'ic_launcher.png' },
  { size: 144, folder: 'mipmap-xxhdpi', name: 'ic_launcher.png' },
  { size: 192, folder: 'mipmap-xxxhdpi', name: 'ic_launcher.png' },
  // Round icons
  { size: 48, folder: 'mipmap-mdpi', name: 'ic_launcher_round.png' },
  { size: 72, folder: 'mipmap-hdpi', name: 'ic_launcher_round.png' },
  { size: 96, folder: 'mipmap-xhdpi', name: 'ic_launcher_round.png' },
  { size: 144, folder: 'mipmap-xxhdpi', name: 'ic_launcher_round.png' },
  { size: 192, folder: 'mipmap-xxxhdpi', name: 'ic_launcher_round.png' },
];

// iOS 아이콘 크기
const iosSizes = [
  { size: 20, scale: 2, idiom: 'iphone', filename: 'Icon-App-20x20@2x.png' },
  { size: 20, scale: 3, idiom: 'iphone', filename: 'Icon-App-20x20@3x.png' },
  { size: 29, scale: 2, idiom: 'iphone', filename: 'Icon-App-29x29@2x.png' },
  { size: 29, scale: 3, idiom: 'iphone', filename: 'Icon-App-29x29@3x.png' },
  { size: 40, scale: 2, idiom: 'iphone', filename: 'Icon-App-40x40@2x.png' },
  { size: 40, scale: 3, idiom: 'iphone', filename: 'Icon-App-40x40@3x.png' },
  { size: 60, scale: 2, idiom: 'iphone', filename: 'Icon-App-60x60@2x.png' },
  { size: 60, scale: 3, idiom: 'iphone', filename: 'Icon-App-60x60@3x.png' },
  { size: 1024, scale: 1, idiom: 'ios-marketing', filename: 'Icon-App-1024x1024.png' },
];

async function generateIcons() {
  console.log('🎨 Generating app icons...');

  // Android 아이콘 생성
  console.log('\n📱 Generating Android icons...');
  for (const config of androidSizes) {
    const outputPath = path.join(__dirname, `../android/app/src/main/res/${config.folder}/${config.name}`);
    
    try {
      await sharp(sourceIcon)
        .resize(config.size, config.size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${config.folder}/${config.name} (${config.size}x${config.size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${config.folder}/${config.name}:`, error.message);
    }
  }

  // iOS 아이콘은 수동으로 처리해야 합니다
  console.log('\n🍎 iOS icons need to be generated manually using Xcode or an online tool.');
  console.log('Recommended tool: https://appicon.co/');
  
  console.log('\n✨ Android icon generation complete!');
}

// sharp 모듈이 없는 경우를 위한 대체 방법
async function checkDependencies() {
  try {
    require.resolve('sharp');
    return true;
  } catch (e) {
    console.log('⚠️  Sharp module not found. Installing...');
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      exec('npm install sharp', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Failed to install sharp:', error);
          console.log('\n📝 Manual instructions:');
          console.log('1. Run: npm install sharp');
          console.log('2. Then run this script again');
          resolve(false);
        } else {
          console.log('✅ Sharp installed successfully');
          resolve(true);
        }
      });
    });
  }
}

// 메인 실행
(async () => {
  const hasDependencies = await checkDependencies();
  if (hasDependencies) {
    generateIcons();
  }
})();

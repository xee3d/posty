const fs = require("fs");
const path = require("path");

// Canvas를 사용하여 아이콘 생성
const { createCanvas } = require("canvas");

// 아이콘 크기 정의
const sizes = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

// 보라색 색상 정의
const purpleColor = "#8B5CF6"; // 보라색
const whiteColor = "#FFFFFF";

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // 배경을 보라색으로 설정
  ctx.fillStyle = purpleColor;
  ctx.fillRect(0, 0, size, size);

  // 둥근 모서리 효과 (간단한 방법)
  const radius = size * 0.2;
  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // P 문자 그리기
  ctx.fillStyle = whiteColor;
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", size / 2, size / 2);

  return canvas.toBuffer("image/png");
}

// 각 크기별로 아이콘 생성
Object.entries(sizes).forEach(([folder, size]) => {
  const iconBuffer = generateIcon(size);
  const folderPath = path.join(
    __dirname,
    "..",
    "android",
    "app",
    "src",
    "main",
    "res",
    folder
  );

  // 폴더가 없으면 생성
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // 아이콘 파일 저장
  const iconPath = path.join(folderPath, "ic_launcher.png");
  fs.writeFileSync(iconPath, iconBuffer);

  console.log(`✅ Generated ${folder}/ic_launcher.png (${size}x${size})`);
});

console.log("🎨 Android icons generated successfully!");

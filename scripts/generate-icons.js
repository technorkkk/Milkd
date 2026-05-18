const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

/**
 * Generate an SVG icon with dark green background, rounded corners, white "MD" text, and a milk drop
 */
function createIconSVG(size) {
  const padding = size * 0.08;
  const cornerRadius = size * 0.2;
  const fontSize = size * 0.38;
  const milkDropSize = size * 0.12;
  const milkDropX = size * 0.72;
  const milkDropY = size * 0.28;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16A34A;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#15803D;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="${size * 0.01}" stdDeviation="${size * 0.02}" flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <linearGradient id="dropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.95" />
      <stop offset="100%" style="stop-color:#DCFCE7;stop-opacity:0.9" />
    </linearGradient>
    <linearGradient id="dropShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0" />
    </linearGradient>
  </defs>
  <!-- Rounded background -->
  <rect x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#bgGrad)" filter="url(#shadow)"/>
  <!-- Inner subtle border -->
  <rect x="${padding + size * 0.02}" y="${padding + size * 0.02}" width="${size - padding * 2 - size * 0.04}" height="${size - padding * 2 - size * 0.04}" rx="${cornerRadius - size * 0.02}" ry="${cornerRadius - size * 0.02}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="${size * 0.008}"/>
  <!-- MD Text -->
  <text x="${size * 0.48}" y="${size * 0.58}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle" letter-spacing="${size * 0.01}">MD</text>
  <!-- Milk drop -->
  <g transform="translate(${milkDropX}, ${milkDropY})">
    <!-- Drop shape -->
    <path d="M0 ${-milkDropSize * 0.8} Q${milkDropSize * 0.05} ${-milkDropSize * 0.5} ${milkDropSize * 0.5} ${milkDropSize * 0.2} Q${milkDropSize * 0.5} ${milkDropSize * 0.7} 0 ${milkDropSize * 0.8} Q${-milkDropSize * 0.5} ${milkDropSize * 0.7} ${-milkDropSize * 0.5} ${milkDropSize * 0.2} Q${-milkDropSize * 0.05} ${-milkDropSize * 0.5} 0 ${-milkDropSize * 0.8} Z" fill="url(#dropGrad)" stroke="rgba(255,255,255,0.3)" stroke-width="${size * 0.003}"/>
    <!-- Shine on drop -->
    <ellipse cx="${-milkDropSize * 0.15}" cy="${milkDropSize * 0.05}" rx="${milkDropSize * 0.12}" ry="${milkDropSize * 0.18}" fill="url(#dropShine)"/>
  </g>
</svg>`;
}

async function generateIcon(size, filename) {
  const svg = createIconSVG(size);
  const outputPath = path.join(ICONS_DIR, filename);
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`✓ Generated ${filename} (${size}x${size})`);
}

async function generateFavicon() {
  const svg = createIconSVG(64); // Generate at higher res for quality
  const outputPath = path.join(ICONS_DIR, 'favicon.ico');
  
  await sharp(Buffer.from(svg))
    .resize(32, 32)
    .png()
    .toFile(outputPath);
  
  console.log('✓ Generated favicon.ico (32x32)');
}

async function generateOGImage() {
  const width = 1200;
  const height = 630;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16A34A;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#15803D;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#14532D;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="ogDropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#DCFCE7;stop-opacity:0.85" />
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#ogBg)"/>
  <!-- Decorative circles -->
  <circle cx="950" cy="150" r="200" fill="rgba(255,255,255,0.04)"/>
  <circle cx="1050" cy="450" r="150" fill="rgba(255,255,255,0.03)"/>
  <circle cx="200" cy="500" r="120" fill="rgba(255,255,255,0.03)"/>
  <!-- Milk drop icon (large, decorative) -->
  <g transform="translate(820, 200)" filter="url(#glow)">
    <path d="M0 -60 Q5 -35 40 15 Q40 55 0 65 Q-40 55 -40 15 Q-5 -35 0 -60 Z" fill="url(#ogDropGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
    <ellipse cx="-12" cy="20" rx="10" ry="15" fill="rgba(255,255,255,0.4)"/>
  </g>
  <!-- Smaller decorative drops -->
  <g transform="translate(950, 320)" opacity="0.5">
    <path d="M0 -25 Q2 -15 16 6 Q16 22 0 26 Q-16 22 -16 6 Q-2 -15 0 -25 Z" fill="rgba(255,255,255,0.6)"/>
  </g>
  <g transform="translate(750, 350)" opacity="0.3">
    <path d="M0 -18 Q1 -10 12 4 Q12 16 0 19 Q-12 16 -12 4 Q-1 -10 0 -18 Z" fill="rgba(255,255,255,0.5)"/>
  </g>
  <!-- Title text -->
  <text x="100" y="300" font-family="Arial, Helvetica, sans-serif" font-size="96" font-weight="700" fill="white" letter-spacing="2">Milk Dairy</text>
  <!-- Subtitle -->
  <text x="102" y="370" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="400" fill="rgba(255,255,255,0.75)" letter-spacing="4">PREMIUM DAIRY MANAGEMENT</text>
  <!-- Decorative line -->
  <rect x="100" y="405" width="120" height="4" rx="2" fill="#22C55E"/>
  <!-- Bottom accent -->
  <rect x="0" y="${height - 8}" width="${width}" height="8" fill="#22C55E"/>
</svg>`;

  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
  
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(outputPath);
  
  console.log('✓ Generated og-image.png (1200x630)');
}

async function main() {
  console.log('Generating PWA icons and assets...\n');
  
  try {
    await generateIcon(192, 'icon-192x192.png');
    await generateIcon(512, 'icon-512x512.png');
    await generateIcon(180, 'apple-touch-icon.png');
    await generateFavicon();
    await generateOGImage();
    
    console.log('\n✅ All icons and assets generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();

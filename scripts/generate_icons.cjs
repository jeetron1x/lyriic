// scripts/generate_icons.cjs
// Generates valid PNG files for app icon and system tray using Node.js zlib
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, pixelFn) {
  // pixelFn(x, y) returns [r, g, b, a] in 0..255
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter byte: 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // Compression (deflate)
  ihdrData[11] = 0; // Filter (adaptive)
  ihdrData[12] = 0; // Interlace (none)

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    // Calculate CRC32
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Precomputed CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 1. Tray Icon: Sleek musical note / lyric soundwave in white/silver
const trayPng = createPng(32, 32, (x, y) => {
  const cx = 16, cy = 16;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Modern circular disc badge with musical sound waves
  // Bars at x = 8, 12, 16, 20, 24
  const bars = [
    { x: 9, h: 5 },
    { x: 13, h: 10 },
    { x: 17, h: 14 },
    { x: 21, h: 9 },
    { x: 25, h: 6 }
  ];

  for (const b of bars) {
    if (Math.abs(x - b.x) <= 1 && Math.abs(y - cy) <= b.h) {
      return [255, 255, 255, 240];
    }
  }

  if (dist < 15 && dist >= 13.5) {
    return [255, 255, 255, 120];
  }

  return [0, 0, 0, 0];
});

// 2. App Icon: 256x256 Sleek smoky glass icon with glowing audio waves & typography
const appIconPng = createPng(256, 256, (x, y) => {
  const cx = 128, cy = 128;
  const dx = x - cx, dy = y - cy;

  // Outer squircle / rounded rect (radius 72)
  const qx = Math.max(Math.abs(dx) - 68, 0);
  const qy = Math.max(Math.abs(dy) - 68, 0);
  const dSquircle = Math.sqrt(qx * qx + qy * qy);

  if (dSquircle > 48) {
    return [0, 0, 0, 0];
  }

  // Smoky gradient background
  const t = (x + y) / 512;
  const rBg = Math.round(18 + 24 * t);
  const gBg = Math.round(22 + 40 * t);
  const bBg = Math.round(38 + 90 * t);

  // Border glow
  if (dSquircle >= 44) {
    return [110, 150, 255, 220];
  }

  // Glowing lyric wave bars
  const bars = [
    { x: 76, h: 28, color: [100, 140, 255] },
    { x: 102, h: 52, color: [140, 180, 255] },
    { x: 128, h: 72, color: [255, 255, 255] },
    { x: 154, h: 48, color: [160, 140, 255] },
    { x: 180, h: 32, color: [120, 100, 255] }
  ];

  for (const b of bars) {
    if (Math.abs(x - b.x) <= 6 && Math.abs(y - cy) <= b.h) {
      return [...b.color, 255];
    }
  }

  return [rBg, gBg, bBg, 250];
});

const assetsDir = path.join(__dirname, '..', 'src', 'renderer', 'assets');
fs.writeFileSync(path.join(assetsDir, 'tray-icon.png'), trayPng);
fs.writeFileSync(path.join(assetsDir, 'app-icon.png'), appIconPng);
console.log('✓ Tray and App PNG icons generated successfully');

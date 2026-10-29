// scripts/generate_ico.cjs
// Wraps a valid PNG into a valid Windows ICO file
const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '../src/renderer/assets/app-icon.png');
const icoPath = path.join(__dirname, '../src/renderer/assets/app-icon.ico');

const pngBuffer = fs.readFileSync(pngPath);

// ICONDIR header (6 bytes)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // Type 1 = ICO
header.writeUInt16LE(1, 4); // 1 image

// ICONDIRENTRY (16 bytes)
const entry = Buffer.alloc(16);
entry.writeUInt8(0, 0);   // Width 256 (0 = 256 in ICO format)
entry.writeUInt8(0, 1);   // Height 256 (0 = 256 in ICO format)
entry.writeUInt8(0, 2);   // Color palette
entry.writeUInt8(0, 3);   // Reserved
entry.writeUInt16LE(1, 4); // Color planes
entry.writeUInt16LE(32, 6); // Bits per pixel
entry.writeUInt32LE(pngBuffer.length, 8); // Image size in bytes
entry.writeUInt32LE(22, 12); // Image data offset (6 + 16 = 22)

const icoBuffer = Buffer.concat([header, entry, pngBuffer]);
fs.writeFileSync(icoPath, icoBuffer);
console.log('✓ Created app-icon.ico successfully:', icoBuffer.length, 'bytes');

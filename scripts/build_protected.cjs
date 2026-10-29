// scripts/build_protected.cjs
// Advanced Security & Obfuscation Build Pipeline for Lyriic
// Encrypts string arrays, flattens control flow, mangles identifiers, and seals inside ASAR
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const stagingDir = path.join(rootDir, 'dist-obfuscated');

console.log('🔒 [1/4] Preparing secure staging directory...');
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// Copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(srcDir, path.join(stagingDir, 'src'));

// Copy package.json
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
// Create production package.json for staging
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  main: pkg.main,
  author: "jeetron1x",
  license: pkg.license,
  dependencies: pkg.dependencies || {}
};
fs.writeFileSync(path.join(stagingDir, 'package.json'), JSON.stringify(prodPkg, null, 2));

console.log('🛡️ [2/4] Applying heavy JavaScript obfuscation & string encryption...');

const jsFiles = [
  'src/main/main.cjs',
  'src/preload/preload.cjs',
  'src/renderer/js/app.js',
  'src/renderer/js/audio-player.js',
  'src/renderer/js/lyrics-engine.js',
  'src/renderer/js/storage.js'
];

jsFiles.forEach(relPath => {
  const filePath = path.join(stagingDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.warn('File not found to obfuscate:', relPath);
    return;
  }
  const code = fs.readFileSync(filePath, 'utf8');
  const isCjs = relPath.endsWith('.cjs');

  try {
    const result = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: false,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.85,
      splitStrings: true,
      splitStringsChunkLength: 12,
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: false,
      selfDefending: false,
      target: isCjs ? 'node' : 'browser'
    });

    fs.writeFileSync(filePath, result.getObfuscatedCode());
    console.log(`  ✓ Protected & Obfuscated: ${relPath}`);
  } catch (err) {
    console.error(`  ✗ Obfuscation failed for ${relPath}:`, err.message);
  }
});

// Also create a junction or copy node_modules into stagingDir
const nodeModulesSrc = path.join(rootDir, 'node_modules');
const nodeModulesDest = path.join(stagingDir, 'node_modules');
if (fs.existsSync(nodeModulesSrc)) {
  try {
    fs.symlinkSync(nodeModulesSrc, nodeModulesDest, 'junction');
    console.log('  ✓ Linked node_modules to staging');
  } catch (e) {
    console.log('  Notice: node_modules symlink:', e.message);
  }
}

console.log('📦 [3/4] Packaging protected app into ASAR distribution...');

// Stop any running Lyriic processes first
try {
  execSync('powershell -Command "Stop-Process -Name Lyriic,electron -Force -ErrorAction SilentlyContinue"');
} catch {}

const outDir = path.join(rootDir, 'dist');
const packagerCmd = `npx electron-packager "${stagingDir}" Lyriic --platform=win32 --arch=x64 --out="${outDir}" --overwrite --icon="src/renderer/assets/app-icon.ico" --asar --win32metadata.CompanyName="Jeetron1x" --win32metadata.FileDescription="Lyriic Music Player" --win32metadata.OriginalFilename="Lyriic.exe" --win32metadata.ProductName="Lyriic" --win32metadata.InternalName="Lyriic" --win32metadata.LegalCopyright="Copyright (C) 2026 Jeetron1x"`;

console.log('  Running packager...');
execSync(packagerCmd, { stdio: 'inherit', cwd: rootDir });

console.log('🚀 [4/4] Building standalone Windows Installer (NSIS)...');
const builderCmd = `npx electron-builder --win nsis --prepackaged "${path.join(outDir, 'Lyriic-win32-x64')}"`;
execSync(builderCmd, { stdio: 'inherit', cwd: rootDir });

console.log('\n🎉 ALL DONE! Protected build & standalone installer successfully created!');
console.log('Executable: dist\\Lyriic-win32-x64\\Lyriic.exe');
console.log('Installer:  dist-installer\\Lyriic-Setup-1.0.0.exe');

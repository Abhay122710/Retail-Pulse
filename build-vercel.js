const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Unified Build] Starting unified build for Vercel/Production deployment...');

function runCommand(cmd, cwd) {
  console.log(`\n> ${cmd} (in ${cwd || '.'})`);
  execSync(cmd, { cwd: cwd ? path.resolve(__dirname, cwd) : __dirname, stdio: 'inherit' });
}

// 1. Build RetailPulse
console.log('\n[1/3] Building RetailPulse BI Dashboard...');
runCommand('npm run build', 'RetailPulse');

// 2. Build ShopPulse (Site1)
console.log('\n[2/3] Building ShopPulse Storefront (Site1)...');
runCommand('npm run build', 'Site1');

// 3. Build TechMart (TechMart)
console.log('\n[3/3] Building TechMart Storefront (TechMart)...');
runCommand('npm run build', 'TechMart');

const rootDist = path.join(__dirname, 'dist');
if (fs.existsSync(rootDist)) {
  fs.rmSync(rootDist, { recursive: true, force: true });
}
fs.mkdirSync(rootDist, { recursive: true });

console.log('\n[Packaging] Assembling unified distribution into root dist/...');
// Copy RetailPulse into root of dist
fs.cpSync(path.join(__dirname, 'RetailPulse', 'dist'), rootDist, { recursive: true });

// Copy ShopPulse into dist/shoppulse
const shoppulseDist = path.join(rootDist, 'shoppulse');
fs.mkdirSync(shoppulseDist, { recursive: true });
fs.cpSync(path.join(__dirname, 'Site1', 'dist'), shoppulseDist, { recursive: true });

// Copy TechMart into dist/techmart
const techmartDist = path.join(rootDist, 'techmart');
fs.mkdirSync(techmartDist, { recursive: true });
fs.cpSync(path.join(__dirname, 'TechMart', 'dist'), techmartDist, { recursive: true });

console.log('\n[Unified Build] Successfully generated unified production package in dist/:');
console.log('  /           -> RetailPulse Dashboard');
console.log('  /shoppulse/ -> ShopPulse Storefront');
console.log('  /techmart/  -> TechMart Storefront');

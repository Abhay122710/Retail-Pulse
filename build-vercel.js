const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Unified Build] Starting unified build for Vercel/Production deployment...');

function runCommand(cmd, cwd) {
  console.log(`\n> ${cmd} (in ${cwd || '.'})`);
  execSync(cmd, { cwd: cwd ? path.resolve(__dirname, cwd) : __dirname, stdio: 'inherit' });
}

// 1. Build ShopPulse (Site1)
console.log('\n[1/3] Building ShopPulse Storefront (Site1)...');
runCommand('npm run build', 'Site1');
const shoppulsePub = path.join(__dirname, 'RetailPulse', 'public', 'shoppulse');
if (fs.existsSync(shoppulsePub)) fs.rmSync(shoppulsePub, { recursive: true, force: true });
fs.mkdirSync(shoppulsePub, { recursive: true });
fs.cpSync(path.join(__dirname, 'Site1', 'dist'), shoppulsePub, { recursive: true });

// 2. Build TechMart (TechMart)
console.log('\n[2/3] Building TechMart Storefront (TechMart)...');
runCommand('npm run build', 'TechMart');
const techmartPub = path.join(__dirname, 'RetailPulse', 'public', 'techmart');
if (fs.existsSync(techmartPub)) fs.rmSync(techmartPub, { recursive: true, force: true });
fs.mkdirSync(techmartPub, { recursive: true });
fs.cpSync(path.join(__dirname, 'TechMart', 'dist'), techmartPub, { recursive: true });

// 3. Build RetailPulse BI Dashboard (bundles public/shoppulse and public/techmart)
console.log('\n[3/3] Building RetailPulse BI Dashboard...');
runCommand('npm run build', 'RetailPulse');

// 4. Assemble root dist/ for unified deployments
const rootDist = path.join(__dirname, 'dist');
if (fs.existsSync(rootDist)) {
  fs.rmSync(rootDist, { recursive: true, force: true });
}
fs.mkdirSync(rootDist, { recursive: true });

console.log('\n[Packaging] Assembling unified distribution into root dist/...');
fs.cpSync(path.join(__dirname, 'RetailPulse', 'dist'), rootDist, { recursive: true });

console.log('\n[Unified Build] Successfully generated unified production package:');
console.log('  /           -> RetailPulse Dashboard');
console.log('  /shoppulse/ -> ShopPulse Storefront');
console.log('  /techmart/  -> TechMart Storefront');

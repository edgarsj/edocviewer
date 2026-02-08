#!/usr/bin/env node

import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'dist');

console.log('Validating generated pages...');
console.log(`Checking dist directory: ${distDir}\n`);

// Expected pages to be generated
const expectedPages = [
  // English pages
  { path: 'index.html', description: 'English main page' },
  { path: 'open-edoc-file/index.html', description: 'English open-edoc-file page' },
  { path: 'asice-reader/index.html', description: 'English asice-reader page' },
  { path: 'what-is-edoc/index.html', description: 'English what-is-edoc page' },
  { path: 'compare-viewers/index.html', description: 'English compare-viewers page' },

  // Latvian pages
  { path: 'lv/index.html', description: 'Latvian main page' },
  { path: 'lv/atvert-edoc-failu/index.html', description: 'Latvian atvert-edoc-failu page' },
  { path: 'lv/asice-lasitajs/index.html', description: 'Latvian asice-lasitajs page' },
  { path: 'lv/kas-ir-edoc/index.html', description: 'Latvian kas-ir-edoc page' },
  { path: 'lv/salidzinat-skatitajus/index.html', description: 'Latvian salidzinat-skatitajus page' },
];

let allValid = true;
let successCount = 0;

// Check each expected page
expectedPages.forEach(({ path, description }) => {
  const fullPath = join(distDir, path);
  const exists = existsSync(fullPath);

  if (exists) {
    console.log(`✓ ${description} (${path})`);
    successCount++;
  } else {
    console.error(`✗ MISSING: ${description} (${path})`);
    allValid = false;
  }
});

console.log(`\n${successCount}/${expectedPages.length} pages validated`);

// Exit with error if any pages are missing
if (!allValid) {
  console.error('\n❌ Validation failed: Some pages are missing!');
  process.exit(1);
}

console.log('\n✅ All pages validated successfully!');
process.exit(0);

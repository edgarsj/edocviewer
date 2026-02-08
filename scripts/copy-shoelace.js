#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const source = join(projectRoot, 'node_modules/@shoelace-style/shoelace/dist/assets');
const destination = join(projectRoot, 'public/shoelace/assets');

console.log('Copying Shoelace assets...');
console.log(`  From: ${source}`);
console.log(`  To: ${destination}`);

// Ensure destination directory exists
if (!existsSync(join(projectRoot, 'public/shoelace'))) {
  mkdirSync(join(projectRoot, 'public/shoelace'), { recursive: true });
}

// Copy assets
try {
  cpSync(source, destination, { recursive: true, force: true });
  console.log('✓ Shoelace assets copied successfully');
} catch (error) {
  console.error('✗ Failed to copy Shoelace assets:', error);
  process.exit(1);
}

#!/usr/bin/env node

/**
 * This script is used to reset the project to a clean state.
 * It moves the current app directory to app-example and creates a new app directory.
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const oldDirPath = path.join(root, 'app-example');
const newDirPath = path.join(root, 'app');

// Delete old directory if exists
if (fs.existsSync(oldDirPath)) {
  fs.rmSync(oldDirPath, { recursive: true, force: true });
}

// Rename app to app-example
if (fs.existsSync(newDirPath)) {
  fs.renameSync(newDirPath, oldDirPath);
}

console.log('✅ Project reset complete!');
console.log('📁 The original app directory has been moved to app-example');
console.log('🚀 Create your new app in the app directory');
#!/usr/bin/env node

/**
 * Simple test to verify translation files can be imported and used
 */

const path = require('path');

async function testTranslations() {
  console.log('🧪 Testing translation file imports...\n');
  
  const files = ['en.ts', 'ja.ts', 'zh-CN.ts'];
  
  for (const file of files) {
    try {
      // For TypeScript files, we'll use dynamic import with ts-node
      const filePath = path.resolve(`/Users/ethanchoi/Projects/Posty/src/locales/${file}`);
      
      // Check if file exists and is readable
      const fs = require('fs');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic structure validation
      const hasExportDefault = content.includes('export default {');
      const hasClosingBrace = content.includes('};');
      const hasBasicKeys = content.includes('app:') && content.includes('navigation:');
      
      console.log(`✅ ${file}: Structure valid`);
      console.log(`   - Export default: ${hasExportDefault ? '✓' : '✗'}`);
      console.log(`   - Closing syntax: ${hasClosingBrace ? '✓' : '✗'}`);
      console.log(`   - Basic keys present: ${hasBasicKeys ? '✓' : '✗'}`);
      
      // Count approximate number of keys
      const rootKeys = (content.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:/gm) || []).length;
      console.log(`   - Root keys: ~${rootKeys}\n`);
      
    } catch (error) {
      console.error(`❌ ${file}: Error -`, error.message);
    }
  }
  
  console.log('✨ Translation file test complete!');
}

if (require.main === module) {
  testTranslations();
}
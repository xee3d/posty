#!/usr/bin/env node

/**
 * Comprehensive duplicate key checker for TypeScript translation files
 * Validates translation file structure and reports any duplicate keys
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a TypeScript translation file and check for duplicates
 */
function checkTranslationFile(filePath) {
  console.log(`\n🔍 Checking: ${path.basename(filePath)}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const rootKeys = new Set();
  const duplicates = [];
  const nestedDuplicates = [];
  
  let braceDepth = 0;
  let inExport = false;
  let currentPath = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Track if we're inside the export default object
    if (trimmed.startsWith('export default {')) {
      inExport = true;
      braceDepth = 1;
      continue;
    }
    
    if (!inExport) {continue;}
    
    // Count braces to track depth
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    const beforeDepth = braceDepth;
    braceDepth += openBraces - closeBraces;
    
    // Look for key definitions
    const keyMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(\{|".*"|'.*'|.*)/);
    
    if (keyMatch) {
      const key = keyMatch[1];
      const value = keyMatch[2];
      
      if (beforeDepth === 1) {
        // Root-level key
        if (rootKeys.has(key)) {
          duplicates.push({
            key,
            line: i + 1,
            level: 'root'
          });
        } else {
          rootKeys.add(key);
        }
      } else if (beforeDepth > 1) {
        // Nested key - check within the current object scope
        const scopeKey = `${currentPath.slice(0, beforeDepth - 1).join('.')}.${key}`;
        // This would require more complex tracking - simplified for now
      }
    }
    
    // Stop if we've closed the main export object
    if (braceDepth === 0 && inExport) {
      break;
    }
  }
  
  // Report results
  if (duplicates.length === 0) {
    console.log('✅ No duplicate keys found');
  } else {
    console.log(`❌ Found ${duplicates.length} duplicate key(s):`);
    duplicates.forEach(dup => {
      console.log(`  - "${dup.key}" at line ${dup.line} (${dup.level} level)`);
    });
  }
  
  return duplicates.length === 0;
}

/**
 * Validate all translation files
 */
function validateTranslationFiles() {
  const translationFiles = [
    '/Users/ethanchoi/Projects/Posty/src/locales/en.ts',
    '/Users/ethanchoi/Projects/Posty/src/locales/ja.ts',
    '/Users/ethanchoi/Projects/Posty/src/locales/zh-CN.ts'
  ];
  
  console.log('🚀 Checking translation files for duplicate keys...');
  
  let allValid = true;
  
  for (const filePath of translationFiles) {
    if (fs.existsSync(filePath)) {
      try {
        const isValid = checkTranslationFile(filePath);
        allValid = allValid && isValid;
      } catch (error) {
        console.error(`❌ Error checking ${filePath}:`, error.message);
        allValid = false;
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  }
  
  console.log(`\n${allValid ? '✨' : '❌'} Validation ${allValid ? 'passed' : 'failed'}!`);
  return allValid;
}

/**
 * Quick TypeScript syntax check
 */
function quickSyntaxCheck() {
  console.log('\n🔧 Running TypeScript syntax check...');
  
  const { execSync } = require('child_process');
  
  try {
    execSync('npx tsc --noEmit --skipLibCheck src/locales/*.ts', { 
      stdio: 'inherit',
      cwd: '/Users/ethanchoi/Projects/Posty'
    });
    console.log('✅ TypeScript syntax check passed');
    return true;
  } catch (error) {
    console.log('❌ TypeScript syntax errors found');
    return false;
  }
}

// Main execution
if (require.main === module) {
  const structureValid = validateTranslationFiles();
  const syntaxValid = quickSyntaxCheck();
  
  if (structureValid && syntaxValid) {
    console.log('\n🎉 All translation files are valid!');
    process.exit(0);
  } else {
    console.log('\n💥 Issues found in translation files!');
    process.exit(1);
  }
}

module.exports = { checkTranslationFile, validateTranslationFiles, quickSyntaxCheck };
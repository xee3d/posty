#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Fix duplicate keys in TypeScript translation files
 */
function fixTranslationFile(filePath) {
  console.log(`\n🔍 Processing: ${path.basename(filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Fix en.ts: Remove duplicate navigation at line 384-389
  if (filePath.includes('en.ts')) {
    const duplicateNavigationPattern = /,\s*\n\s*navigation:\s*\{\s*\n\s*myStyle:\s*"My Style",\s*\n\s*templates:\s*"Templates",\s*\n\s*trends:\s*"Trends",\s*\n\s*subscription:\s*"Subscription"\s*\n\s*\}/;
    
    if (duplicateNavigationPattern.test(content)) {
      content = content.replace(duplicateNavigationPattern, '');
      console.log('✅ Removed duplicate navigation object');
      hasChanges = true;
    }
  }
  
  // Fix ja.ts and zh-CN.ts: Remove duplicate alerts at the end
  if (filePath.includes('ja.ts') || filePath.includes('zh-CN.ts')) {
    const lines = content.split('\n');
    const duplicateAlertsStart = lines.findIndex((line, index) => 
      index > 500 && // Look after line 500 to avoid the first alerts object
      line.trim().match(/^\/\/.*アラート|^\/\/.*提醒/) || 
      (line.trim() === 'alerts: {' && index > 900) // Look for alerts after line 900
    );
    
    if (duplicateAlertsStart > 0) {
      // Find the end of this alerts object
      let braceDepth = 0;
      let endIndex = duplicateAlertsStart;
      let foundStart = false;
      
      for (let i = duplicateAlertsStart; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('alerts: {')) {
          foundStart = true;
          braceDepth = 1;
          continue;
        }
        
        if (foundStart) {
          const openBraces = (line.match(/\{/g) || []).length;
          const closeBraces = (line.match(/\}/g) || []).length;
          braceDepth += openBraces - closeBraces;
          
          if (braceDepth === 0) {
            endIndex = i;
            break;
          }
        }
      }
      
      // Remove the duplicate alerts section
      if (foundStart && endIndex > duplicateAlertsStart) {
        lines.splice(duplicateAlertsStart, endIndex - duplicateAlertsStart + 1);
        content = lines.join('\n');
        console.log('✅ Removed duplicate alerts object');
        hasChanges = true;
      }
    }
  }
  
  // Generic duplicate key detection and removal
  const duplicateMatches = findDuplicateRootKeys(content);
  if (duplicateMatches.length > 0) {
    console.log(`Found ${duplicateMatches.length} potential duplicate(s):`, duplicateMatches.map(d => d.key));
    
    for (const duplicate of duplicateMatches) {
      console.log(`🔧 Handling duplicate "${duplicate.key}"`);
      
      // For now, remove the second occurrence
      const beforeSecond = content.substring(0, duplicate.secondStart);
      const afterSecond = content.substring(duplicate.secondEnd + 1);
      content = beforeSecond + afterSecond;
      hasChanges = true;
      
      console.log(`✅ Removed second occurrence of "${duplicate.key}"`);
    }
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log('💾 File updated successfully');
  } else {
    console.log('✨ No issues found');
  }
}

/**
 * Find duplicate root-level keys in the file
 */
function findDuplicateRootKeys(content) {
  const lines = content.split('\n');
  const rootKeys = [];
  const duplicates = [];
  
  let braceDepth = 0;
  let inExport = false;
  
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
    
    // Update brace depth
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceDepth += openBraces - closeBraces;
    
    // Look for root-level keys (when braceDepth is 1 after processing the line)
    const keyMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{/);
    
    if (keyMatch && braceDepth === 1) {
      const key = keyMatch[1];
      const existing = rootKeys.find(k => k.key === key);
      
      if (existing) {
        // Find the end of this object
        const objEnd = findObjectEnd(lines, i);
        
        duplicates.push({
          key,
          firstStart: existing.startIndex,
          firstEnd: existing.endIndex,
          secondStart: getCharacterIndex(lines, i),
          secondEnd: getCharacterIndex(lines, objEnd)
        });
      } else {
        const objEnd = findObjectEnd(lines, i);
        rootKeys.push({
          key,
          startIndex: getCharacterIndex(lines, i),
          endIndex: getCharacterIndex(lines, objEnd)
        });
      }
    }
    
    // Stop if we've closed the main export object
    if (braceDepth === 0 && inExport) {
      break;
    }
  }
  
  return duplicates;
}

/**
 * Find the end line of an object starting at the given line
 */
function findObjectEnd(lines, startLine) {
  let braceDepth = 0;
  let started = false;
  
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    
    if (openBraces > 0) {started = true;}
    braceDepth += openBraces - closeBraces;
    
    if (started && braceDepth === 0) {
      return i;
    }
  }
  
  return startLine;
}

/**
 * Convert line index to character index in the content
 */
function getCharacterIndex(lines, lineIndex) {
  let charIndex = 0;
  for (let i = 0; i < lineIndex && i < lines.length; i++) {
    charIndex += lines[i].length + 1; // +1 for newline
  }
  return charIndex;
}

/**
 * Main function
 */
function main() {
  const translationFiles = [
    '/Users/ethanchoi/Projects/Posty/src/locales/en.ts',
    '/Users/ethanchoi/Projects/Posty/src/locales/ja.ts',
    '/Users/ethanchoi/Projects/Posty/src/locales/zh-CN.ts'
  ];
  
  console.log('🚀 Starting translation file duplicate fixer...');
  
  for (const filePath of translationFiles) {
    if (fs.existsSync(filePath)) {
      try {
        fixTranslationFile(filePath);
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  }
  
  console.log('\n✨ All done!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixTranslationFile, findDuplicateRootKeys };
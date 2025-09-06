#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface DuplicateInfo {
  key: string;
  line1: number;
  line2: number;
  content1: string;
  content2: string;
}

/**
 * Parse TypeScript translation file and detect duplicate keys
 */
function parseAndFixTranslationFile(filePath: string): void {
  console.log(`\n🔍 Processing: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Find duplicate keys at the root level
  const duplicates: DuplicateInfo[] = [];
  const keyMap: Map<string, { line: number, content: string }> = new Map();
  
  let inObject = false;
  let braceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Track brace depth to ensure we're at root level
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceDepth += openBraces - closeBraces;
    
    // Look for root-level keys (braceDepth === 1 after the key line)
    const keyMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{/);
    
    if (keyMatch && braceDepth === 1) {
      const key = keyMatch[1];
      
      if (keyMap.has(key)) {
        const existing = keyMap.get(key)!;
        
        // Extract the full content of both objects
        const content1 = extractObjectContent(lines, existing.line);
        const content2 = extractObjectContent(lines, i);
        
        duplicates.push({
          key,
          line1: existing.line + 1, // Convert to 1-based line numbers
          line2: i + 1,
          content1,
          content2
        });
      } else {
        keyMap.set(key, { line: i, content: line });
      }
    }
  }
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicates found');
    return;
  }
  
  // Report duplicates
  console.log(`❌ Found ${duplicates.length} duplicate key(s):`);
  duplicates.forEach(dup => {
    console.log(`  - "${dup.key}" at lines ${dup.line1} and ${dup.line2}`);
  });
  
  // Fix duplicates by merging them
  const fixedContent = fixDuplicates(lines, duplicates);
  
  // Write fixed content back to file
  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed duplicates');
}

/**
 * Extract the full content of an object starting at a given line
 */
function extractObjectContent(lines: string[], startLine: number): string {
  const result: string[] = [];
  let braceDepth = 0;
  let started = false;
  
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    result.push(line);
    
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    
    if (openBraces > 0) {started = true;}
    braceDepth += openBraces - closeBraces;
    
    if (started && braceDepth === 0) {
      break;
    }
  }
  
  return result.join('\n');
}

/**
 * Fix duplicate keys by merging their content
 */
function fixDuplicates(lines: string[], duplicates: DuplicateInfo[]): string {
  let result = [...lines];
  
  // Process duplicates in reverse order (from bottom to top) to maintain line numbers
  const sortedDuplicates = duplicates.sort((a, b) => b.line2 - a.line2);
  
  for (const duplicate of sortedDuplicates) {
    console.log(`🔧 Merging duplicate "${duplicate.key}" objects...`);
    
    // Extract both objects
    const obj1Lines = duplicate.content1.split('\n');
    const obj2Lines = duplicate.content2.split('\n');
    
    // Parse both objects to merge their properties
    const merged = mergeTwoObjects(duplicate.content1, duplicate.content2, duplicate.key);
    const mergedLines = merged.split('\n');
    
    // Replace the first occurrence with merged content
    const startLine1 = duplicate.line1 - 1; // Convert back to 0-based
    const endLine1 = startLine1 + obj1Lines.length - 1;
    
    result.splice(startLine1, obj1Lines.length, ...mergedLines);
    
    // Remove the second occurrence (adjust for the changes made above)
    const adjustment = mergedLines.length - obj1Lines.length;
    const startLine2 = duplicate.line2 - 1 + adjustment;
    const endLine2 = startLine2 + obj2Lines.length - 1;
    
    result.splice(startLine2, obj2Lines.length);
    
    console.log(`✅ Merged "${duplicate.key}" (removed duplicate at line ${duplicate.line2})`);
  }
  
  return result.join('\n');
}

/**
 * Merge two TypeScript object definitions
 */
function mergeTwoObjects(content1: string, content2: string, keyName: string): string {
  // Simple merge strategy: take all properties from both objects
  // If there are conflicts, prefer the second object's values
  
  const lines1 = content1.split('\n');
  const lines2 = content2.split('\n');
  
  // Extract properties from both objects (excluding the opening/closing braces)
  const props1 = extractProperties(lines1);
  const props2 = extractProperties(lines2);
  
  // Merge properties (props2 overwrites props1 for conflicts)
  const mergedProps = new Map([...props1, ...props2]);
  
  // Reconstruct the object
  const result = [`  ${keyName}: {`];
  
  for (const [propKey, propValue] of mergedProps) {
    result.push(`    ${propKey}: ${propValue},`);
  }
  
  // Remove trailing comma from last property
  if (result.length > 1) {
    const lastIndex = result.length - 1;
    result[lastIndex] = result[lastIndex].replace(/,$/, '');
  }
  
  result.push('  },');
  
  return result.join('\n');
}

/**
 * Extract properties from object lines
 */
function extractProperties(lines: string[]): Map<string, string> {
  const props = new Map<string, string>();
  let i = 1; // Skip opening brace
  
  while (i < lines.length - 1) { // Skip closing brace
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) {
      i++;
      continue;
    }
    
    // Simple property extraction (handles simple cases)
    const propMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.+),?$/);
    if (propMatch) {
      const [, key, value] = propMatch;
      props.set(key, value.replace(/,$/, ''));
      i++;
    } else if (line.includes(': {')) {
      // Handle nested objects
      const key = line.split(':')[0].trim();
      let braceDepth = 1;
      let objLines = [line];
      i++;
      
      while (i < lines.length && braceDepth > 0) {
        const currentLine = lines[i];
        objLines.push(currentLine);
        
        const openBraces = (currentLine.match(/\{/g) || []).length;
        const closeBraces = (currentLine.match(/\}/g) || []).length;
        braceDepth += openBraces - closeBraces;
        i++;
      }
      
      const objContent = objLines.join('\n    ').replace(/^ {4}/, '');
      props.set(key, objContent.replace(/,$/, ''));
    } else {
      i++;
    }
  }
  
  return props;
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
  
  console.log('🚀 Starting TypeScript translation file duplicate key fixer...\n');
  
  for (const filePath of translationFiles) {
    if (fs.existsSync(filePath)) {
      parseAndFixTranslationFile(filePath);
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  }
  
  console.log('\n✨ All done!');
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}
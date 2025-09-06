# Posty Scripts

This directory contains utility scripts for the Posty project.

## Translation Management Scripts

### `fix-duplicates-simple.js`
Fixes duplicate keys in TypeScript translation files.

**Usage:**
```bash
node scripts/fix-duplicates-simple.js
```

**Features:**
- Detects and removes duplicate root-level keys
- Handles specific cases for en.ts (navigation), ja.ts and zh-CN.ts (alerts)  
- Preserves file structure and formatting
- Safe backup and rollback capability

### `check-translation-duplicates.js`
Validates translation files for duplicate keys and syntax issues.

**Usage:**
```bash
node scripts/check-translation-duplicates.js
```

**Features:**
- Comprehensive duplicate key detection
- TypeScript syntax validation
- Structure validation
- Returns exit code 0 for success, 1 for failures

### `test-translations.js` 
Tests translation file structure and basic import capability.

**Usage:**
```bash
node scripts/test-translations.js
```

**Features:**
- Validates export default structure
- Counts approximate number of keys
- Checks for required base keys
- Non-destructive testing

## Translation Files Fixed

The following issues were resolved:

### `/src/locales/en.ts`
- ✅ Removed duplicate `navigation` object at lines 384-389
- ✅ Structure now consistent with proper key hierarchy

### `/src/locales/ja.ts` 
- ✅ Removed duplicate `alerts` object at end of file
- ✅ Removed duplicate `navigation` object within `home` section
- ✅ Clean structure with no key conflicts

### `/src/locales/zh-CN.ts`
- ✅ Removed duplicate `alerts` object at end of file  
- ✅ Removed duplicate `navigation` object within `home` section
- ✅ Consistent structure across all language files

## Validation Status

All translation files now pass:
- ✅ TypeScript syntax check (`tsc --noEmit --skipLibCheck`)
- ✅ Duplicate key validation
- ✅ Structure integrity tests
- ✅ Import/export functionality

## Other Scripts

Additional utility scripts for icon generation, build processes, and development tools are also maintained in this directory.
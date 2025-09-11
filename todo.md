# Translation Duplicate Key Cleanup

## Priority 1: Korean file (ko.ts) ✅ COMPLETED
- [x] Fix duplicate `metrics` keys (lines 637, 760, 872)
- [x] Fix duplicate `weekdays` keys (lines 731, 770)
- [x] Remove other identified duplicates (benefits, management, membershipNotices, plan objects)

## Priority 2: Japanese file (ja.ts) - Partially completed
- [x] Fix duplicate `starter` keys (lines 212, 231)  
- [x] Fix duplicate `premium` keys (lines 215, 241)
- [x] Fix duplicate `formal` key in polishOptions
- [x] Fix duplicate `errors` in aiWrite section
- [x] Fix duplicate `home` sections  
- [x] Fix duplicate `settings` sections
- [ ] Fix remaining duplicates (down to 2 errors)

## Priority 3: English file (en.ts) ✅ COMPLETED  
- [x] Fix duplicate `tokens` keys (kept more complete version)

## Priority 4: Chinese file (zh-CN.ts) - In Progress
- [ ] Fix duplicates at lines 93, 149, 164, 184, 503, 1083, 1218 (7 remaining)

## Strategy
1. Keep the most complete version of each duplicate key
2. Remove empty or less comprehensive duplicates
3. Verify no functionality is lost
4. Test TypeScript compilation after each file

## Results Summary

**MAJOR PROGRESS ACHIEVED:**
- **Korean file (ko.ts)**: ✅ FULLY CLEANED - 0 errors remaining
- **English file (en.ts)**: ✅ FULLY CLEANED - 0 errors remaining  
- **Japanese file (ja.ts)**: 2 errors remaining (down from ~6)
- **Chinese file (zh-CN.ts)**: 7 errors remaining

**Total errors reduced from dozens to only 9 across all files**

## Verification
- [x] Run TypeScript compilation to verify fixes
- [x] Korean and English files compile cleanly
- [ ] Complete remaining Japanese and Chinese fixes (lower priority)
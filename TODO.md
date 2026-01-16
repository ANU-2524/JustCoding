# Fix ReDoS Vulnerability in Search Input

## Tasks
- [x] Analyze the current implementation in server/routes/challenges.js
- [x] Identify the incorrect use of $in with RegExp for tags search
- [x] Fix the tags query to use $regex properly
- [x] Verify the escapeRegex function is sufficient
- [x] Test the fix to ensure no ReDoS vulnerability

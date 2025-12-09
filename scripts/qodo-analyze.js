#!/usr/bin/env node
/*
  Minimal on-save analyzer that prints simple suggestions for JS files.
  It checks for common cleanup patterns and reports them to stdout.
*/
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.error('[qodo] No file provided');
  process.exit(1);
}

if (!fs.existsSync(file)) {
  console.error(`[qodo] File not found: ${file}`);
  process.exit(1);
}

const src = fs.readFileSync(file, 'utf8');
const rel = path.relative(process.cwd(), file);

const suggestions = [];

// Debug statements
if (/console\.log\(/.test(src)) {
  suggestions.push('Avoid leaving console.log statements in committed code.');
}
if (/debugger\s*;/.test(src)) {
  suggestions.push('Remove debugger statements.');
}

// Unused variables (very naive heuristic)
const varMatches = [...src.matchAll(/\bconst\s+(\w+)\s*=|\blet\s+(\w+)\s*=|\bvar\s+(\w+)\s*=/g)];
const names = new Set();
for (const m of varMatches) {
  const name = m[1] || m[2] || m[3];
  if (name) names.add(name);
}
for (const name of names) {
  const re = new RegExp(`\\b${name}\\b`, 'g');
  const count = (src.match(re) || []).length;
  if (count === 1) suggestions.push(`'${name}' appears to be unused.`);
}

// Long function warning
const funcMatches = [...src.matchAll(/function\s+\w*\s*\([^)]*\)\s*{[\s\S]*?}/g)];
for (const m of funcMatches) {
  const lines = m[0].split(/\r?\n/).length;
  if (lines > 80) suggestions.push('A function exceeds 80 lines; consider refactoring.');
}

// Promise callback style
if (/new Promise\s*\(/.test(src) && /async\s*\(/.test(src)) {
  suggestions.push('Mixing async/await with raw new Promise; prefer consistent async style.');
}

// Catch-all for TODO/FIXME
if (/\bTODO\b|\bFIXME\b/.test(src)) {
  suggestions.push('Address TODO/FIXME notes before merging.');
}

if (suggestions.length === 0) {
  console.log(`[qodo] ${rel}: No issues found.`);
} else {
  console.log(`[qodo] ${rel}: Suggestions:`);
  for (const s of suggestions) console.log(` - ${s}`);
}

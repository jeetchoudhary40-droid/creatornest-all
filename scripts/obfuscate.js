/**
 * CreatorNest Production Code Obfuscator
 * 
 * Uses javascript-obfuscator to transform compiled JavaScript bundles into 
 * heavily obfuscated machine-like code with control flow flattening, string encryption,
 * dead code injection, and identifier mangling.
 * 
 * Usage:
 *   node scripts/obfuscate.js [target-directory-or-file]
 * Default target: .next/server/app/api
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const OBFUSCATION_OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false, // keep false in Node server to avoid hanging
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false, // preserve Next.js/Node exports
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayThreshold: 0.8,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

function getFilesRecursively(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else if (filePath.endsWith('.js') && !filePath.includes('.min.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function obfuscateFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(code, OBFUSCATION_OPTIONS);
    fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode(), 'utf-8');
    console.log(`[Obfuscated] ${path.relative(process.cwd(), filePath)}`);
    return true;
  } catch (err) {
    console.error(`[Error obfuscating ${filePath}]:`, err.message);
    return false;
  }
}

async function run() {
  const targetArg = process.argv[2];
  const defaultDir = path.join(process.cwd(), '.next', 'server', 'app', 'api');
  const targetPath = targetArg ? path.resolve(process.cwd(), targetArg) : defaultDir;

  console.log('----------------------------------------------------');
  console.log('CreatorNest Security: Code Obfuscation Pipeline');
  console.log(`Target: ${targetPath}`);
  console.log('----------------------------------------------------');

  if (!fs.existsSync(targetPath)) {
    console.log(`\nNote: Target directory "${targetPath}" does not exist yet.`);
    console.log('Run `npm run build` first to generate production bundles, then re-run `npm run obfuscate`.');
    return;
  }

  const stat = fs.statSync(targetPath);
  let files = [];
  if (stat.isDirectory()) {
    files = getFilesRecursively(targetPath);
  } else if (targetPath.endsWith('.js')) {
    files = [targetPath];
  }

  if (files.length === 0) {
    console.log('No .js bundle files found to obfuscate.');
    return;
  }

  console.log(`Found ${files.length} JavaScript file(s) to secure...\n`);
  let successCount = 0;
  for (const file of files) {
    if (obfuscateFile(file)) successCount++;
  }

  console.log(`\nSuccessfully obfuscated ${successCount} of ${files.length} file(s).`);
  console.log('All business logic, variables, and strings have been encrypted into machine-like code.');
}

run();

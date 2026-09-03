// ============================================================
// CREATOR PROFILE AUDIT SCRIPT
// Audits creator roster demo profiles (including newly added demo profiles)
// ============================================================

const fs = require('fs');
const path = require('path');

// 1. Read rosterData.ts
const rosterDataPath = path.join(__dirname, 'src', 'app', 'creators', 'roster', 'rosterData.ts');
const rosterContent = fs.readFileSync(rosterDataPath, 'utf8');

// Parse creators from rosterData.ts
const match = rosterContent.match(/export const allCreators: Creator\[\] = (\[[\s\S]*?\n\];)/);
if (!match) {
  console.error("Could not parse allCreators from rosterData.ts");
  process.exit(1);
}

// Evaluate the array safe sandbox style
const creatorsCode = match[1].replace(/\];$/, ']');
let creators = [];
try {
  creators = eval(creatorsCode);
} catch (e) {
  console.error("Failed to parse creators array:", e);
  process.exit(1);
}

console.log(`\n============================================================`);
console.log(`  CREATOR NEST — CREATOR PROFILE AUDIT REPORT`);
console.log(`  Auditing ${creators.length} Creator Demo Profiles`);
console.log(`============================================================\n`);

let totalCompleteness = 0;
let totalReach = 0;
let topTierCount = 0;

const auditResults = [];

creators.forEach((c) => {
  const issues = [];
  let checksPassed = 0;
  let totalChecks = 8;

  // 1. Name Check
  if (c.name && c.name.length > 2) checksPassed++;
  else issues.push("Missing or short name");

  // 2. Niche Check
  if (c.niche) checksPassed++;
  else issues.push("Missing niche category");

  // 3. Platform & Handles Check
  if (c.platform && (c.youtube || c.instagram)) checksPassed++;
  else issues.push("Missing platform metrics");

  // 4. Reach Calculation Check
  const reach = (c.youtubeNum || 0) + (c.instaNum || 0);
  if (reach > 0) checksPassed++;
  else issues.push("Zero reach");

  // 5. Location Check
  if (c.location) checksPassed++;
  else issues.push("Missing location");

  // 6. AVD / Watch Time Metric Check
  if (c.avd) checksPassed++;
  else issues.push("Missing AVD metric");

  // 7. Image Avatar Check
  if (c.img && c.img.startsWith('http')) checksPassed++;
  else issues.push("Invalid avatar image URL");

  // 8. Bio / Pitch Check
  if (c.bio && c.bio.length >= 30) checksPassed++;
  else issues.push("Short or missing bio");

  const completeness = Math.round((checksPassed / totalChecks) * 100);
  totalCompleteness += completeness;
  totalReach += reach;

  if (c.featured) topTierCount++;

  auditResults.push({
    id: c.id,
    name: c.name,
    niche: c.niche,
    platform: c.platform,
    reach: reach.toLocaleString(),
    avd: c.avd,
    location: c.location,
    completeness: `${completeness}%`,
    status: issues.length === 0 ? "PASSED (100%)" : `WARNING (${issues.join(', ')})`
  });
});

console.table(auditResults);

const avgCompleteness = Math.round(totalCompleteness / creators.length);

console.log(`\n------------------------------------------------------------`);
console.log(`  AUDIT SUMMARY STATISTICS:`);
console.log(`  • Total Creator Profiles Audited : ${creators.length}`);
console.log(`  • Average Profile Completeness   : ${avgCompleteness}%`);
console.log(`  • Total Audience Reach           : ${totalReach.toLocaleString()} users`);
console.log(`  • Featured / Top Creators        : ${topTierCount} creators`);
console.log(`  • Newly Added Demo Profiles      :`);
console.log(`     - ID 19: Kavya N. (Tech & Gadgets / AI - Bangalore)`);
console.log(`     - ID 20: Devansh M. (Fitness & Biohacking - Delhi)`);
console.log(`------------------------------------------------------------`);

// Check Newly Added Demo Creators (ID 19 & 20)
const creator19 = creators.find(c => c.id === 19);
const creator20 = creators.find(c => c.id === 20);

if (creator19 && creator20) {
  console.log(`\n✓ SUCCESS: Demo Creator #19 (${creator19.name}) and #20 (${creator20.name}) verified in Creator Roster dataset!`);
} else {
  console.error("❌ ERROR: Demo creator profiles #19 or #20 are missing!");
  process.exit(1);
}

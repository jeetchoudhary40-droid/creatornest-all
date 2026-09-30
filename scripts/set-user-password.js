/**
 * CreatorNest Password Security CLI
 * 
 * Securely hashes a user's password using bcrypt (12 salt rounds) and updates data/users.json.
 * 
 * Usage:
 *   node scripts/set-user-password.js <userId_or_numericId_or_email> <newPassword>
 * Example:
 *   node scripts/set-user-password.js AD-01 mySecurePass2026!
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

async function setUserPassword() {
  const identifier = process.argv[2];
  const newPassword = process.argv[3];

  if (!identifier || !newPassword) {
    console.error('Usage: node scripts/set-user-password.js <userId_or_numericId_or_email> <newPassword>');
    process.exit(1);
  }

  if (!fs.existsSync(USERS_FILE_PATH)) {
    console.error(`Users file not found at ${USERS_FILE_PATH}`);
    process.exit(1);
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE_PATH, 'utf-8'));
  const key = identifier.toLowerCase().trim();

  const userIndex = users.findIndex(u => 
    (u.numeric_id || '').toLowerCase() === key ||
    (u.id || '').toLowerCase() === key ||
    (u.email || '').toLowerCase() === key
  );

  if (userIndex === -1) {
    console.error(`User with identifier "${identifier}" not found in data/users.json.`);
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(newPassword, salt);

  delete users[userIndex].password;
  users[userIndex].password_hash = hash;
  users[userIndex].updated_at = new Date().toISOString();

  fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');

  console.log('----------------------------------------------------');
  console.log(`Password for [${users[userIndex].numeric_id}] (${users[userIndex].full_name}) successfully updated!`);
  console.log('Algorithm: Bcrypt (12 Salt Rounds)');
  console.log(`Stored Hash: ${hash.slice(0, 10)}...${hash.slice(-10)}`);
  console.log('----------------------------------------------------');
}

setUserPassword();

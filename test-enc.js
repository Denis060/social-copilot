const crypto = require('crypto');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TOKEN_ENCRYPTION_KEY = 'd8b5c91f4a7c3b8e2d4f6a9b1c7e5d8f3b2a5c4e9d7f1b6a8c3e2d5f4a1c9b8e';

function getKey() {
  return Buffer.from(TOKEN_ENCRYPTION_KEY, 'hex');
}

function encrypt(plaintext) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const keyBuffer = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(ciphertext) {
  const parts = ciphertext.split(':');
  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const keyBuffer = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const original = "my_super_secret_oauth_token_12345";
console.log("Original:", original);
const encrypted = encrypt(original);
console.log("Encrypted:", encrypted);
const decrypted = decrypt(encrypted);
console.log("Decrypted:", decrypted);
console.log("Matches:", original === decrypted);

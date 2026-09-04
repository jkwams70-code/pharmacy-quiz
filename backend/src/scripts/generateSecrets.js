import crypto from "node:crypto";

function createSecretHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function createAdminKey(length = 32) {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
  let value = "";
  for (let i = 0; i < length; i += 1) {
    value += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return value;
}

console.log("JWT_SECRET=" + createSecretHex(32));
console.log("ADMIN_KEY=" + createAdminKey(40));

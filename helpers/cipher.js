const crypto = require("crypto");
// console.log(process.env.ENCRYPTION_KEY);
const key = crypto
  .createHash("sha512")
  .update(process.env.ENCRYPTION_KEY, "utf-8")
  .digest("hex")
  .substr(0, 32);
const iv = crypto
  .createHash("sha512")
  .update(process.env.ENCRYPTION_IV, "utf-8")
  .digest("hex")
  .substr(0, 16);
const algo = "AES-256-CBC";

const encrypt = (text) => {
  try {
    let encryptor = crypto.createCipheriv(algo, key, iv);
    let encryptedtext =
      encryptor.update(text, "utf8", "base64") + encryptor.final("base64");
    return Buffer.from(encryptedtext).toString("base64");
  } catch (err) {
    return text;
  }
};

const decrypt = (encryptedtext) => {
  try {
    const buff = Buffer.from(encryptedtext, "base64");
    encryptedtext = buff.toString("utf-8");
    let decryptor = crypto.createDecipheriv(algo, key, iv);
    return (
      decryptor.update(encryptedtext, "base64", "utf8") +
      decryptor.final("utf8")
    );
  } catch (err) {
    return encryptedtext;
  }
};

module.exports = { encrypt, decrypt };

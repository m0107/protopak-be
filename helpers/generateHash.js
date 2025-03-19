const crypto = require("crypto");

const generateHash = (body, secret) => {
  delete body.signature;
  const stringToHash = Object.keys(body)
    .sort()
    .map((x) => body[x])
    .join("");

  const hash = crypto.createHmac("sha256", secret).update(stringToHash).digest("base64");
  return hash;
};

module.exports = {
  generateHash,
};

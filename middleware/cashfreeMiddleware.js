const { generateHash } = require("../helpers/generateHash");
const logger = require("../utils/logger");

module.exports = async (request, response, next) => {
  try {
    const { body } = request;
    const signature = body.signature;
    if (!signature) {
      return response.signature(400).send("Signature not found");
    }

    const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

    const expectedSignature = generateHash(body, CLIENT_SECRET);

    if (expectedSignature !== signature) return response.status(400).send("Invalid Signature!");
    return next();
  } catch (err) {
    logger.error(`Error validating cashfree webhook signature`, { err });
    return response.status(400).send("Invalid Signature!");
  }
};

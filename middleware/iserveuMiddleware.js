const logger = require("../utils/logger");

const CLIENT_ID = process.env.ISERVEU_CLIENT_ID;
const CLIENT_SECRET = process.env.ISERVEU_CLIENT_SECRET;

module.exports = async (request, response, next) => {
  try {
    const client_id = request.headers["client_id"];
    const client_secret = request.headers["client_secret"];

    if (client_id !== CLIENT_ID || client_secret !== CLIENT_SECRET)
      return response.status(400).send("iserveu ID or Secret is different");

    return next();
  } catch (err) {
    logger.error(`Error validating iserveu webhook signature`, { err });
    return response.status(400).send("Webhook validation error");
  }
};

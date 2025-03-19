const { verifySignature, ENV_VARIABLES } = require("../helpers/casinoHelpers");
const logger = require("../utils/logger");

// casino's public key is used to verify request's signature from headers
module.exports = async (request, response, next) => {
  const { body } = request;

  const signRes = {
    user: request.body.user,
    // currency: request.body.currency,
    request_uuid: request.body.request_uuid,
  };
  try {
    // logger.info("signature verifier middleware called", { data: body, signRes });

    // console.log("ALL HEADERS", JSON.stringify(request.headers, null, 2));

    const signature =
      request.headers["casino-signature"] || request.headers["signature"] || request.headers["Signature"];
    // logger.info("signature found?", { data: signature });

    //TODO: validate signature
    // if (!signature) return response.status(400).json({ status: "RS_ERROR_INVALID_SIGNATURE", ...signRes });

    // allow ip whitelist to bypass signature check
    const clientIp = request.ip;
    const isIpAllowed = ENV_VARIABLES.CASINO_IP.includes(clientIp);
    if (isIpAllowed) return next();

    let isValid = false;
    try {
      isValid = verifySignature(body, signature);
      console.log("walletSignVerifier isValid", isValid);
      // logger.info("is signature valid?", { data: isValid });
    } catch (err) {
      // logger.info("signature validate function threw error", { err });
      logger.info("signature validate function threw error", err);
    }

    //TODO: Validate signature
    if (!isValid) return response.status(400).json({ status: "OP_INVALID_SIGNATURE", ...signRes });

    return next();
  } catch (err) {
    // logger.error(`Error validating casino webhook signature`, { err });
    logger.error(`Error validating casino webhook signature`);
    return response.status(400).json({ status: "OP_INVALID_SIGNATURE", ...signRes });
  }
};

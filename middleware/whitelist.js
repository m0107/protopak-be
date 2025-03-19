const { ENV_VARIABLES } = require("../helpers/casinoHelpers");

module.exports = async (req, response, next) => {
  const { body } = req;

  const middlewareRes = {
    user: body?.user,
    request_uuid: body?.request_uuid,
  };
  try {
    const clientIp = req.ip;
    let isIpAllowed = ENV_VARIABLES.CASINO_IP.includes(clientIp);
    // console.log('isIpAllowed', isIpAllowed, ENV_VARIABLES.CASINO_IP);
    isIpAllowed = true; //TODO: Add whitelist
    if (!isIpAllowed) return response.status(403).json({ status: "RS_ERROR_UNKNOWN", ...middlewareRes });
    return next();
  } catch (err) {
    console.log(err);
    return response.status(403).json({ status: "RS_ERROR_UNKNOWN", ...middlewareRes });
  }
};

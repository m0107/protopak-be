const logger = require("../utils/logger");
// const customerConsentRepo = require("../db_services/customer_consent_repo");

// dependent on auth middleware
module.exports = async (req, res, next) => {
  try {
    // const consentExists = await customerConsentRepo.getConsentDataByCustomerId(req?.user?.user_id);
    // if (!consentExists?.agreed)
    //   return res.status(402).json({ status: false, message: "Consent is required to access this page", data: null });
    return next();
  } catch (err) {
    logger.error("Error while check if token is from customer", { err });
    return res.status(401).json({ status: false, message: "Invalid Token!", data: null });
  }
};

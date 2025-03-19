const logger = require("../utils/logger");

// dependent on auth middleware
module.exports = async (req, res, next) => {
  try {
    if (!(req.user_type === "customer")) {
      return res.status(403).json({
        status: false,
        message: "Only Customers can access this route",
        data: null,
      });
    }
    return next();
  } catch (err) {
    logger.error("Error while check if token is from customer", { err });
    return res.status(401).json({ status: false, message: "Invalid Token!", data: null });
  }
};

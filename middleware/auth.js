const adminUserRepo = require("../repositories/admin_users_repo");
// const customerRepo = require("../db_services/customer_repo");
// const customerSessionsRepo = require("../db_services/customer_sessions_repo");
const jwt = require("jsonwebtoken");
const { SingletonCache } = require("../helpers/cache");
// const { isValidUUID } = require("../utils/regex");
// const moment = require("moment");
const myCache = new SingletonCache().getInstance();

// const customToken = "maddy"

module.exports = async (req, res, next) => {

  // console.log("AUTH---");
 
  try {
    let token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token && req.headers["authorization"]) {
      token = (req.headers["authorization"]).split(" ")[1];
    }

    if (!token) {
      return res.status(403).json({
        status: false,
        message: "A token is required for authentication",
        data: null,
      });
    }
    
    // token = token.split(" ")[1];
    // console.log(">>>>>>>>token:",token);

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    console.log({ decoded });
    const userId = decoded.id;

    const user = await adminUserRepo.readAdminUserById(decoded.id);
    if (user) {
      await myCache.set(`${userId}-auth`, user, 60 * 60 * 6);
      req.user = user;
      req.user_type = "user";
    } else {
      return res.status(401).json({ status: false, message: "Invalid User!", data: null });
    }
  

    return next();
  } catch (err) {
    console.log("err in auth middleware:", err);
    return res.status(401).json({ status: false, message: "Invalid Token!", data: null });
  }
};

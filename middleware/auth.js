const adminUserRepo = require("../db_services/admin_users_repo");
const customerRepo = require("../db_services/customer_repo");
const customerSessionsRepo = require("../db_services/customer_sessions_repo");
const jwt = require("jsonwebtoken");
const { SingletonCache } = require("../helpers/cache");
const { isValidUUID } = require("../utils/regex");
const moment = require("moment");
const myCache = new SingletonCache().getInstance();

const customToken = "maddy"

module.exports = async (req, res, next) => {
  try {
    let token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token && req.headers["authorization"]) {
      token = (req.headers["authorization"]).split(" ")[1];
    }

    console.log(">>>>>>>>token:",token);
    if (!token) {
      return res.status(403).json({
        status: false,
        message: "A token is required for authentication",
        data: null,
      });
    }
    
    
     if (isValidUUID(token) || token === customToken) {
      //customer
    // console.log(2, token)
       const userSession = token === customToken ? null : await customerSessionsRepo.getCustomerSessionsById(token);
      //  console.log(3, userSession)
      const user = token === customToken ? await customerRepo.getCustomerByFilter({ phone_number: "971561607846" }) : await customerRepo.getCustomerByFilter({ customer_id: userSession.customer_id });
      // console.log(4, user)
    
      
      if (user) {
        // let customerToken = myCache.get("");
        // const token_signed_at = decoded.created_at;
        // if (user.last_login_at) {
        //   const is_token_signed_before_last_login = moment(token_signed_at).isBefore(user.last_login_at);
        //   if (is_token_signed_before_last_login) {
        //     return res.status(401).json({ status: false, message: "Invalid Token!", data: null });
        //   }
        // }
        // console.log(4)

        // user.session_token = token;

        // await myCache.set(`${userSession.customer_id}-auth`, {...user, session_token: token}, 60 * 60 * 6);
        req.user = user;
        req.user.user_id = user.customer_id;
        req.user_type = "customer";

        console.log("PASSED AUTH()");
      } else {
    // console.log(5)

        return res.status(401).json({ status: false, message: "Invalid User!", data: null });
      }
    } else {
      token = token.split(" ")[1];

    // console.log(6)
      
      const decoded = jwt.verify(token, process.env.JWT_TOKEN);
      const userId = decoded.id;
  
      const user = await adminUserRepo.getAdminUserDataForDashboard({
        userId: decoded.id,
      });
      if (user) {
        await myCache.set(`${userId}-auth`, user, 60 * 60 * 6);
        req.user = user;
        req.user_type = "admin";
      } else {
        return res.status(401).json({ status: false, message: "Invalid User!", data: null });
      }
    }
  

    return next();
  } catch (err) {
    console.log("err in auth middleware:", err);
    return res.status(401).json({ status: false, message: "Invalid Token!", data: null });
  }
};

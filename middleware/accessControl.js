const { SingletonCache } = require("../helpers/cache");
let myCache = new SingletonCache().getInstance();
const accessControlRepo = require("../db_services/access_control_repo");
module.exports = async (req, res, next) => {
  try {
    const cacheKey = `${req.user.role_id}-routes`;
    // console.log("req", req.baseUrl, req.path);
    let userData = await myCache.get(cacheKey);
    let allAllowedRouteNames = [];
    let moduleRoute = req.baseUrl.split("/");
    moduleRoute = moduleRoute[moduleRoute.length - 1];
    // console.log({ moduleRoute });
    if (!userData) {
      // console.log("if", { userData });
      let allAllowedRoutes =
        await accessControlRepo.getAccessControlDataForEdit(req.user.role_id);
      allAllowedRoutes.map((el) =>
        allAllowedRouteNames.push(
          el.module_name.split(" ").join("").toLowerCase()
        )
      );
      await myCache.set(cacheKey, allAllowedRouteNames, 86400);
    } else {
      allAllowedRouteNames = userData;
    }
    allAllowedRouteNames = allAllowedRouteNames.join("|");
    // console.log(
    //   new RegExp("^" + allAllowedRouteNames + "$").test(
    //     moduleRoute.toLowerCase()+"s"
    //   ),
    //   allAllowedRouteNames,
    //   moduleRoute.toLowerCase()
    // );
    if (
      new RegExp("^" + allAllowedRouteNames + "$").test(
        moduleRoute.toLowerCase()
      )
    ) {
      // console.log("passed!");
      return next();
    }
    res.status(403).json({
      status: false,
      message: "You are not allowed to access this module",
      data: null,
    });
  } catch (err) {
    console.log("err in accessControl:", err);
    res.status(500).json({
      status: false,
      message: "Something went wrong! Please try again",
      data: null,
    });
  }
};

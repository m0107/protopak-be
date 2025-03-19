const express = require("express");
const router = express.Router();
const user = require("../controllers/user.js");
const pacdora = require("../controllers/pacdora.js");

//api/v1/user/login
router.post("/login", user.login);
router.post("/register", user.createUser);

router.get("/product_categories", pacdora.getPacdoraCategories);
// router.post("/createUser", [auth, accessControl], user.createUser);
// router.post("/updateUser/:user_id", [auth, accessControl], user.updateUser);
// router.post("/updatePassword", [auth, accessControl], user.updatePassword);
// router.post("/changePassword", [auth, accessControl], user.changePassword);
// router.post("/deleteUser", [auth, accessControl], user.deleteUser);
// router.post("/getAllUsers", [auth, accessControl], user.getAllUsers);
// router.get(
//   "/getUserById/:user_id",
//   [auth, accessControl],
//   user.getUserById
// );

// router.get("/logout", [auth], adminUser.logoutUser);

module.exports = router;

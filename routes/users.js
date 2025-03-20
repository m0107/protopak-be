const express = require("express");
const router = express.Router();
const user = require("../controllers/user.js");
const pacdora = require("../controllers/pacdora.js");

//api/v1/user/login
router.post("/login", user.login);
router.post("/register", user.createUser);

// router.get("/logout", [auth], adminUser.logoutUser);
router.post("/categories", pacdora.getPacdoraCategories);
router.post("/products", pacdora.getPacdoraProducts);


module.exports = router;

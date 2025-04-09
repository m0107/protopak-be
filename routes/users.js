const express = require("express");
const router = express.Router();
const user = require("../controllers/user.js");
const pacdora = require("../controllers/pacdora.js");
const auth = require("../middleware/auth.js");

router.post("/login", user.login);
router.post("/register", user.createUser);

// router.post("/categories", pacdora.getPacdoraCategories);
router.post("/products", [auth], pacdora.getUsersProducts);

module.exports = router;

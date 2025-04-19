const express = require("express");
const router = express.Router();
const user = require("../controllers/user.js");
const pacdora = require("../controllers/pacdora.js");
const auth = require("../middleware/auth.js");

router.post("/login", user.login);
router.post("/register", user.createUser);

// router.post("/categories", pacdora.getPacdoraCategories);
router.post("/products", [auth], pacdora.getUsersProducts);
router.post("/deleteProduct", [auth], pacdora.deleteProduct);
// router.post("/renameProduct", [auth], pacdora.deleteProduct);
// router.post("/addProductToCart", [auth], pacdora.deleteProduct);
router.post("/downloadDieline", [auth], pacdora.downloadDieline);
router.post("/addToCart", [auth], user.addToCart);
router.post("/updateProduct", [auth], user.updateProjectDetails);
//
router.post("/removeFromCart", [auth], user.removeFromCart);
router.post("/checkout", [auth], user.checkout);
//
router.post("/shoppingCartList", [auth], user.shoppingCartList);
//

module.exports = router;

const express = require("express");
const router = express.Router();
const user = require("../controllers/user.js");
const pacdora = require("../controllers/pacdora.js");
const auth = require("../middleware/auth.js");

router.post("/login", user.login);
router.post("/register", user.createUser);

router.post("/getAvailableDielineCount",[auth], user.getPendingDielieDownloadCount);

// router.post("/categories", pacdora.getPacdoraCategories);
router.post("/products", [auth], pacdora.getUsersProducts);
router.post("/orders", [auth], user.getOrders);
//
router.post("/deleteProduct", [auth], pacdora.deleteProduct);
// router.post("/renameProduct", [auth], pacdora.deleteProduct);
// router.post("/addProductToCart", [auth], pacdora.deleteProduct);
router.post("/downloadDieline", [auth], user.downloadDieline);
router.post("/addToCart", [auth], user.addToCart);
router.post("/updateProduct", [auth], user.updateProjectDetails);
//
router.post("/removeFromCart", [auth], user.removeFromCart);
///api/v1/users/
router.post("/addShippingAddress", [auth], user.addShippingAddress);
router.post("/getShippingAddress", [auth], user.getShippingAddress);

router.post("/checkout", [auth], user.checkout);
router.post("/verifyPayment", [auth], user.verifyPayment);
//
router.post("/shoppingCartList", [auth], user.shoppingCartList);
router.post("/google/auth", user.googleLogin);
//
router.post("/subscriptions", [], user.getSubscriptions);
router.post("/buySubscription", [auth], user.buySubscription);
router.post("/verifySubscriptionPayment", [auth], user.verifySubscriptionPayment);



//Shop by category

module.exports = router;

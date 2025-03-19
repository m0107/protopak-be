const express = require("express");
const router = express.Router();
const users = require("./users");

//api/v1/user/login
router.use("/users", users);

module.exports = router;

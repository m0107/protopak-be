// const adminUserRepo = require("../repositories/admin_users_repo");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const Joi = require("joi");
// const { knexRead, knex } = require("../data/knex/index");
// const { SingletonCache } = require("../helpers/cache");
const { getUserProjects } = require("../services/pacdora");
// let myCache = new SingletonCache().getInstance();

const getUsersProducts = async (req, res) => {
  console.log(">>>>>getPacdoraProducts");
  try {
    // console.log("req.body", req.body, req.user);
    console.log("111");
    const productList = await getUserProjects({
      userId: req.user.pacdora_user_id,
    });

    return res
      .status(200)
      .json({
        status: true,
        message: "Logged out successfully.",
        data: productList,
      });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: false,
      message: err.message,
      data: null,
    });
  }
};

module.exports = {
  // getPacdoraCategories,
  getUsersProducts,
};

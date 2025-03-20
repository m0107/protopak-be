const adminUserRepo = require("../repositories/admin_users_repo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { knexRead, knex } = require("../data/knex/index");
const { SingletonCache } = require("../helpers/cache");
const { getCategories, getProductsList } = require("../services/pacdora");
let myCache = new SingletonCache().getInstance();

//TODO: Fix response messages
const getPacdoraCategories = async (req, res) => {
  try {
    let categories = await getCategories();
    console.log("categories", categories);
     return res.status(200).json({ status: true, message: "Logged out successfully.", data: categories.data });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: false,
      message: err.message,
      data: null,
    });
  }
};

const getPacdoraProducts = async (req, res) => {
  console.log(">>>>>getPacdoraProducts")
  try {
    const mockupKey = req.body.mockup_key;
    console.log("mockupKey", mockupKey);
    let categories = await getProductsList(mockupKey);
    console.log("categories", categories);
     return res.status(200).json({ status: true, message: "Logged out successfully.", data: categories.data });
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
  getPacdoraCategories,
  getPacdoraProducts
};

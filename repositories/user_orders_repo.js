"use strict";

const { knex } = require("../data/knex/index.js");
// const { v4: uuidv4 } = require("uuid");

const constants = {
  name: "user_orders",
  id1: "user_orders_id",
};

exports.createUserOrder = (object, { trx } = {}) => {
  // object[constants.id1] = uuidv4();
  return (trx || knex)(constants.name)
    .returning("*")
    .insert(object)
    .then((res) => {
      return res[0];
    })
    .catch((error) => {
      throw error;
    });
};


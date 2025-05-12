"use strict";

const { knex } = require("../data/knex/index.js");
// const { v4: uuidv4 } = require("uuid");

const constants = {
  name: "subscriptions",
  id1: "subscription_id",
};

exports.createSubscription = (object, { trx } = {}) => {
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

exports.getSubscriptions = () => {
  return knex(constants.name)
    .where({})
    .select("*")
    .catch((error) => {
      throw error;
    });
};

exports.getSubscriptionById = (subscription_id) => {
  console.log("getSubscriptionById subscription_id", subscription_id)
  return knex(constants.name)
    .where({subscription_id: subscription_id})
    .select("*")
    .first()
    .catch((error) => {
      throw error;
    });
};

"use strict";

const { knex } = require("../data/knex/index.js");
// const { v4: uuidv4 } = require("uuid");

const constants = {
  name: "user_subscriptions",
  id1: "user_subscription_id",
};

exports.createOrder = (object, { trx } = {}) => {
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

exports.getUserOrders = (userId) => {
  return knex(constants.name)
    .where({
      user_id: userId,
    })
    .select("*")
    .catch((error) => {
      throw error;
    });
};

exports.getSubscriptionByFilter = (filter) => {
  // console.log("getSubscriptionById subscription_id", subscription_id)
  return knex(constants.name)
    .where(filter)
    .select("*")
    .catch((error) => {
      throw error;
    });
};


exports.downloadDielineCount = (userId) => {
  return knex.select([
    knex(constants.name)
      .join(
        "subscriptions",
        "user_subscriptions.subscription_id",
        "subscriptions.subscription_id"
      )
      .where("user_subscriptions.user_id", userId)
      .sum("subscriptions.dieline_downloads")
      .as("allowed_downloads"),
    knex("dieline_downloads")
      .where("user_id", userId)
      .count("*")
      .as("used_downloads"),
  ])
  .first();
};

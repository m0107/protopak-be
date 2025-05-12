"use strict";

const { knex } = require("../data/knex/index.js");
const { v4: uuidv4 } = require("uuid");

const constants = {
  name: "dieline_downloads",
  id1: "dieline_downloads_id",
};

exports.createDielineDownloads = (object, { trx } = {}) => {
  object[constants.id1] = uuidv4();
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

exports.getDielineDownloads = () => {
  return knex(constants.name)
    .where({})
    .select("*")
    .catch((error) => {
      throw error;
    });
};

exports.getDielineDownloadsByFilter = (filter) => {
  console.log("getDielineDownloadsByFilter", filter)
  return knex(constants.name)
    .where(filter)
    .select("*")
    .catch((error) => {
      throw error;
    });
};

exports.getDielineDownloadById = (project_id) => {
  console.log("getDielineDownloadById project_id", project_id)
  return knex(constants.name)
    .where({project_id: project_id})
    .select("*")
    .first()
    .catch((error) => {
      throw error;
    });
};

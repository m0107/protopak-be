const path = require("path")

const knex = require("knex");
const knexfile = require("../../knexfile");


require("dotenv").config({ path: path.resolve(__dirname, "../.env") })

const env = process.env.APP_ENV || "development";
const configOptions = knexfile[env];
// console.log(configOptions, "configOptions");
module.exports = knex(configOptions);
const path = require("path")

const knexRead = require("knex");
const knexfile = require("../../knexfile");


require("dotenv").config({ path: path.resolve(__dirname, "../.env") })

const env = process.env.APP_ENV || "development";
const configOptions = JSON.parse(JSON.stringify(knexfile[env]));
configOptions.connection.host = process.env.DB_READER_HOST
// console.log(configOptions, "configOptions");
module.exports = knexRead(configOptions);
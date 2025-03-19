/* eslint-disable max-len */
require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const database = process.env.MONGODB_URL; // use this for cloud mongodb database connection

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// mongoose.set("strictQuery", false);

const connectDB = async () =>
  await new Promise((resolve, reject) =>
    mongoose
      .connect(database, options)
      .then((res) => {
        logger.info("🛢✔️  Successfully Connected MongoDB");
        return resolve(res);
      })
      .catch((err) => {
        logger.error("🛢 ❌ Error while connecting MongoDB", { err });
        return reject(err);
      })
  );

module.exports = connectDB;

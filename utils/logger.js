const winston = require("winston");
const ecsFormat = require("@elastic/ecs-winston-format");
// const { json } = require("body-parser");

// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  silly: 5,
};

const LEVELS = Object.keys(levels);

const LOG_LEVEL = process.env.LOG_LEVEL;

const level = () => (LEVELS.includes(LOG_LEVEL) ? LOG_LEVEL : "http");

const devLoggerFormat = winston.format.combine(
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `[${info.timestamp} ${info.level}]: ${JSON.stringify(info.message, null, "\t")}`)
);

const LOG_FORMATS = {
  ECS: ecsFormat(),
  JSON: winston.format.json(),
  PRETTY_PRINT: winston.format.prettyPrint(),
  DEV: devLoggerFormat,
};

// Create the logger instance that has to be exported
// and used to log messages.
const winstonLogger = winston.createLogger({
  level: level(),
  levels,
  // format: ecsFormat(),
  format: LOG_FORMATS[process.env.LOG_FORMAT || "ECS"] || LOG_FORMATS.ECS,
  // format: winston.format.json(),
  // format: winston.format.prettyPrint(),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
    // new winston.transports.File({
    //   filename: "winston_logs/error.log",
    //   level: "error",
    // }),
    // process.env.APP_ENV === "dev" && new winston.transports.File({ filename: "winston_logs/all.log" }),
  ],
});

function getlogged_line() {
  try {
    let logged_line = new Error().stack?.split("\n")[3];
    if (logged_line) {
      logged_line = logged_line.replace("    at", "").replace("(", "").replace(")", "");
      logged_line = logged_line.split(" ")[2] || logged_line.split(" ")[1];
      return logged_line;
    }
  } catch (error) {
    console.error("Error while using logger", error);
    //todo
  }
  return "";
}

const getAxiosError = (err) => err?.response?.data?.message || err?.data?.message || err?.message || err;

function jsonify(orginalData, level) {
  let data = orginalData;
  if (typeof data === "number") {
    if (data % 1 === 0) {
      data = { message_int: data };
    } else {
      data = { message_float: data };
    }
  } else if (typeof data === "string") {
    data = { message_string: data };
  } else if (typeof data === "boolean") {
    data = { message_bool: data };
  } else if (typeof data === "bigint") {
    data = { message_bint: data };
  } else if (data?.err) {
    if (!data?.errorMsg) data = { ...data, errorMsg: getAxiosError(data?.err) };
  } else if (level === "error") {
    // err stack can't be accessed in object
    const errorMsg = getAxiosError(data);
    const axiosError = data?.response?.data;
    // if error message can be found in stack, store message in object
    if (errorMsg) data = { ...data, errorMsg };
    // if axios error exists in erro but not in error object, add it
    if (!data?.axiosError && axiosError) data = { ...data, axiosError };
  } else if (level === "info" && data) {
    // hide credentials from logged objects
    data = JSON.parse(JSON.stringify(data)); // deep clone object
    const value = "hidden";
    // console.log("\n\n", data, "\n\n");

    if (data?.config) {
      if (data?.config?.headers) data.config.headers = value;
      if (data?.config?.data) {
        if (data?.config?.data?.oldPassword) data.config.data.oldPassword = value;
        if (data?.config?.data?.newPassword) data.config.data.newPassword = value;
        if (data?.config?.data?.password) data.config.data.password = value;
        if (data?.config?.data?.apiToken) data.config.data.apiToken = value;
        if (data?.config?.data?.masterPassword) data.config.data.masterPassword = value;
        if (data?.config?.data?.userPassword) data.config.data.userPassword = value;
        if (data?.config?.data?.merchantId) data.config.data.merchantId = value;
        if (data?.config?.data?.clientid) data.config.data.clientid = value;
        if (data?.config?.data?.clientSecretKey) data.config.data.clientSecretKey = value;
      }
    }
    if (data?.token) data.token = value;
    if (data?.password) data.password = value;
    if (data?.reqObj) {
      if (data.reqObj?.apiToken) data.reqObj.apiToken = value;
      if (data.reqObj?.password) data.reqObj.password = value;
      if (data.reqObj?.token) data.reqObj.token = value;
      if (data.reqObj?.secret_key) data.reqObj.secret_key = value;
    }
    if (data?.response) {
      if (data.response?.data) {
        if (data.response.data?.access_token) data.response.data.access_token = value;
        if (data.response.data?.terms) data.response.data.terms = value; // tiger exchange terms is a huge string
      }
    }
  }
  return data;
}
class logger {
  static error(message, data) {
    data = jsonify(data, "error");
    winstonLogger.error(message, { logged_at: getlogged_line(), data });
  }
  static warn(message, data) {
    data = jsonify(data, "warn");
    winstonLogger.warn(message, { logged_at: getlogged_line(), data });
  }
  static info(message, data) {
    data = jsonify(data, "info");
    winstonLogger.info(message, { logged_at: getlogged_line(), data });
  }
  static http(message, data) {
    data = jsonify(data, "http");
    winstonLogger.http(message, { logged_at: "express_http", data });
  }
  static debug(message, data) {
    data = jsonify(data, "debug");
    winstonLogger.debug(message, { logged_at: getlogged_line(), data });
  }
  static silly(message, data) {
    data = jsonify(data, "silly");
    winstonLogger.silly(message, { logged_at: getlogged_line(), data });
  }
}

module.exports = logger;

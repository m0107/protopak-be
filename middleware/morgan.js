const morgan = require("morgan");
const json = require("morgan-json");

const logger = require("../utils/logger");

const format = json({
  requestId: ":requestId",
  from: ":remote-addr",
  method: ":method",
  URL: ":url",
  status: ":status",
  contentLength: ":res[content-length]",
  responseTime: ":response-time",
});

const urlsToSkip = ["/health", "/favicon.ico", "/status"];
const methodsToSkip = ["OPTIONS"];

const skip = (req) => urlsToSkip.includes(req.url) || methodsToSkip.includes(req.method);
morgan.token("requestId", (req) => req.requestId);

const morganMiddleware = morgan(format, {
  stream: { write: (message) => logger.http("", JSON.parse(message)) },
  skip,
});

module.exports = morganMiddleware;

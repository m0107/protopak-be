const rateLimit = require("express-rate-limit");

const defaultOptions = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 create account requests per `window` (here, per 5 minute)
  message: "Too many requests received from this IP, please try again later!",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: function (req, res, next, options) {
    res.status(options.statusCode).json({ status: false, message: options.message, data: null });
  },
  keyGenerator: (req) => req?.ip + req?.url,
};

const limiters = {
  default: rateLimit(defaultOptions),
  sendotp: rateLimit({
    ...defaultOptions,
    windowMs: 1 * 60 * 1000,
    max: 2,
    message: "OTP has been sent recently, please try again later!",
    keyGenerator: (req) => req?.ip + req?.body?.phone_number,
  }),
  verifyotp: rateLimit({
    ...defaultOptions,
    windowMs: 1 * 60 * 1000,
    max: 3,
    message: "OTP verification was attempted too many times, please try again later!",
    keyGenerator: (req) => req?.ip + req?.body?.phone_number,
  }),
  register: rateLimit({
    ...defaultOptions,
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: "Registration was attempted too many times, please try again later!",
    keyGenerator: (req) => req?.ip + req?.body?.phone_number + req?.body?.username,
  }),
};

// endpoint wihout "/"
const routesToIgnore = ["getbalance", "banners"];

// don't initialise rateLimit function inside middleware. it'll reset the limiter every time endpoint is called

const expressRateLimit = (req, res, next) => {
  const url = req.url || "";

  const routeKey = url.toLowerCase().replace("/", "");

  if (routesToIgnore.includes(routeKey)) return next();

  // check if a rate limiter is configured for route, if not use the default limiter
  const limitExists = limiters[routeKey] || limiters.default;

  if (!limitExists) return next();

  return limitExists(req, res, next);
};

module.exports = expressRateLimit;

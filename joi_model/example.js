const Joi = require("joi");

const DemoAccount = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  platform_id: Joi.string().uuid({ version: ["uuidv4"] }),
  description: Joi.string().optional().allow(""),
});

module.exports = DemoAccount;

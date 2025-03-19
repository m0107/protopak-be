const Joi = require("joi");
 
const adminUserSchema = Joi.object({
  username: Joi.string().min(3).max(10),
  old_password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  cnf_password: Joi.ref("password"),
  role_id: Joi.string().uuid({ version: ["uuidv4"] }),
}).with("password", "cnf_password");

module.exports = adminUserSchema;

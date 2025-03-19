const Joi = require("joi");

const NOTIFICATION_STATUS = {
  READ: "read",
  UNREAD: "unread",
  DISMISSED: "dismissed",
};

const NotificationModel = Joi.object({
  status: Joi.string()
    .valid(NOTIFICATION_STATUS.READ, NOTIFICATION_STATUS.UNREAD, NOTIFICATION_STATUS.DISMISSED)
    .required(),
  title: Joi.string().required(),
  message: Joi.string().required(),
  transaction_status: Joi.string().optional().allow(""),
  transaction_type: Joi.string().optional().allow(""),
  user_id: Joi.string()
    .uuid({ version: ["uuidv4"] })
    .required(),
  transaction_id: Joi.string()
    .uuid({ version: ["uuidv4"] })
    .optional(),
});

const NotificationRequestModel = Joi.object({
  status: Joi.string()
    .valid(NOTIFICATION_STATUS.READ, NOTIFICATION_STATUS.UNREAD, NOTIFICATION_STATUS.DISMISSED)
    .required(),
  notification_id: Joi.string()
    .uuid({ version: ["uuidv4"] })
    .required(),
});

module.exports = { NotificationModel, NOTIFICATION_STATUS, NotificationRequestModel };

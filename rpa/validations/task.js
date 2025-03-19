const Joi = require("joi");

const Types = {
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
  CREATE_USER: "create_user",
  CHANGE_USER_PASSWORD: "change_user_password",
  DEPOSIT_BONUS: "bonus_deposit",
  // PL_CLEAR: "pl_clear",
};

const TaskJoiModel = Joi.object({
  // office: Joi.string().required(),
  transactionId: Joi.string().required(),
  platform: Joi.string().required(),
  agentName: Joi.string().required(),
  agentPassword: Joi.string().required(),
  agentTransactionPassword: Joi.string().required(),
  status: Joi.string().required(),
  operationsType: Joi.string()
    .valid(
      Types.DEPOSIT,
      Types.WITHDRAW,
      Types.CREATE_USER,
      Types.CHANGE_USER_PASSWORD,
      Types.DEPOSIT_BONUS
      // Types.PL_CLEAR
    )
    .required(),
  operationalData: Joi.object().optional(),
})
  .when(Joi.object({ operationsType: Types.DEPOSIT }).unknown(), {
    then: Joi.object().append({
      operationalData: Joi.object({
        depositRemark: Joi.string().allow("").required(),
        depositAmount: Joi.string().required(),
        username: Joi.string().required(),
      }).required(),
    }),
  })
  .when(Joi.object({ operationsType: Types.WITHDRAW }).unknown(), {
    then: Joi.object().append({
      operationalData: Joi.object({
        withdrawlRemark: Joi.string().allow("").required(),
        username: Joi.string().required(),
        withdrawlAmount: Joi.string().required(),
      }).required(),
    }),
  })
  .when(Joi.object({ operationsType: Types.CREATE_USER }).unknown(), {
    then: Joi.object().append({
      operationalData: Joi.object({
        depositRemark: Joi.string().allow("").required(),
        username: Joi.string().required(),
        personalDetails: {
          clientName: Joi.string().required(),
          clientPassword: Joi.string().required(),
          clientFullName: Joi.string().required(),
          clientCity: Joi.string().allow("").required(),
          clientPhone: Joi.string().allow("").required(),
          displayName: Joi.string().allow("").optional(),
        },
        accountDetails: {
          accountType: Joi.string().allow("").required(),
          creditReference: Joi.string().allow("").required(),
          exposerLimit: Joi.string().allow("").required(),
        },
        commissionSettings: Joi.object().optional(),
        partnership: Joi.object().optional(),
        depositAmount: Joi.string().required(),
        depositId: Joi.string().required(),
      }).required(),
    }),
  })
  .when(Joi.object({ operationsType: Types.CHANGE_USER_PASSWORD }).unknown(), {
    then: Joi.object().append({
      operationalData: Joi.object({
        username: Joi.string().required(),
        userNewPassword: Joi.string().required(),
      }).required(),
    }),
  });

module.exports = TaskJoiModel;

const mongoose = require("mongoose");

const { Schema } = mongoose;

const operationsQueueSchema = new Schema(
  {
    // office: { type: id, default: null },
    transactionId: {
      type: String,
      index: true,
      unique: true,
    },
    platformUserId: { type: String },
    platform: { type: String },
    agentName: { type: String },
    agentPassword: { type: String },
    agentTransactionPassword: { type: String },
    status: { type: String },
    platformId: { type: String, },
    agentId: { type: String },
    operationsType: { type: String },
    operationalData: {
      depositRemark: { type: String },
      depositAmount: { type: String },
      depositId: { type: String },
      username: { type: String },
      userNewPassword: { type: String },
      withdrawlRemark: { type: String },
      withdrawlAmount: { type: String },
      personalDetails: {
        clientName: { type: String },
        clientPassword: { type: String },
        clientNewPassword: { type: String },
        clientFullName: { type: String },
        clientCity: { type: String },
        clientPhone: { type: String },
        displayName: { type: String },
      },
      accountDetails: {
        accountType: { type: String },
        creditReference: { type: String },
        exposerLimit: { type: String },
      },
      commissionSettings: { any: Object },
      partnership: { any: Object },
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

const OperationsQueue = mongoose.model("OperationsQueue", operationsQueueSchema);
module.exports = OperationsQueue;

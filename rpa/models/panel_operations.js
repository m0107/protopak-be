const mongoose = require("mongoose");

const { Schema } = mongoose;

const panelOperations = new Schema(
  {
    transaction_id: { type: String, required: true },
    agent_id: { type: String, required: true },
    source_id: { type: String, required: true },
    date: { type: String, required: true },
    username: { type: String, required: true },
    operation_type: { type: String, required: true }, // deposit, withdraw
    transaction_type: { type: String, required: true }, // approve, reject
    status: { type: String, required: true },
    message: { type: String },
    utr_id: { type: String },
    logs: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const PanelOperations = mongoose.model("panel_operations", panelOperations);
module.exports = PanelOperations;

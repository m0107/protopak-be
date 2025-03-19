const mongoose = require("mongoose");

const { Schema } = mongoose;

const agentSchema = new Schema(
  {
    agent_name: { type: String },
    platform_id: { type: Schema.Types.ObjectId, ref: "Platform" },
    // office_id: { type: Schema.Types.ObjectId, ref: "Office" },
    is_deleted: { type: Boolean, default: false },
    is_locked: { type: Boolean, default: false },
    created_by: { type: String },
    updated_by: { type: String },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

const Agent = mongoose.model("Agent", agentSchema);
module.exports = Agent;

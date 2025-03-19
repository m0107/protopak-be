const mongoose = require("mongoose");

const { Schema } = mongoose;

const platformSchema = new Schema(
  {
    platform_name: { type: String, unique: true },
    platform_url: { type: String, default: null },
    is_deleted: { type: Boolean, default: false },
    is_locked: { type: Boolean, default: false },
    is_multi_login: { type: Boolean, default: false },
    max_request: { type: Number, default: 10 },
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

const Platform = mongoose.model("Platform", platformSchema);
module.exports = Platform;

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const gameSessionSchema = new Schema(
  {
    userId: { type: String, required: true },
    reference_id: { type: Schema.Types.ObjectId, ref: "user", required: true },
    startedAt: { type: Date, default: Date.now, required: true },
    device: { type: String },
    ip: { type: String },
    balance: { type: Number },
  },
  { timestamps: false }
);


const GameSessions = model("game_sessions", gameSessionSchema);
module.exports = GameSessions;

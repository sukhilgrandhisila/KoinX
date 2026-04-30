const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true },
    source: { type: String, enum: ["user", "exchange"], required: true },

    timestamp: { type: Date },
    type: { type: String },
    asset: { type: String },
    quantity: { type: Number },

    price_usd: { type: Number },
    fee: { type: Number },
    note: { type: String },

    status: {
      type: String,
      enum: ["valid", "invalid"],
      default: "valid"
    },

    errorReason: { type: String, default: null }
  },
  { timestamps: true }
);

transactionSchema.index(
  { transactionId: 1, source: 1 },
  { unique: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
const mongoose = require("mongoose");

const reconciliationSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true },

    userTxId: { type: String, default: null },
    exchangeTxId: { type: String, default: null },

    category: {
      type: String,
      enum: [
        "MATCHED",
        "CONFLICTING",
        "UNMATCHED_USER",
        "UNMATCHED_EXCHANGE"
      ]
    },

    reason: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reconciliation", reconciliationSchema);

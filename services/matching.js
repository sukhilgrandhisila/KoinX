const Transaction = require("../model/transaction");
const Reconciliation = require("../model/reconciliation");
const { v4: uuidv4 } = require("uuid");


function isSameType(userType, exchangeType) {
  if (userType === exchangeType) return true;

  if (
    (userType === "TRANSFER_OUT" && exchangeType === "TRANSFER_IN") ||
    (userType === "TRANSFER_IN" && exchangeType === "TRANSFER_OUT")
  ) {
    return true;
  }

  return false;
}

async function runMatching(config = {}) {
  const runId = uuidv4();

  const TIME_TOLERANCE =
    config.timeTolerance ||
    Number(process.env.TIMESTAMP_TOLERANCE_SECONDS) ||
    300;

  const QTY_TOLERANCE =
    config.qtyTolerance ||
    Number(process.env.QUANTITY_TOLERANCE_PCT) ||
    0.01;

  const users = await Transaction.find({
    source: "user",
    status: "valid"
  });

  const exchanges = await Transaction.find({
    source: "exchange",
    status: "valid"
  });

  const usedExchange = new Set();
  const results = [];

  for (let user of users) {
    let bestExchange = null;
    let bestScore = Infinity;
    let category = null;
    let reason = "";

    for (let exchange of exchanges) {
      const exId = exchange._id.toString();
      if (usedExchange.has(exId)) continue;

      if (user.asset !== exchange.asset) continue;
      if (!isSameType(user.type, exchange.type)) continue;

      if (!user.timestamp || !exchange.timestamp) continue;
      if (!exchange.quantity || exchange.quantity === 0) continue;

      const timeDiff =
        Math.abs(user.timestamp - exchange.timestamp) / 1000;

      const qtyDiff =
        Math.abs(user.quantity - exchange.quantity) /
        exchange.quantity;

      const score =
        timeDiff / TIME_TOLERANCE +
        qtyDiff / QTY_TOLERANCE;

      if (score < bestScore) {
        bestScore = score;
        bestExchange = exchange;

        if (
          timeDiff <= TIME_TOLERANCE &&
          qtyDiff <= QTY_TOLERANCE
        ) {
          category = "MATCHED";
          reason = "Within tolerance";
        } else {
          category = "CONFLICTING";
          reason = "Outside tolerance";
        }
      }
    }

    if (bestExchange) {
      results.push({
        runId,
        userTx: user,
        exchangeTx: bestExchange,

        category,
        reason
      });

      usedExchange.add(bestExchange._id.toString());
    } else {
      results.push({
        runId,
        userTx: user,
        exchangeTx: null,
        category: "UNMATCHED_USER",
        reason: "No matching exchange transaction"
      });
    }
  }

  for (let exchange of exchanges) {
    if (!usedExchange.has(exchange._id.toString())) {
      results.push({
        runId,
        userTx: null,
        exchangeTx: exchange,
        category: "UNMATCHED_EXCHANGE",
        reason: "No matching user transaction"
      });
    }
  }

  await Reconciliation.insertMany(results);

  return runId;
}

module.exports = { runMatching };
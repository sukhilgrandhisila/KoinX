const fs = require("fs");
const csv = require("csv-parser");
const Transaction = require("../model/transaction");

function normalizeAsset(asset) {
  if (!asset) return null;

  const map = {
    bitcoin: "BTC",
    btc: "BTC",
    eth: "ETH"
  };

  return map[asset.toLowerCase()] || asset.toUpperCase();
}

function validateRow(row) {
  const parsedDate = new Date(row.timestamp);

  if (!row.timestamp || isNaN(parsedDate.getTime())) {
    return "Invalid timestamp";
  }

  if (!row.quantity || Number(row.quantity) <= 0) {
    return "Invalid quantity";
  }

  if (!row.type) {
    return "Missing type";
  }

  return null;
}

function ingestCSV(filePath, source) {
  return new Promise((resolve, reject) => {
    const bulkOps = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const error = validateRow(row);
        let parsedDate = null;
        if (row.timestamp) {
          const tempDate = new Date(row.timestamp);
          if (!isNaN(tempDate.getTime())) {
            parsedDate = tempDate;
          }
        }

        const transaction = {
          transactionId: row.transaction_id,
          source: source,

          timestamp: parsedDate,
          type: row.type,
          asset: normalizeAsset(row.asset),
          quantity: Number(row.quantity),

          price_usd: Number(row.price_usd) || null,
          fee: Number(row.fee) || null,
          note: row.note,

          status: error ? "invalid" : "valid",
          errorReason: error
        };

        bulkOps.push({
          updateOne: {
            filter: {
              transactionId: row.transaction_id,
              source: source
            },
            update: { $set: transaction },
            upsert: true
          }
        });
      })
      .on("end", async () => {
        try {
          if (bulkOps.length > 0) {
            await Transaction.bulkWrite(bulkOps);
          }
          console.log(`${source} CSV inserted`);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on("error", reject);
  });
}

module.exports = { ingestCSV };
require("dotenv").config();

const connectDB = require(".//config/db");
const { runMatching } = require("./services/matching");

async function main() {
  await connectDB();

  const runId = await runMatching();

  console.log("Reconciliation completed:", runId);
  process.exit();
}

main();
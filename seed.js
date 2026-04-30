require("dotenv").config();
const path = require("path");
const connectDB = require("./config/db");
const { ingestCSV } = require("./services/ingestion");

async function seed() {
    try {
        await connectDB();

        await ingestCSV(
            path.join(__dirname, "data/user_transactions.csv"),
            "user"
        );

        await ingestCSV(
            path.join(__dirname, "data/exchange_transactions.csv"),
            "exchange"
        );

        console.log("Data inserted successfully");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
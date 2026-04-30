require("dotenv").config()
const express = require("express");
const app = express()
const connectDB = require("./config/db");

connectDB()
app.use(express.json());

app.use("/",require("./routes/reconciliation.routes"))

app.listen(3000,() => {
    console.log(`Server running on port ${3000}`)
})


# 💰 KoinX Reconciliation Engine

A backend service for reconciling cryptocurrency transactions between user records and exchange data. It identifies matched, conflicting, and unmatched transactions and generates detailed reports.

---

## 🚀 Overview

The **KoinX Reconciliation Engine** processes transaction data from two sources:

* User transactions
* Exchange transactions

It compares them and categorizes results into:

* MATCHED
* CONFLICTING
* UNMATCHED_USER
* UNMATCHED_EXCHANGE

The system also provides reporting APIs for analysis.

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose

---

## ⚙️ Installation

1. Clone the repository:

   ```
   git clone <your-repo-url>
   cd koinx-reconciliation-engine
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create `.env` file:

   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```

4. Run the server:

   ```
   npm start
   ```

---

## 🌐 API Endpoints

### Base URL

```
/api/reconciliation
```

---

### 🔹 1. Run Reconciliation

**POST** `/reconcile`

Triggers reconciliation between user and exchange transactions.

#### Response

```json
{
  "message": "Reconciliation completed",
  "runId": "abc123"
}
```

---

### 🔹 2. Get Full Report

**GET** `/report/:runId`

Fetches complete reconciliation results for a specific run.

#### Response

```json
{
  "runId": "abc123",
  "results": [ ... ]
}
```

---

### 🔹 3. Get Summary

**GET** `/report/:runId/summary`

Returns summarized counts of reconciliation categories.

#### Response

```json
{
  "MATCHED": 120,
  "CONFLICTING": 10,
  "UNMATCHED_USER": 5,
  "UNMATCHED_EXCHANGE": 8
}
```

---

### 🔹 4. Get Unmatched Transactions

**GET** `/report/:runId/unmatched`

Fetches only unmatched transactions.

#### Response

```json
{
  "unmatched": [ ... ]
}
```

---

## 🗄️ Database Schema

### 📌 Transaction Model

Stores both user and exchange transactions.

```json
{
  "transactionId": "txn_001",
  "source": "user",
  "timestamp": "2026-04-30T10:00:00Z",
  "type": "BUY",
  "asset": "BTC",
  "quantity": 0.5,
  "price_usd": 30000,
  "fee": 10,
  "note": "Sample transaction",
  "status": "valid",
  "errorReason": null
}
```

#### Key Points:

* `source`: distinguishes **user** vs **exchange**
* Unique index on `(transactionId + source)`
* Invalid records are flagged with `status = "invalid"`

---

### 📌 Reconciliation Model

Stores reconciliation results.

```json
{
  "runId": "abc123",
  "userTxId": "txn_001",
  "exchangeTxId": "txn_001",
  "category": "MATCHED",
  "reason": "All fields matched"
}
```

#### Categories:

* MATCHED → Perfect match
* CONFLICTING → Same transaction but mismatched data
* UNMATCHED_USER → Exists only in user data
* UNMATCHED_EXCHANGE → Exists only in exchange data

---

## 🔍 How It Works

1. Transactions are stored in MongoDB.
2. Reconciliation process compares:

   * transactionId
   * amount, price, etc.
3. Results are saved in the reconciliation collection.
4. Reports are generated using `runId`.

---

## 🧪 Testing

Use tools like:

* Postman
* Thunder Client
* curl

---

## ⚠️ Important Notes

* Ensure MongoDB is connected before running reconciliation
* Validate transaction data before inserting
* Handle duplicate transaction IDs properly
* Use indexing for performance

---

## ✨ Author

Sukhil Grandhisila

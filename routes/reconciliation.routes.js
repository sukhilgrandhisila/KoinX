const express = require("express");
const router = express.Router();

const {
  reconcile,
  getReport,
  getSummary,
  getUnmatched
} = require("../controller/reconciliation.controller");

router.post("/reconcile", reconcile);
router.get("/report/:runId", getReport);
router.get("/report/:runId/summary", getSummary);
router.get("/report/:runId/unmatched", getUnmatched);

module.exports = router;
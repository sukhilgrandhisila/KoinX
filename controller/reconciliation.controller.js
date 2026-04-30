const { runMatching } = require("../services/matching");
const Reconciliation = require("../model/reconciliation");

async function reconcile(req, res) {
  try {
    const runId = await runMatching(req.body);
    res.json({ runId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getReport(req, res) {
  try {
    const data = await Reconciliation.find({ runId: req.params.runId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSummary(req, res) {
  try {
    const data = await Reconciliation.find({ runId: req.params.runId });

    const summary = {
      matched: 0,
      conflicting: 0,
      unmatchedUser: 0,
      unmatchedExchange: 0
    };

    for (let d of data) {
      if (d.category === "MATCHED") summary.matched++;
      else if (d.category === "CONFLICTING") summary.conflicting++;
      else if (d.category === "UNMATCHED_USER") summary.unmatchedUser++;
      else if (d.category === "UNMATCHED_EXCHANGE") summary.unmatchedExchange++;
    }

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUnmatched(req, res) {
  try {
    const data = await Reconciliation.find({
      runId: req.params.runId,
      category: { $in: ["UNMATCHED_USER", "UNMATCHED_EXCHANGE"] }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  reconcile,
  getReport,
  getSummary,
  getUnmatched
};
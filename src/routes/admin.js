const express = require("express");
const router = express.Router();
const ensureAdminToken = require("../middleware/adminAuth");
const {
  getAllEnvironments,
  updateEnvironmentAlias,
  getSurveysByEnvironment,
  updateSurveySlug,
  refreshSurveyCache,
} = require("../services/formbricks");

router.use(ensureAdminToken);

router.post("/sync", async (req, res) => {
  try {
    await refreshSurveyCache();
    res.json({ status: "ok", message: "Surveys synced successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/environments", (req, res) => {
  try {
    const environments = getAllEnvironments();
    res.json({ environments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/environments/:id/alias", (req, res) => {
  const { id } = req.params;
  const { alias } = req.body;

  if (!alias) {
    return res.status(400).json({ error: "Alias is required" });
  }

  try {
    updateEnvironmentAlias(id, alias);
    res.json({ status: "ok" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/environments/:id/surveys", (req, res) => {
  const { id } = req.params;
  try {
    const surveys = getSurveysByEnvironment(id);
    res.json({ surveys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/surveys/:id/slug", (req, res) => {
  const { id } = req.params;
  const { slug } = req.body;

  try {
    const success = updateSurveySlug(id, slug);
    if (success) {
      res.json({ status: "ok" });
    } else {
      res.status(404).json({ error: "Survey not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

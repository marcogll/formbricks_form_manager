const axios = require("axios");
const db = require("../db");

// --- Prepared Statements ---

const upsertEnvironmentStmt = db.prepare(`
  INSERT INTO environment_aliases (environment_id)
  VALUES (?)
  ON CONFLICT(environment_id) DO NOTHING
`);

const upsertSurveyStmt = db.prepare(`
  INSERT INTO surveys (id, environment_id, name, type, updated_at)
  VALUES (@id, @environmentId, @name, @type, datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    environment_id = excluded.environment_id,
    name = excluded.name,
    type = excluded.type,
    updated_at = datetime('now')
`);

const selectAliasStmt = db.prepare(`
  SELECT alias FROM environment_aliases WHERE environment_id = ?
`);

const selectEnvByAliasStmt = db.prepare(`
  SELECT environment_id FROM environment_aliases WHERE alias = ?
`);

const selectSurveyStmt = db.prepare(`
  SELECT id, type, custom_slug FROM surveys WHERE environment_id = ? AND (name = ? OR custom_slug = ?)
`);

const selectAllEnvsStmt = db.prepare(`
  SELECT * FROM environment_aliases ORDER BY created_at DESC
`);

const updateAliasStmt = db.prepare(`
  UPDATE environment_aliases SET alias = ?, updated_at = datetime('now') WHERE environment_id = ?
`);

const selectSurveysByEnvStmt = db.prepare(`
  SELECT id, name, type, custom_slug FROM surveys WHERE environment_id = ? ORDER BY name ASC
`);

// --- Helper Functions ---

async function fetchSurveysFromAPI() {
  if (!process.env.FORMBRICKS_API_KEY) {
    throw new Error(
      "FORMBRICKS_API_KEY is not defined in environment variables."
    );
  }
  if (!process.env.FORMBRICKS_SDK_URL) {
    throw new Error(
      "FORMBRICKS_SDK_URL is not defined in environment variables."
    );
  }

  try {
    const response = await axios.get(
      `${process.env.FORMBRICKS_SDK_URL}/api/v1/management/surveys`,
      {
        headers: {
          "x-api-key": process.env.FORMBRICKS_API_KEY,
        },
      }
    );

    return Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (error) {
    console.error(
      "Failed to fetch surveys from Formbricks API:",
      error.message
    );
    throw new Error("Could not fetch surveys from Formbricks API.");
  }
}

async function refreshSurveyCache() {
  try {
    console.log("Fetching surveys from Formbricks API...");
    const surveys = await fetchSurveysFromAPI();
    let synced = 0;

    const dbTransaction = db.transaction((surveys) => {
      for (const survey of surveys) {
        if (!survey?.id || !survey?.environmentId) {
          continue;
        }

        // Ensure environment exists
        upsertEnvironmentStmt.run(survey.environmentId);

        // Upsert survey
        upsertSurveyStmt.run({
          id: survey.id,
          environmentId: survey.environmentId,
          name: survey.name || survey.id,
          type: survey.type || "link",
        });

        synced += 1;
      }
    });

    dbTransaction(surveys);
    console.log(`Successfully synced ${synced} surveys into the database.`);
  } catch (error) {
    console.error("Failed to refresh survey cache:", error.message);
  }
}

// --- Exported Functions ---

function getAllEnvironments() {
  return selectAllEnvsStmt.all();
}

function updateEnvironmentAlias(environmentId, alias) {
  try {
    const result = updateAliasStmt.run(alias, environmentId);
    return result.changes > 0;
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new Error("Alias already in use");
    }
    throw error;
  }
}

function getSurveysByEnvironment(environmentId) {
  return selectSurveysByEnvStmt.all(environmentId);
}

function getSurveyIdByAlias(rootAlias, surveyName) {
  const env = selectEnvByAliasStmt.get(rootAlias);
  if (!env) return null;

  const survey = selectSurveyStmt.get(
    env.environment_id,
    surveyName,
    surveyName
  );
  return survey
    ? {
        surveyId: survey.id,
        environmentId: env.environment_id,
        type: survey.type,
      }
    : null;
}

function updateSurveySlug(surveyId, customSlug) {
  try {
    const stmt = db.prepare(`
      UPDATE surveys SET custom_slug = ?, updated_at = datetime('now') WHERE id = ?
    `);
    const result = stmt.run(customSlug || null, surveyId);
    return result.changes > 0;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  refreshSurveyCache,
  fetchSurveysFromAPI,
  getAllEnvironments,
  updateEnvironmentAlias,
  getSurveysByEnvironment,
  getSurveyIdByAlias,
  updateSurveySlug,
};

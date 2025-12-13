const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const defaultDbPath = path.join(__dirname, "..", "data", "survey_mappings.db");
const dbPath = process.env.SQLITE_DB_PATH || defaultDbPath;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS survey_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project TEXT NOT NULL,
    partner TEXT NOT NULL,
    survey_name TEXT NOT NULL,
    survey_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project, partner, survey_name)
  );

  CREATE TABLE IF NOT EXISTS environment_aliases (
    environment_id TEXT PRIMARY KEY,
    alias TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,
    environment_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'link',
    custom_slug TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'sudoku.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS game_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_type TEXT NOT NULL DEFAULT 'sudoku-6x6',
    time_seconds INTEGER,
    hints_used INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    played_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_game_results_user ON game_results(user_id);
  CREATE INDEX IF NOT EXISTS idx_game_results_type ON game_results(game_type);
`);

module.exports = db;

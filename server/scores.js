const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  const { game_type, time_seconds, hints_used, errors, completed } = req.body;
  if (!game_type) {
    return res.status(400).json({ error: 'game_type is required' });
  }

  const result = db.prepare(`
    INSERT INTO game_results (user_id, game_type, time_seconds, hints_used, errors, completed)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, game_type, time_seconds || 0, hints_used || 0, errors || 0, completed ? 1 : 0);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.get('/me', authMiddleware, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const results = db.prepare(`
    SELECT * FROM game_results
    WHERE user_id = ?
    ORDER BY played_at DESC
    LIMIT ? OFFSET ?
  `).all(req.user.id, limit, offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM game_results WHERE user_id = ?').get(req.user.id).count;

  const stats = db.prepare(`
    SELECT
      COUNT(*) as games_played,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as games_won,
      MIN(CASE WHEN completed = 1 THEN time_seconds END) as best_time,
      ROUND(AVG(CASE WHEN completed = 1 THEN time_seconds END)) as avg_time,
      ROUND(AVG(errors), 1) as avg_errors,
      ROUND(AVG(hints_used), 1) as avg_hints
    FROM game_results WHERE user_id = ?
  `).get(req.user.id);

  res.json({ results, stats, total, page });
});

router.get('/leaderboard', (req, res) => {
  const gameType = req.query.game || 'sudoku-6x6';
  const rows = db.prepare(`
    SELECT u.username, u.display_name, g.time_seconds, g.hints_used, g.errors, g.played_at
    FROM game_results g
    JOIN users u ON g.user_id = u.id
    WHERE g.game_type = ? AND g.completed = 1
    ORDER BY g.time_seconds ASC, g.errors ASC
    LIMIT 10
  `).all(gameType);

  res.json(rows);
});

module.exports = router;

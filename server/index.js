const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: authRouter } = require('./auth');
const scoresRouter = require('./scores');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRouter);
app.use('/api/scores', scoresRouter);

app.listen(PORT, () => {
  console.log(`Sudoku server running at http://localhost:${PORT}`);
});

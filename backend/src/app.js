const express = require('express');
const cors = require('cors');
const dictionariesRouter = require('./routes/dictionaries');

const app = express();
app.use(cors());
app.use('/api/dictionaries', dictionariesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

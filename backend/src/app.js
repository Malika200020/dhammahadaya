const express = require('express');
const cors = require('cors');
const sessionMiddleware = require('./session');
const { requireAdminAuth } = require('./middleware/requireAdminAuth');

const dictionariesRouter = require('./routes/dictionaries');
const tripitakaCatalogueRouter = require('./routes/tripitaka-catalogue');
const entriesRouter = require('./routes/entries');
const adminAuthRouter = require('./routes/admin-auth');
const adminEntriesRouter = require('./routes/admin-entries');
const adminUploadsRouter = require('./routes/admin-uploads');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(sessionMiddleware);

if ((process.env.STORAGE_DRIVER || 'local') === 'local') {
  const { UPLOAD_DIR } = require('./storage/localStorage');
  app.use('/uploads', express.static(UPLOAD_DIR));
}

app.use('/api/dictionaries', dictionariesRouter);
app.use('/api/tripitaka-catalogue', tripitakaCatalogueRouter);
app.use('/api/entries', entriesRouter);

app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/entries', requireAdminAuth, adminEntriesRouter);
app.use('/api/admin/uploads', requireAdminAuth, adminUploadsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

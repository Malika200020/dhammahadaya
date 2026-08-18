const express = require('express');
const { getStatus } = require('../whatsapp');

const router = express.Router();

// GET /api/admin/whatsapp/status — { enabled, status, qr }. status is one
// of disabled | initializing | qr | linked | auth-failure | disconnected.
// qr is a data: URL image, present only while status === 'qr'.
router.get('/status', (req, res) => {
  res.json(getStatus());
});

module.exports = router;

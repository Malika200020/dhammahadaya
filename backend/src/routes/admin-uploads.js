const express = require('express');
const multer = require('multer');
const storage = require('../storage');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  },
});

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required' });
    const { url, key } = await storage.saveFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.status(201).json({ url, key });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

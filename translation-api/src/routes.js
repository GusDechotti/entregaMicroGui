const express = require('express');
const { createTranslation, getTranslationStatus } = require('./controller');
const router = express.Router();

router.post('/translations', createTranslation);
router.get('/translations/:requestId', getTranslationStatus);

module.exports = router;
const Translation = require('./models/translation');
const { publishToQueue } = require('./messageBroker');

const createTranslation = async (req, res) => {
  const { text, sourceLanguage, targetLanguage } = req.body;
  if (!text || !sourceLanguage || !targetLanguage) {
    return res.status(400).json({ error: 'Fields text, sourceLanguage, and targetLanguage are required.' });
  }

  try {
    const newTranslation = new Translation({
      originalText: text,
      sourceLanguage,
      targetLanguage,
    });
    await newTranslation.save();

    const message = { requestId: newTranslation._id.toString() };
    await publishToQueue('translation_requests', JSON.stringify(message));

    return res.status(202).json({
      message: 'Translation request received.',
      requestId: newTranslation._id,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTranslationStatus = async (req, res) => {
  try {
    const translation = await Translation.findById(req.params.requestId);
    if (!translation) {
      return res.status(404).json({ error: 'Translation request not found.' });
    }
    return res.status(200).json(translation.toJSON());
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { createTranslation, getTranslationStatus };
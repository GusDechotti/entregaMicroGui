const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  originalText: { type: String, required: true },
  translatedText: { type: String },
  sourceLanguage: { type: String, required: true },
  targetLanguage: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
  },
  errorMessage: { type: String },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.requestId = ret._id; // Renomeia _id para requestId na resposta
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Translation = mongoose.model('Translation', translationSchema);
module.exports = Translation;
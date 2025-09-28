const { extractTextFromPDF, extractTextFromDOCX, extractUserInfo } = require('../services/resumeParser');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const text = req.file.mimetype === 'application/pdf' 
      ? await extractTextFromPDF(req.file.buffer)
      : await extractTextFromDOCX(req.file.buffer);
    res.json({ userInfo: extractUserInfo(text), extractedText: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

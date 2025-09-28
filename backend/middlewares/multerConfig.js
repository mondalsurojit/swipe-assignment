const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are allowed'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};

exports.extractTextFromDOCX = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

exports.extractUserInfo = (text) => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+/m;

  return {
    name: text.match(nameRegex)?.[0] || '',
    email: text.match(emailRegex)?.[0] || '',
    phone: text.match(phoneRegex)?.[0] || ''
  };
};

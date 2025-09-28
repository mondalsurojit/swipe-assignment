const express = require('express');
const router = express.Router();
const upload = require('./middlewares/multerConfig');
const errorHandler = require('./middlewares/errorHandler');

const fileController = require('./controllers/fileController');
const candidateController = require('./controllers/candidateController');
const interviewController = require('./controllers/interviewController');

// Auth / Referral
router.post('/api/verify-token', candidateController.verifyTokenHandler);
router.post('/api/validate-referral', candidateController.validateReferral);

// Resume Upload
router.post('/api/upload-resume', upload.single('resume'), fileController.uploadResume);

// Interview Flow
router.post('/api/start-interview', interviewController.startInterview);
router.post('/api/submit-answer', interviewController.submitAnswer);
router.post('/api/terminate-interview', interviewController.terminateInterview);

// Candidate Data
router.get('/api/session/:sessionId', candidateController.getSession);
router.get('/api/candidates', candidateController.getCandidates);
router.get('/api/candidate/:sessionId', candidateController.getCandidate);
router.post('/api/update-user-info', candidateController.updateUserInfo);

// Error handler
router.use(errorHandler);

module.exports = router;

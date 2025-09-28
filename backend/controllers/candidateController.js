const { verifyToken } = require('../services/firebaseService');

const referralCodes = ['SWIPE2024', 'INTERN123', 'DEMO2024'];
const candidates = [];
const sessions = [];

exports.validateReferral = (req, res) => {
  const { code } = req.body;
  res.json({ valid: referralCodes.includes(code) });
};

exports.verifyTokenHandler = async (req, res) => {
  try {
    const decoded = await verifyToken(req.body.token);
    res.json({ valid: true, uid: decoded.uid, email: decoded.email });
  } catch {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
};

exports.getCandidates = (req, res) => {
  const { search, sortBy='finalScore', order='desc' } = req.query;
  let filtered = [...candidates];
  if (search) filtered = filtered.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));
  filtered.sort((a,b)=> order==='desc'? (b[sortBy]||0)-(a[sortBy]||0):(a[sortBy]||0)-(b[sortBy]||0));
  res.json(filtered);
};

exports.getCandidate = (req,res) => {
  const cand = candidates.find(c=>c.sessionId===req.params.sessionId);
  if(!cand) return res.status(404).json({ error:'Candidate not found' });
  res.json(cand);
};

exports.getSession = (req,res) => {
  const session = sessions.find(s=>s.sessionId===req.params.sessionId);
  if(!session) return res.status(404).json({ error:'Session not found' });
  res.json(session);
};

exports.updateUserInfo = (req,res) => {
  const { sessionId, userInfo } = req.body;
  const session = sessions.find(s=>s.sessionId===sessionId);
  if(session) session.userInfo = { ...session.userInfo, ...userInfo };
  res.json({ success:true });
};

module.exports.sessions = sessions;
module.exports.candidates = candidates;

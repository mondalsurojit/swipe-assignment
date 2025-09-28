const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.verifyToken = async (token) => {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    throw new Error('Invalid token');
  }
};

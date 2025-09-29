const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const localPath = path.join(__dirname, '../firebase-service-account.json');
const serviceAccount = fs.existsSync(localPath)
  ? require(localPath)
  : JSON.parse(process.env.FIREBASE_CONFIG);

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

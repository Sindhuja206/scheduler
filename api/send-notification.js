const admin = require("firebase-admin");

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../serviceAccountKey.json")),
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { token, title, body, data } = req.body;

  if (!token || !title || !body || !data) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const message = {
    notification: { title, body},
    data:data,
    token: token,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    return res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

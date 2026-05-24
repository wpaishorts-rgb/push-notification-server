import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import fs from 'fs';

const app = express();

app.use(cors());
app.use(express.json());

// Firebase service account
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.post('/send-notification', async (req, res) => {
  try {
    const { title, message, link, tokens } = req.body;

    if (!title || !message || !tokens || !tokens.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payload = {
      notification: {
        title,
        body: message
      },
      data: {
        link: link || ''
      },
      tokens
    };

    const response = await admin.messaging().sendEachForMulticast(payload);
    console.log(response);
    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get('/', (req, res) => {
  res.send('Push Notification Server Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
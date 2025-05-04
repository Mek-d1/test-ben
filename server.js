const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const credsPath = path.join(__dirname, 'creds.json');

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/valid', (req, res) => {
  res.sendFile(path.join(__dirname, 'valid.html'));
});
// Helper: Load & Save
function loadCreds() {
  try {
    const raw = fs.readFileSync(credsPath);
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveCreds(data) {
  fs.writeFileSync(credsPath, JSON.stringify(data, null, 2));
}

// API: دریافت همه
app.get('/api/creds', (req, res) => {
  const creds = loadCreds();
  res.json(creds);
});

// API: افزودن
// API: افزودن
app.post('/api/creds', (req, res) => {
  const { credsId, name, wa_number, status } = req.body;
  if (!credsId || !name || !wa_number || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const creds = loadCreds();
  creds.push({
    credsId,
    name,
    wa_number,
    status,
    createdAt: new Date().toISOString()
  });
  saveCreds(creds);
  res.json({ message: 'Session added' });
});

// API: حذف
app.delete('/api/creds/:id', (req, res) => {
  let creds = loadCreds();
  const before = creds.length;
  creds = creds.filter(c => c.credsId !== req.params.id);
  saveCreds(creds);
  res.json({ message: before !== creds.length ? 'Deleted' : 'Not found' });
});

app.get('/addsession', (req, res) => {
  const { id, name, number, time } = req.query;
  if (!id || !name || !number || !time) {
    return res.status(400).send('Missing parameters');
  }

  const creds = loadCreds();
  creds.push({
    credsId: id,
    wa_number: number,
    name: name,
    status: 'valid',
    createdAt: time
  });
  saveCreds(creds);
  res.send('Session added');
});

 
app.post('/giftedValidate.php', (req, res) => {
    const sessionId = req.body.sessionId?.trim();

    if (!sessionId || !sessionId.startsWith("BEN-BOT~")) {
        return res.json({ error: 'Invalid format. Must start with BEN-BOT~' });
    }

    const credsPath = path.join(__dirname, 'creds.json');
    if (!fs.existsSync(credsPath)) {
        return res.json({ error: 'Session storage not found.' });
    }

    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));

    const found = creds.find(cred => cred.credsId === sessionId);
    if (found) {
        return res.json({ valid: true, message: 'Valid session: Ready to use.' });
    } else {
        return res.json({ valid: false, message: 'Session not found in database.' });
    }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
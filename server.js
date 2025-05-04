const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const credsPath = path.join(__dirname, 'creds.json');

app.use(express.static(__dirname));
app.use(bodyParser.json());

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
app.post('/api/creds', (req, res) => {
  const { credsId, credsData } = req.body;
  if (!credsId || !credsData) return res.status(400).json({ error: 'Invalid data' });

  const creds = loadCreds();
  creds.push({ credsId, credsData, createdAt: new Date().toISOString() });
  saveCreds(creds);
  res.json({ message: 'Added' });
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
    credsData: {
      wa_number: number,
      name: name,
      status: 'valid',
      date: time,
      data: {}
    },
    createdAt: new Date().toISOString()
  });
  saveCreds(creds);
  res.send('Session added');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const PORT = process.env.PORT || 3000;
const path = require('path');

app.use('/', async (req, res, next) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Fake database for demo purposes
let creds = [
  { credsId: '1', credsData: { me: { id: '12345', name: 'John Doe' }, myAppStateKeyId: 'abc123' }, createdAt: '2025-05-03T12:34:56Z' },
];

// Mock auth token for simplicity
const mockAuthToken = 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=';

// Authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader === mockAuthToken) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Login route
app.post('/admin/login.php', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get credentials
app.get('/admin/creds.php', authenticate, (req, res) => {
  res.json(creds);
});

// Search credentials
app.get('/admin/creds.php/search.php', authenticate, (req, res) => {
  const query = req.query.q || '';
  const filteredCreds = creds.filter(cred => cred.credsData.me.name.includes(query));
  res.json(filteredCreds);
});

// View a specific credential
app.get('/admin/creds.php/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const cred = creds.find(cred => cred.credsId === id);
  if (cred) {
    res.json(cred);
  } else {
    res.status(404).json({ error: 'Credential not found' });
  }
});

// Edit a credential
app.put('/admin/creds.php/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { credsData } = req.body;
  if (!credsData) {
    return res.status(400).json({ error: 'Invalid data provided' });
  }
  const credIndex = creds.findIndex(cred => cred.credsId === id);
  if (credIndex >= 0) {
    creds[credIndex].credsData = credsData;
    res.json({ message: 'Credential updated' });
  } else {
    res.status(404).json({ error: 'Credential not found' });
  }
});

// Delete a credential
app.delete('/admin/creds.php/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const credIndex = creds.findIndex(cred => cred.credsId === id);
  if (credIndex >= 0) {
    creds.splice(credIndex, 1);
    res.json({ message: 'Credential deleted' });
  } else {
    res.status(404).json({ error: 'Credential not found' });
  }
});

// Logout route
app.post('/admin/logout.php', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
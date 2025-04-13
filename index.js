const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const messageFilePath = path.join(__dirname, 'allmessage.json');
let messages = [];

if (fs.existsSync(messageFilePath)) {
  messages = JSON.parse(fs.readFileSync(messageFilePath));
}

app.use(bodyParser.json());

// مسیر فایل استاتیک html/css/js
app.use(express.static(__dirname));

// مسیر برای صفحه اصلی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API ورود کاربر
app.post('/login', (req, res) => {
  const { username, email, password } = req.body;
  if (username && email && password) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

wss.on('connection', ws => {
  messages.forEach(msg => ws.send(msg));

  ws.on('message', msg => {
    messages.push(msg);
    fs.writeFileSync(messageFilePath, JSON.stringify(messages, null, 2));

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

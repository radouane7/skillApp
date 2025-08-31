const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'skillswap_secret_key_2024';

app.use(cors());
app.use(express.json());

// Routes basiques
app.get('/api/users', (req, res) => {
  res.json({ message: 'API SkillSwap fonctionnelle !' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

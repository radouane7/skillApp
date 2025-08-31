// Configuration de la base de données
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'skillswap.db');
const db = new sqlite3.Database(dbPath);

module.exports = db;

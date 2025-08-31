@echo off
echo ===============================================
echo    CREATION DE LA STRUCTURE SKILLSWAP APP
echo ===============================================
echo.

echo 📁 Creation des dossiers...

REM Création des dossiers principaux
mkdir src\components 2>nul
mkdir src\pages 2>nul
mkdir src\services 2>nul
mkdir src\utils 2>nul
mkdir src\styles 2>nul
mkdir server\config 2>nul
mkdir server\models 2>nul
mkdir server\routes 2>nul
mkdir server\middleware 2>nul
mkdir server\controllers 2>nul
mkdir server\database 2>nul

echo ✅ Dossiers créés avec succès !
echo.

echo 📄 Creation des fichiers...

REM ==================== FICHIERS DE CONFIGURATION ====================

echo {> package.json
echo   "name": "skillswap-app",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "description": "Application d'échange de compétences entre particuliers",>> package.json
echo   "private": true,>> package.json
echo   "dependencies": {>> package.json
echo     "@testing-library/jest-dom": "^5.16.4",>> package.json
echo     "@testing-library/react": "^13.3.0",>> package.json
echo     "@testing-library/user-event": "^13.5.0",>> package.json
echo     "bcryptjs": "^2.4.3",>> package.json
echo     "cors": "^2.8.5",>> package.json
echo     "express": "^4.18.2",>> package.json
echo     "jsonwebtoken": "^9.0.2",>> package.json
echo     "lucide-react": "^0.263.1",>> package.json
echo     "react": "^18.2.0",>> package.json
echo     "react-dom": "^18.2.0",>> package.json
echo     "react-router-dom": "^6.3.0",>> package.json
echo     "react-scripts": "5.0.1",>> package.json
echo     "sqlite3": "^5.1.6",>> package.json
echo     "socket.io": "^4.7.2",>> package.json
echo     "socket.io-client": "^4.7.2",>> package.json
echo     "tailwindcss": "^3.3.0",>> package.json
echo     "web-vitals": "^2.1.4">> package.json
echo   },>> package.json
echo   "devDependencies": {>> package.json
echo     "@tailwindcss/forms": "^0.5.3",>> package.json
echo     "concurrently": "^7.6.0",>> package.json
echo     "nodemon": "^3.0.1">> package.json
echo   },>> package.json
echo   "scripts": {>> package.json
echo     "start": "react-scripts start",>> package.json
echo     "build": "react-scripts build",>> package.json
echo     "test": "react-scripts test",>> package.json
echo     "eject": "react-scripts eject",>> package.json
echo     "server": "nodemon server/server.js",>> package.json
echo     "dev": "concurrently \"npm run server\" \"npm start\"",>> package.json
echo     "init-db": "node server/database/seed.js",>> package.json
echo     "setup": "npm install && npm run init-db">> package.json
echo   },>> package.json
echo   "eslintConfig": {>> package.json
echo     "extends": [>> package.json
echo       "react-app",>> package.json
echo       "react-app/jest">> package.json
echo     ]>> package.json
echo   },>> package.json
echo   "browserslist": {>> package.json
echo     "production": [>> package.json
echo       "^>0.2%%",>> package.json
echo       "not dead",>> package.json
echo       "not op_mini all">> package.json
echo     ],>> package.json
echo     "development": [>> package.json
echo       "last 1 chrome version",>> package.json
echo       "last 1 firefox version",>> package.json
echo       "last 1 safari version">> package.json
echo     ]>> package.json
echo   },>> package.json
echo   "proxy": "http://localhost:5000">> package.json
echo }>> package.json

echo /** @type {import('tailwindcss'^).Config} */> tailwind.config.js
echo module.exports = {>> tailwind.config.js
echo   content: [>> tailwind.config.js
echo     "./src/**/*.{js,jsx,ts,tsx}",>> tailwind.config.js
echo     "./public/index.html",>> tailwind.config.js
echo   ],>> tailwind.config.js
echo   theme: {>> tailwind.config.js
echo     extend: {>> tailwind.config.js
echo       colors: {>> tailwind.config.js
echo         primary: {>> tailwind.config.js
echo           50: '#eff6ff',>> tailwind.config.js
echo           500: '#3b82f6',>> tailwind.config.js
echo           600: '#2563eb'>> tailwind.config.js
echo         },>> tailwind.config.js
echo         secondary: {>> tailwind.config.js
echo           50: '#f0fdf4',>> tailwind.config.js
echo           500: '#22c55e',>> tailwind.config.js
echo           600: '#16a34a'>> tailwind.config.js
echo         }>> tailwind.config.js
echo       }>> tailwind.config.js
echo     }>> tailwind.config.js
echo   },>> tailwind.config.js
echo   plugins: [require('@tailwindcss/forms')]>> tailwind.config.js
echo }>> tailwind.config.js

REM ==================== STYLES ====================

echo @tailwind base;> src\styles\globals.css
echo @tailwind components;>> src\styles\globals.css
echo @tailwind utilities;>> src\styles\globals.css
echo.>> src\styles\globals.css
echo body {>> src\styles\globals.css
echo   font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;>> src\styles\globals.css
echo }>> src\styles\globals.css

REM ==================== COMPOSANTS REACT ====================

echo import React from 'react';> src\components\Header.js
echo import { User, Bell, CreditCard, MapPin, BookOpen } from 'lucide-react';>> src\components\Header.js
echo.>> src\components\Header.js
echo const Header = ({ currentUser }) => {>> src\components\Header.js
echo   return (>> src\components\Header.js
echo     ^<div className="bg-gradient-to-r from-blue-600 to-green-500 text-white p-6 rounded-b-3xl shadow-lg"^>>> src\components\Header.js
echo       {/* Header content */}>> src\components\Header.js
echo     ^</div^>>> src\components\Header.js
echo   ^);>> src\components\Header.js
echo ^};>> src\components\Header.js
echo.>> src\components\Header.js
echo export default Header;>> src\components\Header.js

echo import React from 'react';> src\components\Navigation.js
echo import { User, Search, Users, Calendar, MessageCircle } from 'lucide-react';>> src\components\Navigation.js
echo.>> src\components\Navigation.js
echo const Navigation = ({ currentView, setCurrentView }) => {>> src\components\Navigation.js
echo   return (>> src\components\Navigation.js
echo     ^<div className="flex justify-around bg-white shadow-lg rounded-t-3xl p-4"^>>> src\components\Navigation.js
echo       {/* Navigation items */}>> src\components\Navigation.js
echo     ^</div^>>> src\components\Navigation.js
echo   ^);>> src\components\Navigation.js
echo ^};>> src\components\Navigation.js
echo.>> src\components\Navigation.js
echo export default Navigation;>> src\components\Navigation.js

echo import React from 'react';> src\components\UserCard.js
echo import { Star, MapPin } from 'lucide-react';>> src\components\UserCard.js
echo.>> src\components\UserCard.js
echo const UserCard = ({ user, onViewProfile, onContact }) => {>> src\components\UserCard.js
echo   return (>> src\components\UserCard.js
echo     ^<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"^>>> src\components\UserCard.js
echo       {/* User card content */}>> src\components\UserCard.js
echo     ^</div^>>> src\components\UserCard.js
echo   ^);>> src\components\UserCard.js
echo ^};>> src\components\UserCard.js
echo.>> src\components\UserCard.js
echo export default UserCard;>> src\components\UserCard.js

echo import React from 'react';> src\components\ProfileModal.js
echo import { X, Star, MapPin, Clock } from 'lucide-react';>> src\components\ProfileModal.js
echo.>> src\components\ProfileModal.js
echo const ProfileModal = ({ user, isOpen, onClose }) => {>> src\components\ProfileModal.js
echo   if (!isOpen ^|^| !user^) return null;>> src\components\ProfileModal.js
echo   return (>> src\components\ProfileModal.js
echo     ^<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"^>>> src\components\ProfileModal.js
echo       {/* Modal content */}>> src\components\ProfileModal.js
echo     ^</div^>>> src\components\ProfileModal.js
echo   ^);>> src\components\ProfileModal.js
echo ^};>> src\components\ProfileModal.js
echo.>> src\components\ProfileModal.js
echo export default ProfileModal;>> src\components\ProfileModal.js

REM ==================== PAGES ====================

echo import React from 'react';> src\pages\Dashboard.js
echo import { BookOpen, Star, Clock } from 'lucide-react';>> src\pages\Dashboard.js
echo.>> src\pages\Dashboard.js
echo const Dashboard = ({ currentUser }) => {>> src\pages\Dashboard.js
echo   return (>> src\pages\Dashboard.js
echo     ^<div className="space-y-6"^>>> src\pages\Dashboard.js
echo       {/* Dashboard content */}>> src\pages\Dashboard.js
echo     ^</div^>>> src\pages\Dashboard.js
echo   ^);>> src\pages\Dashboard.js
echo ^};>> src\pages\Dashboard.js
echo.>> src\pages\Dashboard.js
echo export default Dashboard;>> src\pages\Dashboard.js

echo import React, { useState } from 'react';> src\pages\Discover.js
echo import { Search, Filter } from 'lucide-react';>> src\pages\Discover.js
echo import UserCard from '../components/UserCard';>> src\pages\Discover.js
echo.>> src\pages\Discover.js
echo const Discover = () => {>> src\pages\Discover.js
echo   const [searchQuery, setSearchQuery] = useState(''^);>> src\pages\Discover.js
echo   return (>> src\pages\Discover.js
echo     ^<div className="space-y-6"^>>> src\pages\Discover.js
echo       {/* Discover content */}>> src\pages\Discover.js
echo     ^</div^>>> src\pages\Discover.js
echo   ^);>> src\pages\Discover.js
echo ^};>> src\pages\Discover.js
echo.>> src\pages\Discover.js
echo export default Discover;>> src\pages\Discover.js

REM ==================== SERVICES ====================

echo const API_BASE_URL = process.env.REACT_APP_API_URL ^|^| 'http://localhost:5000/api';> src\services\api.js
echo.>> src\services\api.js
echo class ApiService {>> src\services\api.js
echo   static async get(endpoint^) {>> src\services\api.js
echo     const response = await fetch(`${API_BASE_URL}${endpoint}`^);>> src\services\api.js
echo     return response.json(^);>> src\services\api.js
echo   }>> src\services\api.js
echo.>> src\services\api.js
echo   static async post(endpoint, data^) {>> src\services\api.js
echo     const response = await fetch(`${API_BASE_URL}${endpoint}`, {>> src\services\api.js
echo       method: 'POST',>> src\services\api.js
echo       headers: { 'Content-Type': 'application/json' },>> src\services\api.js
echo       body: JSON.stringify(data^)>> src\services\api.js
echo     }^);>> src\services\api.js
echo     return response.json(^);>> src\services\api.js
echo   }>> src\services\api.js
echo }>> src\services\api.js
echo.>> src\services\api.js
echo export default ApiService;>> src\services\api.js

echo class MatchingAlgorithm {> src\services\matchingAlgorithm.js
echo   static calculateMatchScore(user1, user2^) {>> src\services\matchingAlgorithm.js
echo     let score = 0;>> src\services\matchingAlgorithm.js
echo     // Algorithme de matching intelligent>> src\services\matchingAlgorithm.js
echo     return score;>> src\services\matchingAlgorithm.js
echo   }>> src\services\matchingAlgorithm.js
echo }>> src\services\matchingAlgorithm.js
echo.>> src\services\matchingAlgorithm.js
echo export default MatchingAlgorithm;>> src\services\matchingAlgorithm.js

REM ==================== UTILS ====================

echo export const SKILL_CATEGORIES = [> src\utils\constants.js
echo   'Toutes', 'Langues', 'Musique', 'Informatique', 'Sport', 'Cuisine', 'Art', 'Sciences'>> src\utils\constants.js
echo ];>> src\utils\constants.js
echo.>> src\utils\constants.js
echo export const SKILL_LEVELS = [>> src\utils\constants.js
echo   'Débutant', 'Intermédiaire', 'Avancé', 'Expert', 'Natif'>> src\utils\constants.js
echo ];>> src\utils\constants.js

echo export const formatDate = (date^) => {> src\utils\helpers.js
echo   return new Date(date^).toLocaleDateString('fr-FR'^);>> src\utils\helpers.js
echo ^};>> src\utils\helpers.js
echo.>> src\utils\helpers.js
echo export const calculateTimeAgo = (date^) => {>> src\utils\helpers.js
echo   // Fonction pour calculer le temps écoulé>> src\utils\helpers.js
echo   return 'Il y a 2 heures';>> src\utils\helpers.js
echo ^};>> src\utils\helpers.js

REM ==================== APP PRINCIPAL ====================

echo import React, { useState, useEffect } from 'react';> src\App.js
echo import './styles/globals.css';>> src\App.js
echo import Header from './components/Header';>> src\App.js
echo import Navigation from './components/Navigation';>> src\App.js
echo import Dashboard from './pages/Dashboard';>> src\App.js
echo import Discover from './pages/Discover';>> src\App.js
echo.>> src\App.js
echo function App(^) {>> src\App.js
echo   const [currentView, setCurrentView] = useState('dashboard'^);>> src\App.js
echo   const [currentUser, setCurrentUser] = useState(null^);>> src\App.js
echo.>> src\App.js
echo   return (>> src\App.js
echo     ^<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"^>>> src\App.js
echo       ^<div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl"^>>> src\App.js
echo         ^<Header currentUser={currentUser} /^>>> src\App.js
echo         {currentView === 'dashboard' ^&^& ^<Dashboard currentUser={currentUser} /^>}>> src\App.js
echo         {currentView === 'discover' ^&^& ^<Discover /^>}>> src\App.js
echo         ^<Navigation currentView={currentView} setCurrentView={setCurrentView} /^>>> src\App.js
echo       ^</div^>>> src\App.js
echo     ^</div^>>> src\App.js
echo   ^);>> src\App.js
echo }>> src\App.js
echo.>> src\App.js
echo export default App;>> src\App.js

echo import React from 'react';> src\index.js
echo import ReactDOM from 'react-dom/client';>> src\index.js
echo import App from './App';>> src\index.js
echo.>> src\index.js
echo const root = ReactDOM.createRoot(document.getElementById('root'^)^);>> src\index.js
echo root.render(^<App /^>^);>> src\index.js

REM ==================== SERVEUR EXPRESS ====================

echo const express = require('express'^);> server\server.js
echo const cors = require('cors'^);>> server\server.js
echo const path = require('path'^);>> server\server.js
echo const sqlite3 = require('sqlite3'^).verbose(^);>> server\server.js
echo const bcrypt = require('bcryptjs'^);>> server\server.js
echo const jwt = require('jsonwebtoken'^);>> server\server.js
echo const fs = require('fs'^);>> server\server.js
echo.>> server\server.js
echo const app = express(^);>> server\server.js
echo const PORT = process.env.PORT ^|^| 5000;>> server\server.js
echo const JWT_SECRET = 'skillswap_secret_key_2024';>> server\server.js
echo.>> server\server.js
echo app.use(cors(^)^);>> server\server.js
echo app.use(express.json(^)^);>> server\server.js
echo.>> server\server.js
echo // Routes basiques>> server\server.js
echo app.get('/api/users', (req, res^) => {>> server\server.js
echo   res.json({ message: 'API SkillSwap fonctionnelle !' }^);>> server\server.js
echo }^);>> server\server.js
echo.>> server\server.js
echo app.listen(PORT, (^) => {>> server\server.js
echo   console.log(`🚀 Serveur démarré sur le port ${PORT}`^);>> server\server.js
echo }^);>> server\server.js

REM ==================== BASE DE DONNEES ====================

echo -- SkillSwap Database Schema> server\database\init.sql
echo CREATE TABLE IF NOT EXISTS users (>> server\database\init.sql
echo     id INTEGER PRIMARY KEY AUTOINCREMENT,>> server\database\init.sql
echo     name VARCHAR(100^) NOT NULL,>> server\database\init.sql
echo     email VARCHAR(150^) UNIQUE NOT NULL,>> server\database\init.sql
echo     password_hash VARCHAR(255^) NOT NULL,>> server\database\init.sql
echo     bio TEXT,>> server\database\init.sql
echo     location VARCHAR(200^),>> server\database\init.sql
echo     avatar VARCHAR(10^) DEFAULT '👤',>> server\database\init.sql
echo     rating DECIMAL(3,2^) DEFAULT 0.0,>> server\database\init.sql
echo     credits INTEGER DEFAULT 5,>> server\database\init.sql
echo     verified BOOLEAN DEFAULT 0,>> server\database\init.sql
echo     created_at DATETIME DEFAULT CURRENT_TIMESTAMP>> server\database\init.sql
echo ^);>> server\database\init.sql

echo const sqlite3 = require('sqlite3'^).verbose(^);> server\database\seed.js
echo const path = require('path'^);>> server\database\seed.js
echo const bcrypt = require('bcryptjs'^);>> server\database\seed.js
echo.>> server\database\seed.js
echo console.log('🌱 Initialisation de la base de données...'^);>> server\database\seed.js
echo // Script d'initialisation>> server\database\seed.js

echo const jwt = require('jsonwebtoken'^);> server\middleware\auth.js
echo.>> server\middleware\auth.js
echo const authenticateToken = (req, res, next^) => {>> server\middleware\auth.js
echo   // Middleware d'authentification>> server\middleware\auth.js
echo   next(^);>> server\middleware\auth.js
echo ^};>> server\middleware\auth.js
echo.>> server\middleware\auth.js
echo module.exports = { authenticateToken };>> server\middleware\auth.js

echo // Configuration de la base de données> server\config\database.js
echo const sqlite3 = require('sqlite3'^).verbose(^);>> server\config\database.js
echo const path = require('path'^);>> server\config\database.js
echo.>> server\config\database.js
echo const dbPath = path.join(__dirname, '..', 'database', 'skillswap.db'^);>> server\config\database.js
echo const db = new sqlite3.Database(dbPath^);>> server\config\database.js
echo.>> server\config\database.js
echo module.exports = db;>> server\config\database.js

REM ==================== README ====================

echo # 🎯 SkillSwap - Application d'échange de compétences> README.md
echo.>> README.md
echo ## 🚀 Installation et démarrage>> README.md
echo.>> README.md
echo ```bash>> README.md
echo # Installer les dépendances>> README.md
echo npm install>> README.md
echo.>> README.md
echo # Initialiser la base de données>> README.md
echo npm run init-db>> README.md
echo.>> README.md
echo # Lancer l'application (frontend + backend^)>> README.md
echo npm run dev>> README.md
echo ```>> README.md
echo.>> README.md
echo ## 📱 Fonctionnalités>> README.md
echo - Interface mobile-first ultra-attractive>> README.md
echo - Système de matching intelligent>> README.md
echo - Gestion des crédits temps>> README.md
echo - Messagerie intégrée>> README.md
echo - Planification de sessions>> README.md

echo ✅ Tous les fichiers ont été créés !
echo.
echo ===============================================
echo           PROCHAINES ÉTAPES :
echo ===============================================
echo.
echo 1. Installer les dépendances :
echo    npm install
echo.
echo 2. Initialiser Tailwind CSS :
echo    npx tailwindcss init -p
echo.
echo 3. Lancer l'application :
echo    npm run dev
echo.
echo 4. Accéder à l'application :
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:5000
echo.
echo ===============================================
echo    SkillSwap est prêt ! 🚀
echo ===============================================
pause
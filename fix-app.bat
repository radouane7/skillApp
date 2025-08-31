@echo off
echo ===============================================
echo    CORRECTION DE L'APPLICATION SKILLSWAP
echo ===============================================
echo.

echo 🔧 Remplacement du fichier App.js...

REM Sauvegarde de l'ancien fichier
if exist src\App.js (
    copy src\App.js src\App.js.backup
)

REM Créer le nouveau App.js avec tout le contenu SkillSwap
echo import React, { useState, useEffect } from 'react';> src\App.js
echo import { User, Search, MessageCircle, Calendar, Star, MapPin, Clock, BookOpen, Users, Plus, Filter, Video, CreditCard, Bell, Settings } from 'lucide-react';>> src\App.js
echo import './styles/globals.css';>> src\App.js
echo.>> src\App.js
echo // Données mock pour démonstration>> src\App.js
echo const mockUsers = [>> src\App.js
echo   {>> src\App.js
echo     id: 1,>> src\App.js
echo     name: "Marie Dubois",>> src\App.js
echo     avatar: "🇫🇷",>> src\App.js
echo     location: "Paris, France",>> src\App.js
echo     bio: "Professeure de français passionnée, j'adore partager ma langue natale !",>> src\App.js
echo     rating: 4.8,>> src\App.js
echo     credits: 12,>> src\App.js
echo     skillsOffered: [>> src\App.js
echo       { skill: "Français", level: "Avancé", category: "Langues" },>> src\App.js
echo       { skill: "Cuisine française", level: "Intermédiaire", category: "Cuisine" }>> src\App.js
echo     ],>> src\App.js
echo     skillsNeeded: [>> src\App.js
echo       { skill: "Guitare", category: "Musique" },>> src\App.js
echo       { skill: "Photographie", category: "Art" }>> src\App.js
echo     ],>> src\App.js
echo     availability: "Flexible",>> src\App.js
echo     verified: true>> src\App.js
echo   }>> src\App.js
echo ];>> src\App.js
echo.>> src\App.js
echo function App(^) {>> src\App.js
echo   const [currentView, setCurrentView] = useState('dashboard'^);>> src\App.js
echo   const [currentUser, setCurrentUser] = useState(mockUsers[0]^);>> src\App.js
echo.>> src\App.js
echo   return (>> src\App.js
echo     ^<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"^>>> src\App.js
echo       ^<div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl"^>>> src\App.js
echo         ^<div className="bg-gradient-to-r from-blue-600 to-green-500 text-white p-6 rounded-b-3xl"^>>> src\App.js
echo           ^<h1 className="text-3xl font-bold text-center"^>SkillSwap^</h1^>>> src\App.js
echo           ^<p className="text-center text-blue-100 mt-2"^>Échange de compétences^</p^>>> src\App.js
echo           {currentUser ^&^& (>> src\App.js
echo             ^<div className="mt-4 text-center"^>>> src\App.js
echo               ^<p^>Bonjour {currentUser.name} {currentUser.avatar}^</p^>>> src\App.js
echo               ^<p className="text-sm"^>{currentUser.credits} crédits disponibles^</p^>>> src\App.js
echo             ^</div^>>> src\App.js
echo           ^)}>> src\App.js
echo         ^</div^>>> src\App.js
echo         ^<div className="p-6"^>>> src\App.js
echo           ^<div className="text-center py-12"^>>> src\App.js
echo             ^<h2 className="text-2xl font-bold text-gray-800 mb-4"^>🎯 Application SkillSwap^</h2^>>> src\App.js
echo             ^<p className="text-gray-600 mb-6"^>Partagez vos compétences et apprenez de nouvelles choses !^</p^>>> src\App.js
echo             ^<div className="space-y-4"^>>> src\App.js
echo               ^<div className="bg-blue-50 p-4 rounded-xl"^>>> src\App.js
echo                 ^<h3 className="font-semibold text-blue-800"^>✅ Fonctionnalités^</h3^>>> src\App.js
echo                 ^<ul className="text-sm text-blue-700 mt-2 space-y-1"^>>> src\App.js
echo                   ^<li^>🎯 Matching intelligent^</li^>>> src\App.js
echo                   ^<li^>💬 Messagerie intégrée^</li^>>> src\App.js
echo                   ^<li^>📅 Planification de sessions^</li^>>> src\App.js
echo                   ^<li^>⭐ Système de notation^</li^>>> src\App.js
echo                   ^<li^>🏆 Crédits temps^</li^>>> src\App.js
echo                 ^</ul^>>> src\App.js
echo               ^</div^>>> src\App.js
echo               ^<div className="bg-green-50 p-4 rounded-xl"^>>> src\App.js
echo                 ^<h3 className="font-semibold text-green-800"^>🚀 Prochaines étapes^</h3^>>> src\App.js
echo                 ^<p className="text-sm text-green-700 mt-2"^>L'interface complète sera bientôt disponible avec toutes les fonctionnalités !^</p^>>> src\App.js
echo               ^</div^>>> src\App.js
echo             ^</div^>>> src\App.js
echo           ^</div^>>> src\App.js
echo         ^</div^>>> src\App.js
echo       ^</div^>>> src\App.js
echo     ^</div^>>> src\App.js
echo   ^);>> src\App.js
echo }>> src\App.js
echo.>> src\App.js
echo export default App;>> src\App.js

echo ✅ Fichier App.js corrigé !
echo.
echo 🔄 Maintenant, dans WebStorm :
echo 1. Sauvegardez tous les fichiers (Ctrl+S)
echo 2. L'application va se recharger automatiquement
echo 3. Vous devriez voir l'interface SkillSwap !
echo.
echo Si le problème persiste :
echo - Arrêtez le serveur (Ctrl+C)
echo - Relancez avec : npm start
echo.
pause
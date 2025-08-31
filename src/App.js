import React, { useState, useEffect } from 'react';
import { User, Search, MessageCircle, Calendar, Star, MapPin, Clock, BookOpen, Users, Plus, Filter, Video, CreditCard, Bell, Settings } from 'lucide-react';
import './styles/globals.css';

// Données mock pour démonstration
const mockUsers = [
  {
    id: 1,
    name: "Marie Dubois",
    avatar: "🇫🇷",
    location: "Paris, France",
    bio: "Professeure de français passionnée, j'adore partager ma langue natale !",
    rating: 4.8,
    credits: 12,
    skillsOffered: [
      { skill: "Français", level: "Avancé", category: "Langues" },
      { skill: "Cuisine française", level: "Intermédiaire", category: "Cuisine" }
    ],
    skillsNeeded: [
      { skill: "Guitare", category: "Musique" },
      { skill: "Photographie", category: "Art" }
    ],
    availability: "Flexible",
    verified: true
  },
  {
    id: 2,
    name: "Carlos Rodriguez",
    avatar: "🇪🇸",
    location: "Madrid, Espagne",
    bio: "Guitariste depuis 15 ans, j'enseigne avec passion !",
    rating: 4.9,
    credits: 8,
    skillsOffered: [
      { skill: "Guitare", level: "Avancé", category: "Musique" },
      { skill: "Espagnol", level: "Natif", category: "Langues" }
    ],
    skillsNeeded: [
      { skill: "Français", category: "Langues" },
      { skill: "Programmation", category: "Informatique" }
    ],
    availability: "Soirées",
    verified: true
  },
  {
    id: 3,
    name: "Yuki Tanaka",
    avatar: "🇯🇵",
    location: "Tokyo, Japon",
    bio: "Développeur full-stack, j'aime partager mes connaissances tech",
    rating: 4.7,
    credits: 15,
    skillsOffered: [
      { skill: "React", level: "Avancé", category: "Informatique" },
      { skill: "Japonais", level: "Natif", category: "Langues" }
    ],
    skillsNeeded: [
      { skill: "Piano", category: "Musique" },
      { skill: "Design", category: "Art" }
    ],
    availability: "Week-ends",
    verified: true
  }
];

const categories = ["Toutes", "Langues", "Musique", "Informatique", "Sport", "Cuisine", "Art", "Sciences"];

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(mockUsers);
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [showProfile, setShowProfile] = useState(null);

  // Simuler la connexion utilisateur
  useEffect(() => {
    setCurrentUser(mockUsers[0]); // Marie comme utilisateur connecté par défaut
  }, []);

  // Algorithme de matching intelligent
  const findMatches = () => {
    if (!currentUser) return [];
    
    const potentialMatches = users.filter(user => user.id !== currentUser.id);
    
    return potentialMatches.map(user => {
      let matchScore = 0;
      let commonInterests = [];
      
      // Vérifier les correspondances skill offered <-> skill needed
      currentUser.skillsOffered.forEach(offered => {
        user.skillsNeeded.forEach(needed => {
          if (offered.skill.toLowerCase().includes(needed.skill.toLowerCase()) || 
              needed.skill.toLowerCase().includes(offered.skill.toLowerCase())) {
            matchScore += 3;
            commonInterests.push(`${offered.skill} ↔ ${needed.skill}`);
          }
        });
      });
      
      user.skillsOffered.forEach(offered => {
        currentUser.skillsNeeded.forEach(needed => {
          if (offered.skill.toLowerCase().includes(needed.skill.toLowerCase()) || 
              needed.skill.toLowerCase().includes(offered.skill.toLowerCase())) {
            matchScore += 3;
            commonInterests.push(`${needed.skill} ↔ ${offered.skill}`);
          }
        });
      });
      
      // Bonus pour la proximité géographique
      if (user.location.includes(currentUser.location.split(',')[1])) {
        matchScore += 1;
      }
      
      // Bonus pour le rating
      matchScore += user.rating * 0.5;
      
      return {
        user,
        score: matchScore,
        interests: commonInterests
      };
    }).filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score);
  };

  useEffect(() => {
    setMatches(findMatches());
  }, [currentUser]);

  // Composant Header
  const Header = () => (
    <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white p-6 rounded-b-3xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SkillSwap</h1>
            <p className="text-blue-100">Partageons nos talents</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Bell className="h-6 w-6 cursor-pointer hover:text-yellow-300 transition-colors" />
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-3 py-1">
            <CreditCard className="h-4 w-4" />
            <span className="font-semibold">{currentUser?.credits || 0}</span>
          </div>
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-lg">
            {currentUser?.avatar}
          </div>
        </div>
      </div>
      
      {currentUser && (
        <div className="bg-white bg-opacity-10 rounded-2xl p-4">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">{currentUser.avatar}</span>
            <div>
              <h2 className="font-semibold text-lg">{currentUser.name}</h2>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{currentUser.location}</span>
              </div>
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-3">{currentUser.bio}</p>
          
          <div className="flex flex-wrap gap-2">
            {currentUser.skillsOffered.map((skill, idx) => (
              <span key={idx} className="bg-green-500 bg-opacity-30 text-green-100 px-3 py-1 rounded-full text-xs font-medium">
                ✅ {skill.skill}
              </span>
            ))}
            {currentUser.skillsNeeded.map((skill, idx) => (
              <span key={idx} className="bg-blue-500 bg-opacity-30 text-blue-100 px-3 py-1 rounded-full text-xs font-medium">
                🎯 {skill.skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Composant Navigation
  const Navigation = () => (
    <div className="flex justify-around bg-white shadow-lg rounded-t-3xl p-4 border-t">
      {[
        { id: 'dashboard', icon: User, label: 'Profil' },
        { id: 'discover', icon: Search, label: 'Découvrir' },
        { id: 'matches', icon: Users, label: 'Matches' },
        { id: 'sessions', icon: Calendar, label: 'Sessions' },
        { id: 'messages', icon: MessageCircle, label: 'Messages' }
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setCurrentView(item.id)}
          className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
            currentView === item.id 
              ? 'bg-gradient-to-t from-blue-500 to-green-500 text-white scale-105 shadow-lg' 
              : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );

  // Vue Dashboard
  const DashboardView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Compétences offertes</h3>
              <p className="text-blue-600 text-sm">{currentUser?.skillsOffered.length} compétences</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Note moyenne</h3>
              <p className="text-green-600 text-sm">{currentUser?.rating}/5 ⭐</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Sessions réalisées</h3>
              <p className="text-purple-600 text-sm">23 sessions</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-xl mb-4 text-gray-800">Activité récente</h3>
        <div className="space-y-4">
          {[
            { action: "Session de guitare avec Carlos", time: "Il y a 2 heures", status: "completed" },
            { action: "Nouveau match avec Yuki", time: "Il y a 1 jour", status: "new" },
            { action: "Session de français planifiée", time: "Demain 14h", status: "upcoming" }
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div className={`w-3 h-3 rounded-full ${
                activity.status === 'completed' ? 'bg-green-500' :
                activity.status === 'new' ? 'bg-blue-500' : 'bg-yellow-500'
              }`}></div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Vue Découverte
  const DiscoverView = () => {
    const filteredUsers = users.filter(user => {
      if (user.id === currentUser?.id) return false;
      
      const matchesCategory = selectedCategory === 'Toutes' || 
        user.skillsOffered.some(skill => skill.category === selectedCategory);
      
      const matchesSearch = searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.skillsOffered.some(skill => 
          skill.skill.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      return matchesCategory && matchesSearch;
    });

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-xl mb-4 text-gray-800">Rechercher des compétences</h3>
          
          <div className="flex flex-col space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou compétence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-glow'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start space-x-4">
                <div className="text-4xl animate-bounce-gentle">{user.avatar}</div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-lg text-gray-800">{user.name}</h4>
                    {user.verified && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{user.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.location}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{user.availability}</span>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4">{user.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.skillsOffered.map((skill, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-green-200 transition-colors">
                        ✅ {skill.skill} ({skill.level})
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 px-4 rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105">
                      Contacter
                    </button>
                    <button 
                      onClick={() => setShowProfile(user)}
                      className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                    >
                      Voir profil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Vue Matches
  const MatchesView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-xl mb-4 text-gray-800">Vos matches intelligents</h3>
        <p className="text-gray-600 mb-4">Nous avons trouvé ces personnes qui correspondent à vos besoins !</p>
      </div>
      
      <div className="space-y-4">
        {matches.slice(0, 5).map((match, idx) => (
          <div key={idx} className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-4xl">{match.user.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-lg text-gray-800">{match.user.name}</h4>
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    Match {Math.round(match.score * 10)}%
                  </div>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{match.user.location}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-xl p-4 mb-4">
              <h5 className="font-medium text-gray-800 mb-2">🎯 Correspondances parfaites :</h5>
              <div className="space-y-2">
                {match.interests.map((interest, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700">{interest}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Démarrer l'échange</span>
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105">
                <Star className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Vue Sessions
  const SessionsView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-gray-800">Mes sessions</h3>
          <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:scale-105 transition-transform">
            <Plus className="h-4 w-4" />
            <span>Planifier</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {[
          {
            type: "Cours de guitare",
            partner: "Carlos Rodriguez",
            avatar: "🇪🇸",
            date: "Aujourd'hui",
            time: "14:00 - 15:00",
            status: "confirmed",
            credits: 1
          },
          {
            type: "Conversation française",
            partner: "Anna Schmidt",
            avatar: "🇩🇪",
            date: "Demain",
            time: "10:00 - 11:00",
            status: "pending",
            credits: 1
          },
          {
            type: "Cours de React",
            partner: "Yuki Tanaka",
            avatar: "🇯🇵",
            date: "Vendredi",
            time: "16:00 - 17:00",
            status: "confirmed",
            credits: 1
          }
        ].map((session, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{session.avatar}</div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-800">{session.type}</h4>
                <p className="text-gray-600">avec {session.partner}</p>
                
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CreditCard className="h-4 w-4" />
                    <span>{session.credits} crédit</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  session.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {session.status === 'confirmed' ? 'Confirmée' : 'En attente'}
                </div>
                
                <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs flex items-center space-x-1 hover:bg-blue-600 transition-colors">
                  <Video className="h-3 w-3" />
                  <span>Rejoindre</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Vue Messages
  const MessagesView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-xl mb-4 text-gray-800">Conversations</h3>
      </div>
      
      <div className="space-y-3">
        {[
          {
            name: "Carlos Rodriguez",
            avatar: "🇪🇸",
            lastMessage: "Parfait ! À tout à l'heure pour le cours de guitare",
            time: "12:30",
            unread: 0,
            online: true
          },
          {
            name: "Yuki Tanaka",
            avatar: "🇯🇵",
            lastMessage: "J'ai préparé du matériel sur React Hooks pour vendredi",
            time: "Hier",
            unread: 2,
            online: false
          },
          {
            name: "Anna Schmidt",
            avatar: "🇩🇪",
            lastMessage: "Merci beaucoup pour la session de français !",
            time: "Mar",
            unread: 0,
            online: true
          }
        ].map((conversation, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="text-3xl">{conversation.avatar}</div>
                {conversation.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-gray-800 truncate">{conversation.name}</h4>
                  <span className="text-xs text-gray-500">{conversation.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
              </div>
              
              {conversation.unread > 0 && (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-xs text-white font-bold">{conversation.unread}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Modal de profil
  const ProfileModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-5xl">{user.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 text-2xl hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-800">{user.rating}/5</span>
              </div>
              <div className="text-sm text-gray-600">{user.credits} crédits disponibles</div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">À propos</h3>
              <p className="text-gray-600">{user.bio}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Compétences offertes</h3>
              <div className="space-y-2">
                {user.skillsOffered.map((skill, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-green-50 rounded-xl p-3">
                    <div>
                      <span className="font-medium text-green-800">{skill.skill}</span>
                      <span className="text-sm text-green-600 ml-2">({skill.level})</span>
                    </div>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                      {skill.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Compétences recherchées</h3>
              <div className="flex flex-wrap gap-2">
                {user.skillsNeeded.map((skill, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm">
                    {skill.skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Disponibilité</h3>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{user.availability}</span>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105">
                Envoyer un message
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105">
                Planifier une session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
        <Header />
        
        <div className="p-6 pb-24 min-h-[calc(100vh-200px)]">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'discover' && <DiscoverView />}
          {currentView === 'matches' && <MatchesView />}
          {currentView === 'sessions' && <SessionsView />}
          {currentView === 'messages' && <MessagesView />}
        </div>
        
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md">
          <Navigation />
        </div>
        
        {showProfile && (
          <ProfileModal user={showProfile} onClose={() => setShowProfile(null)} />
        )}
      </div>
      
      {/* Notifications flottantes */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {matches.length > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce-gentle">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {matches.length} nouveau{matches.length > 1 ? 'x' : ''} match{matches.length > 1 ? 's' : ''} !
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Système de crédits flottant */}
      <div className="fixed bottom-24 right-4 z-40">
        <div className="bg-white rounded-full shadow-lg p-3 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <div className="text-sm">
              <div className="font-bold text-gray-800">{currentUser?.credits || 0}</div>
              <div className="text-xs text-gray-600">crédits</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Aide contextuelle */}
      <div className="fixed top-20 left-4 z-30">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs animate-slide-up">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-xs">💡</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-1">Astuce SkillSwap</h4>
              <p className="text-xs text-gray-600">
                {currentView === 'dashboard' && "Complétez votre profil pour attirer plus de matches !"}
                {currentView === 'discover' && "Utilisez les filtres pour trouver exactement ce que vous cherchez."}
                {currentView === 'matches' && "Plus votre profil est détaillé, meilleurs seront vos matches !"}
                {currentView === 'sessions' && "Préparez vos sessions à l'avance pour une meilleure expérience."}
                {currentView === 'messages' && "Soyez courtois et précis dans vos échanges."}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animations de fond */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-200 to-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gradient-to-tr from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{animationDelay: '4s'}}></div>
      </div>
    </div>
  );
}

export default App;
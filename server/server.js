const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Configuration
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'skillswap_secret_key_2024';

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://yourapp.com' : 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuration base de données SQLite
const dbPath = path.join(__dirname, 'database', 'skillswap.db');
const dbDir = path.dirname(dbPath);

// Créer le dossier database s'il n'existe pas
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erreur connexion SQLite:', err.message);
    } else {
        console.log('✅ Connecté à la base de données SQLite');
        initializeDatabase();
    }
});

// Initialisation de la base de données
function initializeDatabase() {
    const initSQL = `
        -- Table des utilisateurs
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            bio TEXT,
            location VARCHAR(200),
            avatar VARCHAR(10) DEFAULT '👤',
            rating DECIMAL(3,2) DEFAULT 0.0,
            credits INTEGER DEFAULT 5,
            verified BOOLEAN DEFAULT 0,
            availability VARCHAR(100) DEFAULT 'Flexible',
            phone VARCHAR(20),
            languages VARCHAR(200),
            timezone VARCHAR(50),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Table des compétences
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL UNIQUE,
            category VARCHAR(50) NOT NULL,
            description TEXT,
            icon VARCHAR(50),
            popularity INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Table des compétences offertes
        CREATE TABLE IF NOT EXISTS user_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            skill_id INTEGER NOT NULL,
            level VARCHAR(20) NOT NULL,
            experience_years INTEGER DEFAULT 0,
            description TEXT,
            price_per_hour INTEGER DEFAULT 1,
            available BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
        );

        -- Table des compétences recherchées
        CREATE TABLE IF NOT EXISTS user_needs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            skill_id INTEGER NOT NULL,
            priority VARCHAR(20) DEFAULT 'Moyenne',
            max_credits_per_hour INTEGER DEFAULT 2,
            preferred_level VARCHAR(20) DEFAULT 'Intermédiaire',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
        );

        -- Table des matches
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id INTEGER NOT NULL,
            user2_id INTEGER NOT NULL,
            match_score DECIMAL(5,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            mutual_skills TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Table des sessions
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            skill_id INTEGER NOT NULL,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            date_time DATETIME NOT NULL,
            duration INTEGER NOT NULL,
            status VARCHAR(20) DEFAULT 'scheduled',
            credits_cost INTEGER NOT NULL,
            session_type VARCHAR(20) DEFAULT 'online',
            meeting_link VARCHAR(500),
            location VARCHAR(200),
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
        );

        -- Table des évaluations
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            reviewer_id INTEGER NOT NULL,
            reviewed_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            would_recommend BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
            FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Table des messages
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            message_type VARCHAR(20) DEFAULT 'text',
            read_status BOOLEAN DEFAULT 0,
            session_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;
    
    db.exec(initSQL, (err) => {
        if (err) {
            console.error('❌ Erreur initialisation BDD:', err.message);
        } else {
            console.log('✅ Base de données initialisée');
            seedInitialData();
        }
    });
}

// Données initiales
function seedInitialData() {
    // Vérifier si des données existent déjà
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err || row.count > 0) return;

        console.log('🌱 Insertion des données initiales...');

        // Compétences de base
        const skills = [
            { name: 'Français', category: 'Langues', description: 'Langue française', icon: '🇫🇷' },
            { name: 'Anglais', category: 'Langues', description: 'Langue anglaise', icon: '🇺🇸' },
            { name: 'Espagnol', category: 'Langues', description: 'Langue espagnole', icon: '🇪🇸' },
            { name: 'Allemand', category: 'Langues', description: 'Langue allemande', icon: '🇩🇪' },
            { name: 'Japonais', category: 'Langues', description: 'Langue japonaise', icon: '🇯🇵' },
            { name: 'Guitare', category: 'Musique', description: 'Instrument à cordes', icon: '🎸' },
            { name: 'Piano', category: 'Musique', description: 'Instrument à touches', icon: '🎹' },
            { name: 'React', category: 'Informatique', description: 'Framework JavaScript', icon: '⚛️' },
            { name: 'Python', category: 'Informatique', description: 'Langage de programmation', icon: '🐍' },
            { name: 'Design', category: 'Art', description: 'Conception graphique', icon: '🎨' },
            { name: 'Photographie', category: 'Art', description: 'Art photographique', icon: '📸' },
            { name: 'Cuisine française', category: 'Cuisine', description: 'Art culinaire français', icon: '🥖' },
            { name: 'Yoga', category: 'Sport', description: 'Pratique corporelle', icon: '🧘' }
        ];

        const skillInsert = db.prepare("INSERT INTO skills (name, category, description, icon) VALUES (?, ?, ?, ?)");
        skills.forEach(skill => {
            skillInsert.run(skill.name, skill.category, skill.description, skill.icon);
        });
        skillInsert.finalize();

        // Utilisateurs de démonstration
        const users = [
            {
                name: 'Marie Dubois',
                email: 'marie.dubois@email.com',
                password: 'password123',
                bio: 'Professeure de français passionnée, j\'adore partager ma langue natale !',
                location: 'Paris, France',
                avatar: '🇫🇷',
                rating: 4.8,
                credits: 12,
                verified: 1,
                availability: 'Flexible'
            },
            {
                name: 'Carlos Rodriguez',
                email: 'carlos.rodriguez@email.com',
                password: 'password123',
                bio: 'Guitariste depuis 15 ans, j\'enseigne avec passion !',
                location: 'Madrid, Espagne',
                avatar: '🇪🇸',
                rating: 4.9,
                credits: 8,
                verified: 1,
                availability: 'Soirées'
            },
            {
                name: 'Yuki Tanaka',
                email: 'yuki.tanaka@email.com',
                password: 'password123',
                bio: 'Développeur full-stack, j\'aime partager mes connaissances tech',
                location: 'Tokyo, Japon',
                avatar: '🇯🇵',
                rating: 4.7,
                credits: 15,
                verified: 1,
                availability: 'Week-ends'
            }
        ];

        const userInsert = db.prepare(`
            INSERT INTO users (name, email, password_hash, bio, location, avatar, rating, credits, verified, availability) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        users.forEach(user => {
            const hashedPassword = bcrypt.hashSync(user.password, 10);
            userInsert.run(
                user.name, user.email, hashedPassword, user.bio, user.location,
                user.avatar, user.rating, user.credits, user.verified, user.availability
            );
        });
        userInsert.finalize();

        console.log('✅ Données initiales insérées');
    });
}

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// ==================== ROUTES D'AUTHENTIFICATION ====================

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, bio, location, avatar, availability } = req.body;

        // Vérifier si l'utilisateur existe déjà
        db.get("SELECT id FROM users WHERE email = ?", [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur serveur' });
            }
            
            if (row) {
                return res.status(400).json({ error: 'Cet email est déjà utilisé' });
            }

            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insérer le nouvel utilisateur
            db.run(`
                INSERT INTO users (name, email, password_hash, bio, location, avatar, availability) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [name, email, hashedPassword, bio, location, avatar, availability], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors de la création du compte' });
                }

                // Créer le token JWT
                const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '7d' });

                res.status(201).json({
                    message: 'Compte créé avec succès',
                    token,
                    user: {
                        id: this.lastID,
                        name,
                        email,
                        bio,
                        location,
                        avatar,
                        credits: 5,
                        rating: 0,
                        verified: false
                    }
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur serveur' });
            }

            if (!user) {
                return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
            }

            // Vérifier le mot de passe
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
            }

            // Créer le token JWT
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

            // Récupérer les compétences de l'utilisateur
            getUserWithSkills(user.id, (userWithSkills) => {
                res.json({
                    message: 'Connexion réussie',
                    token,
                    user: userWithSkills
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ==================== ROUTES UTILISATEURS ====================

// Obtenir le profil utilisateur avec compétences
function getUserWithSkills(userId, callback) {
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            return callback(null);
        }

        // Récupérer les compétences offertes
        db.all(`
            SELECT s.name as skill, us.level, s.category, s.icon
            FROM user_skills us 
            JOIN skills s ON us.skill_id = s.id 
            WHERE us.user_id = ? AND us.available = 1
        `, [userId], (err, skillsOffered) => {
            
            // Récupérer les compétences recherchées
            db.all(`
                SELECT s.name as skill, s.category, s.icon, un.priority
                FROM user_needs un 
                JOIN skills s ON un.skill_id = s.id 
                WHERE un.user_id = ?
            `, [userId], (err, skillsNeeded) => {
                
                const userComplete = {
                    ...user,
                    skillsOffered: skillsOffered || [],
                    skillsNeeded: skillsNeeded || []
                };
                
                callback(userComplete);
            });
        });
    });
}

app.get('/api/users/me', authenticateToken, (req, res) => {
    getUserWithSkills(req.user.id, (user) => {
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json({ user });
    });
});

app.get('/api/users', authenticateToken, (req, res) => {
    const { category, search, limit = 20 } = req.query;
    
    let query = `
        SELECT u.*, 
               GROUP_CONCAT(DISTINCT s.name || '|' || us.level || '|' || s.category) as skills_offered
        FROM users u
        LEFT JOIN user_skills us ON u.id = us.user_id AND us.available = 1
        LEFT JOIN skills s ON us.skill_id = s.id
        WHERE u.id != ?
    `;
    
    const params = [req.user.id];

    if (category && category !== 'Toutes') {
        query += ' AND s.category = ?';
        params.push(category);
    }

    if (search) {
        query += ' AND (u.name LIKE ? OR s.name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY u.id ORDER BY u.rating DESC, u.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    db.all(query, params, (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
        }

        // Formater les compétences
        const formattedUsers = users.map(user => ({
            ...user,
            skillsOffered: user.skills_offered ? 
                user.skills_offered.split(',').map(skill => {
                    const [name, level, category] = skill.split('|');
                    return { skill: name, level, category };
                }) : [],
            verified: Boolean(user.verified)
        }));

        res.json({ users: formattedUsers });
    });
});

// ==================== ROUTES COMPÉTENCES ====================

app.get('/api/skills', (req, res) => {
    const { category } = req.query;
    
    let query = "SELECT * FROM skills";
    const params = [];
    
    if (category && category !== 'Toutes') {
        query += " WHERE category = ?";
        params.push(category);
    }
    
    query += " ORDER BY popularity DESC, name ASC";

    db.all(query, params, (err, skills) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des compétences' });
        }
        res.json({ skills });
    });
});

app.get('/api/skills/categories', (req, res) => {
    db.all("SELECT DISTINCT category FROM skills ORDER BY category", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        const categories = ['Toutes', ...rows.map(row => row.category)];
        res.json({ categories });
    });
});

// ==================== ROUTES MATCHES ====================

// Algorithme de matching intelligent
app.get('/api/matches', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // Récupérer l'utilisateur actuel avec ses compétences
    getUserWithSkills(userId, (currentUser) => {
        if (!currentUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Récupérer tous les autres utilisateurs avec leurs compétences
        db.all(`
            SELECT u.*, 
                   GROUP_CONCAT(DISTINCT so.name || '|' || uso.level || '|' || so.category) as skills_offered,
                   GROUP_CONCAT(DISTINCT sn.name || '|' || sn.category) as skills_needed
            FROM users u
            LEFT JOIN user_skills uso ON u.id = uso.user_id AND uso.available = 1
            LEFT JOIN skills so ON uso.skill_id = so.id
            LEFT JOIN user_needs un ON u.id = un.user_id  
            LEFT JOIN skills sn ON un.skill_id = sn.id
            WHERE u.id != ? AND u.verified = 1
            GROUP BY u.id
        `, [userId], (err, users) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors du calcul des matches' });
            }

            // Calculer les scores de matching
            const matches = users.map(user => {
                let matchScore = 0;
                let commonInterests = [];

                const userSkillsOffered = user.skills_offered ? 
                    user.skills_offered.split(',').map(skill => {
                        const [name, level, category] = skill.split('|');
                        return { skill: name, level, category };
                    }) : [];

                const userSkillsNeeded = user.skills_needed ?
                    user.skills_needed.split(',').map(skill => {
                        const [name, category] = skill.split('|');
                        return { skill: name, category };
                    }) : [];

                // Vérifier correspondances
                currentUser.skillsOffered.forEach(offered => {
                    userSkillsNeeded.forEach(needed => {
                        if (offered.skill.toLowerCase().includes(needed.skill.toLowerCase())) {
                            matchScore += 3;
                            commonInterests.push(`Vous enseignez ${offered.skill} → ${user.name} cherche ${needed.skill}`);
                        }
                    });
                });

                userSkillsOffered.forEach(offered => {
                    currentUser.skillsNeeded.forEach(needed => {
                        if (offered.skill.toLowerCase().includes(needed.skill.toLowerCase())) {
                            matchScore += 3;
                            commonInterests.push(`${user.name} enseigne ${offered.skill} → Vous cherchez ${needed.skill}`);
                        }
                    });
                });

                // Bonus géographique
                if (user.location && currentUser.location) {
                    const userCountry = user.location.split(',')[1]?.trim();
                    const currentCountry = currentUser.location.split(',')[1]?.trim();
                    if (userCountry === currentCountry) {
                        matchScore += 1;
                    }
                }

                // Bonus rating
                matchScore += user.rating * 0.5;

                return {
                    user: {
                        ...user,
                        skillsOffered: userSkillsOffered,
                        skillsNeeded: userSkillsNeeded,
                        verified: Boolean(user.verified)
                    },
                    score: matchScore,
                    interests: commonInterests
                };
            })
            .filter(match => match.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Top 10 matches

            res.json({ matches });
        });
    });
});

// ==================== ROUTES SESSIONS ====================

app.get('/api/sessions', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.all(`
        SELECT s.*, 
               ut.name as teacher_name, ut.avatar as teacher_avatar,
               us.name as student_name, us.avatar as student_avatar,
               sk.name as skill_name, sk.icon as skill_icon
        FROM sessions s
        JOIN users ut ON s.teacher_id = ut.id
        JOIN users us ON s.student_id = us.id  
        JOIN skills sk ON s.skill_id = sk.id
        WHERE s.teacher_id = ? OR s.student_id = ?
        ORDER BY s.date_time ASC
    `, [userId, userId], (err, sessions) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des sessions' });
        }

        const formattedSessions = sessions.map(session => ({
            ...session,
            isTeacher: session.teacher_id === userId,
            partner: session.teacher_id === userId ? 
                { name: session.student_name, avatar: session.student_avatar } :
                { name: session.teacher_name, avatar: session.teacher_avatar }
        }));

        res.json({ sessions: formattedSessions });
    });
});

app.post('/api/sessions', authenticateToken, (req, res) => {
    const { studentId, skillId, title, description, dateTime, duration, sessionType, location } = req.body;
    const teacherId = req.user.id;

    // Vérifier que l'enseignant possède cette compétence
    db.get(`
        SELECT us.*, s.name as skill_name 
        FROM user_skills us 
        JOIN skills s ON us.skill_id = s.id 
        WHERE us.user_id = ? AND us.skill_id = ? AND us.available = 1
    `, [teacherId, skillId], (err, userSkill) => {
        if (err || !userSkill) {
            return res.status(400).json({ error: 'Vous ne possédez pas cette compétence' });
        }

        const creditsRequired = Math.ceil(duration / 60); // 1 crédit par heure

        // Vérifier que l'étudiant a assez de crédits
        db.get("SELECT credits FROM users WHERE id = ?", [studentId], (err, student) => {
            if (err || !student) {
                return res.status(400).json({ error: 'Étudiant non trouvé' });
            }

            if (student.credits < creditsRequired) {
                return res.status(400).json({ error: 'Crédits insuffisants' });
            }

            // Créer la session
            db.run(`
                INSERT INTO sessions (teacher_id, student_id, skill_id, title, description, date_time, duration, credits_cost, session_type, location)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [teacherId, studentId, skillId, title, description, dateTime, duration, creditsRequired, sessionType, location], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors de la création de la session' });
                }

                res.status(201).json({
                    message: 'Session créée avec succès',
                    sessionId: this.lastID,
                    creditsRequired
                });
            });
        });
    });
});

// ==================== ROUTES MESSAGES ====================

app.get('/api/messages/:userId', authenticateToken, (req, res) => {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    db.all(`
        SELECT m.*, 
               us.name as sender_name, us.avatar as sender_avatar,
               ur.name as receiver_name, ur.avatar as receiver_avatar
        FROM messages m
        JOIN users us ON m.sender_id = us.id
        JOIN users ur ON m.receiver_id = ur.id
        WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC
    `, [currentUserId, otherUserId, otherUserId, currentUserId], (err, messages) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
        }

        res.json({ messages });
    });
});

app.post('/api/messages', authenticateToken, (req, res) => {
    const { receiverId, message, messageType = 'text', sessionId } = req.body;
    const senderId = req.user.id;

    db.run(`
        INSERT INTO messages (sender_id, receiver_id, message, message_type, session_id)
        VALUES (?, ?, ?, ?, ?)
    `, [senderId, receiverId, message, messageType, sessionId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
        }

        res.status(201).json({
            message: 'Message envoyé',
            messageId: this.lastID
        });
    });
});

// Obtenir les conversations
app.get('/api/conversations', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(`
        SELECT DISTINCT 
            CASE 
                WHEN m.sender_id = ? THEN ur.id 
                ELSE us.id 
            END as contact_id,
            CASE 
                WHEN m.sender_id = ? THEN ur.name 
                ELSE us.name 
            END as contact_name,
            CASE 
                WHEN m.sender_id = ? THEN ur.avatar 
                ELSE us.avatar 
            END as contact_avatar,
            m.message as last_message,
            m.created_at as last_message_time,
            COUNT(CASE WHEN m.receiver_id = ? AND m.read_status = 0 THEN 1 END) as unread_count
        FROM messages m
        JOIN users us ON m.sender_id = us.id
        JOIN users ur ON m.receiver_id = ur.id
        WHERE m.sender_id = ? OR m.receiver_id = ?
        GROUP BY contact_id
        ORDER BY m.created_at DESC
    `, [userId, userId, userId, userId, userId, userId], (err, conversations) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
        }

        res.json({ conversations });
    });
});

// ==================== ROUTES REVIEWS ====================

app.post('/api/reviews', authenticateToken, (req, res) => {
    const { sessionId, reviewedId, rating, comment, wouldRecommend } = req.body;
    const reviewerId = req.user.id;

    // Vérifier que la session existe et est terminée
    db.get(`
        SELECT * FROM sessions 
        WHERE id = ? AND (teacher_id = ? OR student_id = ?) AND status = 'completed'
    `, [sessionId, reviewerId, reviewerId], (err, session) => {
        if (err || !session) {
            return res.status(400).json({ error: 'Session non trouvée ou non terminée' });
        }

        // Vérifier qu'une review n'existe pas déjà
        db.get("SELECT id FROM reviews WHERE session_id = ? AND reviewer_id = ?", [sessionId, reviewerId], (err, existingReview) => {
            if (existingReview) {
                return res.status(400).json({ error: 'Vous avez déjà évalué cette session' });
            }

            // Créer la review
            db.run(`
                INSERT INTO reviews (session_id, reviewer_id, reviewed_id, rating, comment, would_recommend)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [sessionId, reviewerId, reviewedId, rating, comment, wouldRecommend], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors de la création de l\'évaluation' });
                }

                // Mettre à jour la note moyenne de l'utilisateur évalué
                db.get(`
                    SELECT AVG(CAST(rating as REAL)) as avg_rating 
                    FROM reviews 
                    WHERE reviewed_id = ?
                `, [reviewedId], (err, result) => {
                    if (!err && result.avg_rating) {
                        db.run("UPDATE users SET rating = ? WHERE id = ?", [
                            Math.round(result.avg_rating * 100) / 100, 
                            reviewedId
                        ]);
                    }
                });

                res.status(201).json({
                    message: 'Évaluation créée avec succès',
                    reviewId: this.lastID
                });
            });
        });
    });
});

// ==================== GESTION DES CRÉDITS ====================

app.post('/api/sessions/:id/complete', authenticateToken, (req, res) => {
    const sessionId = req.params.id;
    const userId = req.user.id;

    // Récupérer la session
    db.get("SELECT * FROM sessions WHERE id = ? AND (teacher_id = ? OR student_id = ?)", 
           [sessionId, userId, userId], (err, session) => {
        if (err || !session) {
            return res.status(404).json({ error: 'Session non trouvée' });
        }

        if (session.status !== 'scheduled') {
            return res.status(400).json({ error: 'Session déjà terminée ou annulée' });
        }

        // Marquer la session comme terminée
        db.run("UPDATE sessions SET status = 'completed' WHERE id = ?", [sessionId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la finalisation' });
            }

            // Transférer les crédits
            db.serialize(() => {
                // Débiter l'étudiant
                db.run("UPDATE users SET credits = credits - ? WHERE id = ?", 
                       [session.credits_cost, session.student_id]);
                
                // Créditer l'enseignant
                db.run("UPDATE users SET credits = credits + ? WHERE id = ?", 
                       [session.credits_cost, session.teacher_id]);
            });

            res.json({ message: 'Session terminée avec succès' });
        });
    });
});

// ==================== ROUTES DE PROFIL ====================

app.put('/api/users/me', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { name, bio, location, availability, avatar } = req.body;

    db.run(`
        UPDATE users 
        SET name = ?, bio = ?, location = ?, availability = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [name, bio, location, availability, avatar, userId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
        }

        getUserWithSkills(userId, (updatedUser) => {
            res.json({ 
                message: 'Profil mis à jour avec succès', 
                user: updatedUser 
            });
        });
    });
});

app.post('/api/users/skills', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { skillId, level, experienceYears, description } = req.body;

    // Vérifier que la compétence existe
    db.get("SELECT * FROM skills WHERE id = ?", [skillId], (err, skill) => {
        if (err || !skill) {
            return res.status(404).json({ error: 'Compétence non trouvée' });
        }

        // Ajouter ou mettre à jour la compétence
        db.run(`
            INSERT OR REPLACE INTO user_skills (user_id, skill_id, level, experience_years, description)
            VALUES (?, ?, ?, ?, ?)
        `, [userId, skillId, level, experienceYears, description], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de l\'ajout de la compétence' });
            }

            res.status(201).json({
                message: 'Compétence ajoutée avec succès',
                userSkillId: this.lastID
            });
        });
    });
});

app.post('/api/users/needs', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { skillId, priority, maxCreditsPerHour, preferredLevel, notes } = req.body;

    db.run(`
        INSERT OR REPLACE INTO user_needs (user_id, skill_id, priority, max_credits_per_hour, preferred_level, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, skillId, priority, maxCreditsPerHour, preferredLevel, notes], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de l\'ajout du besoin' });
        }

        res.status(201).json({
            message: 'Besoin ajouté avec succès',
            userNeedId: this.lastID
        });
    });
});

// ==================== ROUTES STATISTIQUES ====================

app.get('/api/stats/dashboard', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.serialize(() => {
        let stats = {};

        // Nombre de compétences offertes
        db.get("SELECT COUNT(*) as count FROM user_skills WHERE user_id = ? AND available = 1", 
               [userId], (err, result) => {
            stats.skillsOffered = result ? result.count : 0;
        });

        // Nombre de sessions terminées
        db.get("SELECT COUNT(*) as count FROM sessions WHERE (teacher_id = ? OR student_id = ?) AND status = 'completed'", 
               [userId, userId], (err, result) => {
            stats.completedSessions = result ? result.count : 0;
        });

        // Nombre de matches
        db.get("SELECT COUNT(*) as count FROM matches WHERE (user1_id = ? OR user2_id = ?) AND status = 'accepted'", 
               [userId, userId], (err, result) => {
            stats.activeMatches = result ? result.count : 0;
        });

        // Sessions à venir
        db.all(`
            SELECT s.*, u.name as partner_name, u.avatar as partner_avatar, sk.name as skill_name
            FROM sessions s
            JOIN users u ON (CASE WHEN s.teacher_id = ? THEN s.student_id ELSE s.teacher_id END) = u.id
            JOIN skills sk ON s.skill_id = sk.id
            WHERE (s.teacher_id = ? OR s.student_id = ?) AND s.status = 'scheduled' AND s.date_time > datetime('now')
            ORDER BY s.date_time ASC LIMIT 5
        `, [userId, userId, userId], (err, upcomingSessions) => {
            stats.upcomingSessions = upcomingSessions || [];
            
            res.json({ stats });
        });
    });
});

// ==================== GESTION DES ERREURS ====================

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err.stack);
    res.status(500).json({ 
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});

// Route 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Fermeture propre de la base de données
process.on('SIGINT', () => {
    console.log('\n🔄 Arrêt du serveur...');
    db.close((err) => {
        if (err) {
            console.error('❌ Erreur fermeture BDD:', err.message);
        } else {
            console.log('✅ Base de données fermée');
        }
        process.exit(0);
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur SkillSwap démarré sur le port ${PORT}`);
    console.log(`📊 API accessible sur http://localhost:${PORT}/api`);
    console.log(`🗄️ Base de données : ${dbPath}`);
});
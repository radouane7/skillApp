const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

console.log('🌱 Initialisation de la base de données SkillSwap...');

// Configuration base de données
const dbPath = path.join(__dirname, 'skillswap.db');
const dbDir = path.dirname(dbPath);

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erreur connexion SQLite:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connecté à la base de données SQLite');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Lire le script SQL d'initialisation
    const initSQLPath = path.join(__dirname, 'init.sql');
    
    if (!fs.existsSync(initSQLPath)) {
        console.error('❌ Fichier init.sql non trouvé');
        createInitSQL();
    } else {
        const initSQL = fs.readFileSync(initSQLPath, 'utf8');
        
        db.exec(initSQL, (err) => {
            if (err) {
                console.error('❌ Erreur initialisation BDD:', err.message);
                process.exit(1);
            } else {
                console.log('✅ Tables créées avec succès');
                seedData();
            }
        });
    }
}

function createInitSQL() {
    const initSQL = `
        -- SkillSwap Database Schema
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

        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL UNIQUE,
            category VARCHAR(50) NOT NULL,
            description TEXT,
            icon VARCHAR(50),
            popularity INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

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
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            reviewer_id INTEGER NOT NULL,
            reviewed_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            would_recommend BOOLEAN DEFAULT 1,
            skills_tags VARCHAR(200),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
            FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE
        );

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
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
        );

        -- Index pour performances
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating);
        CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
        CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(match_score);
        CREATE INDEX IF NOT EXISTS idx_sessions_datetime ON sessions(date_time);
    `;

    fs.writeFileSync(path.join(__dirname, 'init.sql'), initSQL);
    console.log('✅ Fichier init.sql créé');
    
    // Relancer l'initialisation
    initializeDatabase();
}

async function seedData() {
    try {
        // Vérifier si des données existent déjà
        db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
            if (err) {
                console.error('❌ Erreur vérification données:', err.message);
                return;
            }

            if (row.count > 0) {
                console.log('ℹ️ Données déjà présentes, skip du seed');
                db.close();
                return;
            }

            console.log('📝 Insertion des compétences...');

            // Insérer les compétences
            const skills = [
                { name: 'Français', category: 'Langues', description: 'Langue française', icon: '🇫🇷' },
                { name: 'Anglais', category: 'Langues', description: 'Langue anglaise', icon: '🇺🇸' },
                { name: 'Espagnol', category: 'Langues', description: 'Langue espagnole', icon: '🇪🇸' },
                { name: 'Allemand', category: 'Langues', description: 'Langue allemande', icon: '🇩🇪' },
                { name: 'Japonais', category: 'Langues', description: 'Langue japonaise', icon: '🇯🇵' },
                { name: 'Chinois', category: 'Langues', description: 'Langue chinoise', icon: '🇨🇳' },
                { name: 'Italien', category: 'Langues', description: 'Langue italienne', icon: '🇮🇹' },
                
                { name: 'Guitare', category: 'Musique', description: 'Instrument à cordes', icon: '🎸' },
                { name: 'Piano', category: 'Musique', description: 'Instrument à touches', icon: '🎹' },
                { name: 'Violon', category: 'Musique', description: 'Instrument à cordes', icon: '🎻' },
                { name: 'Batterie', category: 'Musique', description: 'Instrument de percussion', icon: '🥁' },
                { name: 'Chant', category: 'Musique', description: 'Art vocal', icon: '🎤' },
                { name: 'Saxophone', category: 'Musique', description: 'Instrument à vent', icon: '🎷' },
                
                { name: 'React', category: 'Informatique', description: 'Framework JavaScript', icon: '⚛️' },
                { name: 'Python', category: 'Informatique', description: 'Langage de programmation', icon: '🐍' },
                { name: 'JavaScript', category: 'Informatique', description: 'Langage web', icon: '🟨' },
                { name: 'Java', category: 'Informatique', description: 'Langage orienté objet', icon: '☕' },
                { name: 'Node.js', category: 'Informatique', description: 'Runtime JavaScript', icon: '🟢' },
                { name: 'SQL', category: 'Informatique', description: 'Langage de base de données', icon: '🗃️' },
                
                { name: 'Design graphique', category: 'Art', description: 'Conception visuelle', icon: '🎨' },
                { name: 'Photographie', category: 'Art', description: 'Art photographique', icon: '📸' },
                { name: 'Illustration', category: 'Art', description: 'Art de l\'illustration', icon: '✏️' },
                { name: 'Animation', category: 'Art', description: 'Art de l\'animation', icon: '🎬' },
                
                { name: 'Cuisine française', category: 'Cuisine', description: 'Art culinaire français', icon: '🥖' },
                { name: 'Cuisine italienne', category: 'Cuisine', description: 'Art culinaire italien', icon: '🍝' },
                { name: 'Cuisine japonaise', category: 'Cuisine', description: 'Art culinaire japonais', icon: '🍣' },
                { name: 'Pâtisserie', category: 'Cuisine', description: 'Art des desserts', icon: '🧁' },
                { name: 'Cuisine végétarienne', category: 'Cuisine', description: 'Cuisine sans viande', icon: '🥗' },
                
                { name: 'Yoga', category: 'Sport', description: 'Pratique corporelle et spirituelle', icon: '🧘' },
                { name: 'Tennis', category: 'Sport', description: 'Sport de raquette', icon: '🎾' },
                { name: 'Football', category: 'Sport', description: 'Sport collectif', icon: '⚽' },
                { name: 'Natation', category: 'Sport', description: 'Sport aquatique', icon: '🏊' },
                { name: 'Course à pied', category: 'Sport', description: 'Sport d\'endurance', icon: '🏃' },
                { name: 'Musculation', category: 'Sport', description: 'Renforcement musculaire', icon: '💪' },
                
                { name: 'Mathématiques', category: 'Sciences', description: 'Science des nombres', icon: '🔢' },
                { name: 'Physique', category: 'Sciences', description: 'Science de la matière', icon: '⚗️' },
                { name: 'Chimie', category: 'Sciences', description: 'Science des éléments', icon: '🧪' },
                { name: 'Biologie', category: 'Sciences', description: 'Science du vivant', icon: '🧬' }
            ];

            const skillInsert = db.prepare("INSERT INTO skills (name, category, description, icon) VALUES (?, ?, ?, ?)");
            skills.forEach(skill => {
                skillInsert.run(skill.name, skill.category, skill.description, skill.icon);
            });
            skillInsert.finalize();

            console.log('👥 Insertion des utilisateurs...');

            // Insérer les utilisateurs de démonstration
            const users = [
                {
                    name: 'Marie Dubois',
                    email: 'marie.dubois@skillswap.com',
                    password: 'password123',
                    bio: 'Professeure de français passionnée avec 10 ans d\'expérience. J\'adore partager ma langue natale et découvrir d\'autres cultures !',
                    location: 'Paris, France',
                    avatar: '🇫🇷',
                    rating: 4.8,
                    credits: 12,
                    verified: 1,
                    availability: 'Flexible',
                    languages: 'Français, Anglais',
                    timezone: 'Europe/Paris'
                },
                {
                    name: 'Carlos Rodriguez',
                    email: 'carlos.rodriguez@skillswap.com',
                    password: 'password123',
                    bio: 'Guitariste professionnel depuis 15 ans. J\'enseigne la guitare classique et moderne avec passion !',
                    location: 'Madrid, Espagne',
                    avatar: '🇪🇸',
                    rating: 4.9,
                    credits: 8,
                    verified: 1,
                    availability: 'Soirées et week-ends',
                    languages: 'Espagnol, Français, Anglais',
                    timezone: 'Europe/Madrid'
                },
                {
                    name: 'Yuki Tanaka',
                    email: 'yuki.tanaka@skillswap.com',
                    password: 'password123',
                    bio: 'Développeur full-stack avec 8 ans d\'expérience. Spécialisé en React et Node.js. J\'aime partager mes connaissances tech !',
                    location: 'Tokyo, Japon',
                    avatar: '🇯🇵',
                    rating: 4.7,
                    credits: 15,
                    verified: 1,
                    availability: 'Week-ends et soirées',
                    languages: 'Japonais, Anglais',
                    timezone: 'Asia/Tokyo'
                },
                {
                    name: 'Anna Schmidt',
                    email: 'anna.schmidt@skillswap.com',
                    password: 'password123',
                    bio: 'Professeure d\'allemand et passionnée de yoga. Je crois en l\'apprentissage holistique corps-esprit.',
                    location: 'Berlin, Allemagne',
                    avatar: '🇩🇪',
                    rating: 4.6,
                    credits: 10,
                    verified: 1,
                    availability: 'Matinées',
                    languages: 'Allemand, Anglais, Français',
                    timezone: 'Europe/Berlin'
                },
                {
                    name: 'Marco Rossi',
                    email: 'marco.rossi@skillswap.com',
                    password: 'password123',
                    bio: 'Chef cuisinier spécialisé dans la cuisine italienne traditionnelle. 12 ans d\'expérience en restauration.',
                    location: 'Rome, Italie',
                    avatar: '🇮🇹',
                    rating: 4.9,
                    credits: 6,
                    verified: 1,
                    availability: 'Après-midis',
                    languages: 'Italien, Anglais',
                    timezone: 'Europe/Rome'
                },
                {
                    name: 'Sophie Martin',
                    email: 'sophie.martin@skillswap.com',
                    password: 'password123',
                    bio: 'Photographe professionnelle et coach en développement personnel. J\'aide les gens à révéler leur potentiel créatif.',
                    location: 'Lyon, France',
                    avatar: '📸',
                    rating: 4.5,
                    credits: 14,
                    verified: 1,
                    availability: 'Variable selon projet',
                    languages: 'Français, Anglais',
                    timezone: 'Europe/Paris'
                }
            ];

            const userInsert = db.prepare(`
                INSERT INTO users (name, email, password_hash, bio, location, avatar, rating, credits, verified, availability, languages, timezone) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const user of users) {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                userInsert.run(
                    user.name, user.email, hashedPassword, user.bio, user.location,
                    user.avatar, user.rating, user.credits, user.verified,
                    user.availability, user.languages, user.timezone
                );
            }
            userInsert.finalize();

            console.log('🎯 Ajout des compétences utilisateurs...');

            // Associer les compétences aux utilisateurs
            const userSkills = [
                // Marie - Français, Cuisine française
                { userId: 1, skillName: 'Français', level: 'Expert', experienceYears: 10 },
                { userId: 1, skillName: 'Cuisine française', level: 'Intermédiaire', experienceYears: 5 },
                
                // Carlos - Guitare, Espagnol
                { userId: 2, skillName: 'Guitare', level: 'Expert', experienceYears: 15 },
                { userId: 2, skillName: 'Espagnol', level: 'Natif', experienceYears: 30 },
                
                // Yuki - React, Python, JavaScript
                { userId: 3, skillName: 'React', level: 'Expert', experienceYears: 5 },
                { userId: 3, skillName: 'Python', level: 'Avancé', experienceYears: 8 },
                { userId: 3, skillName: 'JavaScript', level: 'Expert', experienceYears: 8 },
                { userId: 3, skillName: 'Japonais', level: 'Natif', experienceYears: 25 },
                
                // Anna - Allemand, Yoga
                { userId: 4, skillName: 'Allemand', level: 'Natif', experienceYears: 25 },
                { userId: 4, skillName: 'Yoga', level: 'Avancé', experienceYears: 7 },
                
                // Marco - Cuisine italienne
                { userId: 5, skillName: 'Cuisine italienne', level: 'Expert', experienceYears: 12 },
                { userId: 5, skillName: 'Italien', level: 'Natif', experienceYears: 30 },
                
                // Sophie - Photographie
                { userId: 6, skillName: 'Photographie', level: 'Expert', experienceYears: 8 },
                { userId: 6, skillName: 'Design graphique', level: 'Avancé', experienceYears: 6 }
            ];

            const userSkillInsert = db.prepare(`
                INSERT INTO user_skills (user_id, skill_id, level, experience_years) 
                SELECT ?, s.id, ?, ? FROM skills s WHERE s.name = ?
            `);

            userSkills.forEach(us => {
                userSkillInsert.run(us.userId, us.level, us.experienceYears, us.skillName);
            });
            userSkillInsert.finalize();

            console.log('🔍 Ajout des besoins utilisateurs...');

            // Besoins des utilisateurs
            const userNeeds = [
                // Marie cherche guitare, photographie
                { userId: 1, skillName: 'Guitare', priority: 'Élevée' },
                { userId: 1, skillName: 'Photographie', priority: 'Moyenne' },
                
                // Carlos cherche français, programmation
                { userId: 2, skillName: 'Français', priority: 'Élevée' },
                { userId: 2, skillName: 'Python', priority: 'Moyenne' },
                
                // Yuki cherche piano, design
                { userId: 3, skillName: 'Piano', priority: 'Moyenne' },
                { userId: 3, skillName: 'Design graphique', priority: 'Élevée' },
                
                // Anna cherche cuisine italienne
                { userId: 4, skillName: 'Cuisine italienne', priority: 'Moyenne' },
                { userId: 4, skillName: 'Photographie', priority: 'Faible' },
                
                // Marco cherche anglais, design
                { userId: 5, skillName: 'Anglais', priority: 'Élevée' },
                { userId: 5, skillName: 'Design graphique', priority: 'Moyenne' },
                
                // Sophie cherche italien, yoga
                { userId: 6, skillName: 'Italien', priority: 'Moyenne' },
                { userId: 6, skillName: 'Yoga', priority: 'Élevée' }
            ];

            const userNeedInsert = db.prepare(`
                INSERT INTO user_needs (user_id, skill_id, priority) 
                SELECT ?, s.id, ? FROM skills s WHERE s.name = ?
            `);

            userNeeds.forEach(un => {
                userNeedInsert.run(un.userId, un.priority, un.skillName);
            });
            userNeedInsert.finalize();

            console.log('📅 Création de sessions d\'exemple...');

            // Sessions d'exemple
            const sessions = [
                {
                    teacherId: 2, studentId: 1, skillName: 'Guitare',
                    title: 'Cours de guitare débutant',
                    description: 'Apprentissage des accords de base',
                    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
                    duration: 60, creditssCost: 1, status: 'scheduled'
                },
                {
                    teacherId: 1, studentId: 2, skillName: 'Français',
                    title: 'Conversation française',
                    description: 'Pratique de la conversation quotidienne',
                    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Après-demain
                    duration: 60, creditssCost: 1, status: 'scheduled'
                },
                {
                    teacherId: 3, studentId: 1, skillName: 'React',
                    title: 'Introduction à React',
                    description: 'Premiers pas avec le framework React',
                    dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hier
                    duration: 90, creditssCost: 2, status: 'completed'
                }
            ];

            const sessionInsert = db.prepare(`
                INSERT INTO sessions (teacher_id, student_id, skill_id, title, description, date_time, duration, credits_cost, status)
                SELECT ?, ?, s.id, ?, ?, ?, ?, ?, ? FROM skills s WHERE s.name = ?
            `);

            sessions.forEach(session => {
                sessionInsert.run(
                    session.teacherId, session.studentId, session.title, 
                    session.description, session.dateTime, session.duration,
                    session.creditssCost, session.status, session.skillName
                );
            });
            sessionInsert.finalize();

            console.log('💬 Ajout de messages d\'exemple...');

            // Messages d'exemple
            const messages = [
                {
                    senderId: 2, receiverId: 1,
                    message: 'Salut Marie ! Merci pour le cours de français, c\'était génial ! 😊',
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // Il y a 2h
                },
                {
                    senderId: 1, receiverId: 2,
                    message: 'Avec plaisir Carlos ! J\'ai hâte d\'apprendre la guitare avec toi 🎸',
                    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // Il y a 1h
                },
                {
                    senderId: 3, receiverId: 1,
                    message: 'Bonjour Marie ! J\'ai préparé du matériel sur les hooks React pour notre prochaine session',
                    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // Il y a 30min
                }
            ];

            const messageInsert = db.prepare(`
                INSERT INTO messages (sender_id, receiver_id, message, created_at)
                VALUES (?, ?, ?, ?)
            `);

            messages.forEach(msg => {
                messageInsert.run(msg.senderId, msg.receiverId, msg.message, msg.createdAt);
            });
            messageInsert.finalize();

            console.log('⭐ Ajout de reviews d\'exemple...');

            // Reviews d'exemple
            const reviews = [
                {
                    sessionId: 3, reviewerId: 1, reviewedId: 3,
                    rating: 5, comment: 'Excellent professeur ! Yuki explique très clairement et avec patience.',
                    wouldRecommend: 1
                }
            ];

            const reviewInsert = db.prepare(`
                INSERT INTO reviews (session_id, reviewer_id, reviewed_id, rating, comment, would_recommend)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            reviews.forEach(review => {
                reviewInsert.run(
                    review.sessionId, review.reviewerId, review.reviewedId,
                    review.rating, review.comment, review.wouldRecommend
                );
            });
            reviewInsert.finalize();

            console.log('🎯 Création de matches intelligents...');

            // Créer quelques matches basés sur les correspondances
            const matches = [
                { user1Id: 1, user2Id: 2, matchScore: 6.4, mutualSkills: JSON.stringify(['Français ↔ Guitare']) },
                { user1Id: 1, user2Id: 6, matchScore: 4.8, mutualSkills: JSON.stringify(['Français ↔ Photographie']) },
                { user1Id: 3, user2Id: 6, matchScore: 5.2, mutualSkills: JSON.stringify(['React ↔ Design graphique']) },
                { user1Id: 4, user2Id: 5, matchScore: 4.9, mutualSkills: JSON.stringify(['Allemand ↔ Cuisine italienne']) }
            ];

            const matchInsert = db.prepare(`
                INSERT INTO matches (user1_id, user2_id, match_score, mutual_skills, status)
                VALUES (?, ?, ?, ?, 'pending')
            `);

            matches.forEach(match => {
                matchInsert.run(match.user1Id, match.user2Id, match.matchScore, match.mutualSkills);
            });
            matchInsert.finalize();

            console.log('✅ Base de données initialisée avec succès !');
            console.log('');
            console.log('📊 Résumé des données créées :');
            console.log(`   👥 ${users.length} utilisateurs`);
            console.log(`   🎯 ${skills.length} compétences`);
            console.log(`   📚 ${userSkills.length} compétences utilisateur`);
            console.log(`   🔍 ${userNeeds.length} besoins utilisateur`);
            console.log(`   📅 ${sessions.length} sessions`);
            console.log(`   💬 ${messages.length} messages`);
            console.log(`   ⭐ ${reviews.length} évaluations`);
            console.log(`   🤝 ${matches.length} matches`);
            console.log('');
            console.log('🔑 Comptes de test :');
            console.log('   marie.dubois@skillswap.com / password123');
            console.log('   carlos.rodriguez@skillswap.com / password123');
            console.log('   yuki.tanaka@skillswap.com / password123');
            console.log('');
            console.log('🚀 Vous pouvez maintenant lancer l\'application !');

            db.close((err) => {
                if (err) {
                    console.error('❌ Erreur fermeture BDD:', err.message);
                } else {
                    console.log('✅ Connexion base de données fermée');
                }
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('❌ Erreur lors du seed:', error);
        process.exit(1);
    }
}
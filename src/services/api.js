const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('skillswap_token');
    }

    // Configuration des headers avec authentification
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Méthode générique pour les requêtes
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: this.getHeaders(),
                ...options,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur réseau');
            }

            return data;
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    // ==================== AUTHENTIFICATION ====================

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        if (data.token) {
            this.token = data.token;
            localStorage.setItem('skillswap_token', data.token);
        }

        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (data.token) {
            this.token = data.token;
            localStorage.setItem('skillswap_token', data.token);
        }

        return data;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('skillswap_token');
    }

    isAuthenticated() {
        return !!this.token;
    }

    // ==================== UTILISATEURS ====================

    async getCurrentUser() {
        return this.request('/users/me');
    }

    async getUsers(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.limit) params.append('limit', filters.limit);

        return this.request(`/users?${params.toString()}`);
    }

    async updateProfile(profileData) {
        return this.request('/users/me', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    async addUserSkill(skillData) {
        return this.request('/users/skills', {
            method: 'POST',
            body: JSON.stringify(skillData),
        });
    }

    async addUserNeed(needData) {
        return this.request('/users/needs', {
            method: 'POST',
            body: JSON.stringify(needData),
        });
    }

    // ==================== COMPÉTENCES ====================

    async getSkills(category = null) {
        const params = category ? `?category=${category}` : '';
        return this.request(`/skills${params}`);
    }

    async getSkillCategories() {
        return this.request('/skills/categories');
    }

    // ==================== MATCHES ====================

    async getMatches() {
        return this.request('/matches');
    }

    async acceptMatch(matchId) {
        return this.request(`/matches/${matchId}/accept`, {
            method: 'POST',
        });
    }

    async declineMatch(matchId) {
        return this.request(`/matches/${matchId}/decline`, {
            method: 'POST',
        });
    }

    // ==================== SESSIONS ====================

    async getSessions() {
        return this.request('/sessions');
    }

    async createSession(sessionData) {
        return this.request('/sessions', {
            method: 'POST',
            body: JSON.stringify(sessionData),
        });
    }

    async completeSession(sessionId) {
        return this.request(`/sessions/${sessionId}/complete`, {
            method: 'POST',
        });
    }

    async cancelSession(sessionId) {
        return this.request(`/sessions/${sessionId}/cancel`, {
            method: 'POST',
        });
    }

    // ==================== MESSAGES ====================

    async getConversations() {
        return this.request('/conversations');
    }

    async getMessages(userId) {
        return this.request(`/messages/${userId}`);
    }

    async sendMessage(messageData) {
        return this.request('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData),
        });
    }

    async markMessagesAsRead(senderId) {
        return this.request('/messages/mark-read', {
            method: 'POST',
            body: JSON.stringify({ senderId }),
        });
    }

    // ==================== REVIEWS ====================

    async createReview(reviewData) {
        return this.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    }

    async getUserReviews(userId) {
        return this.request(`/users/${userId}/reviews`);
    }

    // ==================== STATISTIQUES ====================

    async getDashboardStats() {
        return this.request('/stats/dashboard');
    }

    // ==================== RECHERCHE AVANCÉE ====================

    async searchUsers(filters) {
        const params = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        return this.request(`/users/search?${params.toString()}`);
    }

    // ==================== NOTIFICATIONS ====================

    async getNotifications() {
        return this.request('/notifications');
    }

    async markNotificationAsRead(notificationId) {
        return this.request(`/notifications/${notificationId}/read`, {
            method: 'POST',
        });
    }

    // ==================== GESTION DES ERREURS ====================

    handleApiError(error) {
        if (error.message.includes('Token invalide') || error.message.includes('Token d\'accès requis')) {
            this.logout();
            window.location.href = '/login';
            return;
        }

        // Afficher l'erreur à l'utilisateur
        console.error('Erreur API:', error.message);
        return {
            success: false,
            error: error.message
        };
    }

    // ==================== UPLOAD DE FICHIERS ====================

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch(`${API_BASE_URL}/users/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
                body: formData,
            });

            return response.json();
        } catch (error) {
            throw new Error('Erreur lors de l\'upload de l\'avatar');
        }
    }

    // ==================== WEBSOCKET POUR TEMPS RÉEL ====================

    initializeWebSocket() {
        if (!this.token) return null;

        const socket = io('http://localhost:5000', {
            auth: {
                token: this.token
            }
        });

        socket.on('connect', () => {
            console.log('✅ WebSocket connecté');
        });

        socket.on('disconnect', () => {
            console.log('❌ WebSocket déconnecté');
        });

        return socket;
    }
}

// Instance singleton
const apiService = new ApiService();

export default apiService;

// Export des méthodes individuelles pour faciliter l'usage
export const {
    register,
    login,
    logout,
    getCurrentUser,
    getUsers,
    updateProfile,
    getSkills,
    getMatches,
    getSessions,
    createSession,
    getConversations,
    sendMessage,
    createReview,
    getDashboardStats
} = apiService;
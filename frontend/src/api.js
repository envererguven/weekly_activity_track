import axios from 'axios';

// For local dev, Vite proxies /api to backend:5000 if configured, 
// OR we rely on CORS. 
// My docker-compose maps backend:5000 to localhost:5000 and frontend:3000 to localhost:3000.
// So usage from browser perspective is localhost:5000.
// Ideally, use ENV var. Vite exposes import.meta.env.VITE_...

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

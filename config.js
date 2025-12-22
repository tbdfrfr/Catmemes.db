// Configuration for API endpoint
// For local development, use localhost
// For production, use your deployed backend URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'https://catmemesdb-production.up.railway.app'; // Your Railway backend URL

export default API_BASE_URL;

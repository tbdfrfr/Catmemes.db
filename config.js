// Configuration for API endpoint
// For local development, use localhost
// For production, use your deployed backend URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'catmemesdb-production.up.railway.app'; // Replace with your Render backend URL

export default API_BASE_URL;

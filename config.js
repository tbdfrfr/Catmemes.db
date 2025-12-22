// Configuration for API endpoint
// For local development, use localhost
// For production, use your deployed backend URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://catmemes-db-backend.onrender.com'; // Replace with your Render backend URL

export default API_BASE_URL;

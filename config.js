// Configuration for API endpoint
// For local development, use localhost
// For production, use your deployed backend URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://railway.com/project/0ec42841-5197-448f-bca8-cf05c882ad9e?environmentId=8e98c15a-d2f3-46a1-a26f-e971b9b02309'; // Replace with your Render backend URL

export default API_BASE_URL;

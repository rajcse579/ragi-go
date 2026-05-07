const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== ""
  ? 'http://localhost:8080/api' 
  : 'https://ragi-go-api-507797259572.us-central1.run.app/api';
export default API_BASE_URL;

const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8080/api' 
  : 'https://ragi-go-api-507797259572.us-central1.run.app/api';

export default API_BASE_URL;

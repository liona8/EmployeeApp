import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log('🔧 API Configuration:');
console.log('   - Base URL:', API_BASE_URL);
console.log('   - Environment:', import.meta.env.MODE);
console.log('   - Dev?:', import.meta.env.DEV);
console.log('   - Prod?:', import.meta.env.PROD);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout:600000,
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`\n🚀 REQUEST DETAILS:`);
    console.log(`   Method: ${config.method.toUpperCase()}`);
    console.log(`   Full URL: ${config.baseURL}${config.url}`);
    console.log(`   Params:`, config.params || 'none');
    console.log(`   Data:`, config.data || 'none');
    console.log(`   Headers:`, config.headers);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`\n✅ RESPONSE SUCCESS:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data:`, response.data);
    return response;
  },
  (error) => {
    console.log(`\n❌ RESPONSE ERROR:`, error.message);
    if (error.response) {
      const status = error.response.status;
      let errorMessage = `Server error (${status})`;
      if (status === 400) errorMessage = 'Bad request. Please check your input.';
      else if (status === 401) errorMessage = 'Unauthorized. Please log in again.';
      else if (status === 403) errorMessage = 'Forbidden. You don\'t have permission.';
      else if (status === 404) errorMessage = 'Resource not found.';
      else if (status === 422) errorMessage = 'Validation error. Please check your input.';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Cannot connect to server. Please check your connection.');
    } else {
      throw error;
    }
  }
);

// Optional health check method
api.testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ Health check passed:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default api; // ✅ default export required
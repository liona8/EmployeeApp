import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log('🔧 API Configuration:');
console.log('   - Base URL:', API_BASE_URL);
console.log('   - Environment:', import.meta.env.MODE);
console.log('   - Dev?:', import.meta.env.DEV);
console.log('   - Prod?:', import.meta.env.PROD);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

// Add request interceptor for debugging
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`\n✅ RESPONSE SUCCESS:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    console.log(`   Data:`, response.data);
    return response;
  },
  (error) => {
    console.log(`\n❌ RESPONSE ERROR:`);
    
    if (error.code === 'ECONNABORTED') {
      console.error('   Timeout Error - Request took too long');
      throw new Error('Request timeout. Please try again.');
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error(`   Status Code: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
      console.error(`   Response Data:`, error.response.data);
      console.error(`   Response Headers:`, error.response.headers);
      
      // Format the error message based on status code
      let errorMessage = `Server error (${error.response.status})`;
      
      if (error.response.status === 400) {
        errorMessage = 'Bad request. Please check your input.';
      } else if (error.response.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.response.status === 403) {
        errorMessage = 'Forbidden. You don\'t have permission.';
      } else if (error.response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.response.status === 422) {
        errorMessage = 'Validation error. Please check your input format.';
        console.error('   Validation Details:', error.response.data.detail);
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      throw new Error(errorMessage);
      
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`   Request was made but no response received`);
      console.error(`   Request details:`, error.request);
      
      // Check if it's a CORS error
      if (error.message.includes('CORS')) {
        console.error(`   🚫 CORS ERROR: Backend is blocking requests from origin`);
        console.error(`   Solution: Add CORS middleware to backend or use proxy`);
        throw new Error('CORS error: Backend is blocking your request');
      }
      
      // Check if it's a network error
      if (error.message.includes('Network Error')) {
        console.error(`   🌐 NETWORK ERROR: Cannot reach the server`);
        console.error(`   Check if: backend is running, URL is correct, you're online`);
        throw new Error('Network error. Please check your connection.');
      }
      
      throw new Error('Cannot connect to server. Please check your connection.');
      
    } else {
      // Something happened in setting up the request
      console.error(`   Request setup error:`, error.message);
      console.error(`   Full error object:`, error);
      throw error;
    }
  }
);

// Add a method to test the connection
api.testConnection = async () => {
  console.log('\n🔍 TESTING CONNECTION...');
  try {
    const response = await api.get('/health');
    console.log('✅ Health check passed:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default api;
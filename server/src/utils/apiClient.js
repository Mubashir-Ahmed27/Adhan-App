const axios = require('axios');

class ApiClient {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Adhan-App/1.0'
      },
      ...options
    };
  }
  
  async get(endpoint, params = {}, headers = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params,
        headers: { ...this.options.headers, ...headers },
        timeout: this.options.timeout
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  async post(endpoint, data = {}, headers = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
        headers: { ...this.options.headers, ...headers },
        timeout: this.options.timeout
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  async put(endpoint, data = {}, headers = {}) {
    try {
      const response = await axios.put(`${this.baseUrl}${endpoint}`, data, {
        headers: { ...this.options.headers, ...headers },
        timeout: this.options.timeout
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  async delete(endpoint, headers = {}) {
    try {
      const response = await axios.delete(`${this.baseUrl}${endpoint}`, {
        headers: { ...this.options.headers, ...headers },
        timeout: this.options.timeout
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      const { status, data } = error.response;
      throw new Error(`API Error: ${status} - ${JSON.stringify(data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(`API Error: No response received - ${error.message}`);
    } else {
      // Something happened in setting up the request
      throw new Error(`API Error: ${error.message}`);
    }
  }
}

// Create Aladhan API client
const aladhanClient = new ApiClient(
  process.env.ALADHAN_API_BASE || 'https://api.aladhan.com/v1'
);

// Create OpenStreetMap API client
const osmClient = new ApiClient(
  process.env.OPENSTREETMAP_API_BASE || 'https://nominatim.openstreetmap.org'
);

module.exports = {
  ApiClient,
  aladhanClient,
  osmClient
};

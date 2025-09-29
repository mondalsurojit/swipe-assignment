// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  // Helper method for making API requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth related methods
  async validateReferralCode(code) {
    return this.request('/validate-referral', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  async verifyToken(token) {
    return this.request('/verify-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  // Resume upload
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch(`${API_BASE_URL}/upload-resume`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    
    return data;
  }

  // Interview methods
  async startInterview(candidateId, userInfo) {
    return this.request('/start-interview', {
      method: 'POST',
      body: JSON.stringify({ candidateId, userInfo })
    });
  }

  async submitAnswer(sessionId, answer) {
    return this.request('/submit-answer', {
      method: 'POST',
      body: JSON.stringify({ sessionId, answer })
    });
  }

  async terminateInterview(sessionId) {
    return this.request('/terminate-interview', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  }

  async getSession(sessionId) {
    return this.request(`/session/${sessionId}`);
  }

  async updateUserInfo(sessionId, userInfo) {
    return this.request('/update-user-info', {
      method: 'POST',
      body: JSON.stringify({ sessionId, userInfo })
    });
  }

  // Dashboard methods
  async getCandidates(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/candidates?${searchParams.toString()}`);
  }

  async getCandidateDetails(sessionId) {
    return this.request(`/candidate/${sessionId}`);
  }

  async deleteCandidate(sessionId) {
    return this.request(`/candidate/${sessionId}`, {
      method: 'DELETE'
    });
  }
}

export default new ApiService();
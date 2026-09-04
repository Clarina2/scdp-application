/**
 * API Client for SCDP Backend
 * Handles authentication, token management, and HTTP requests
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      console.log('[API] Request:', { method: config.method || 'GET', url });
      const response = await fetch(url, config);
      
      if (response.status === 401 && endpoint !== '/auth/login') {
        // Unauthorized - clear token and redirect to login
        console.warn('[API] Unauthorized response, redirecting to login:', { url });
        this.setToken(null);
        window.location.href = '/';
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        console.error('[API] Request failed:', {
          method: config.method || 'GET',
          url,
          status: response.status,
          message: error.message || error.detail || 'Request failed',
        });
        throw new Error(error.message || error.detail || 'Request failed');
      }

      console.log('[API] Request succeeded:', { method: config.method || 'GET', url, status: response.status });
      return await response.json();
    } catch (error) {
      console.error('[API] Request error:', { method: config.method || 'GET', url, message: error.message });
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async postFormData(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/';
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || error.detail || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API formData request failed:', error);
      throw error;
    }
  }
}

// Auth API
export const authApi = {
  login: async (email, password) => {
    const client = new ApiClient();
    const response = await client.post('/auth/login', { email, password });
    if (response.accessToken) {
      client.setToken(response.accessToken);
    }
    return response;
  },

  getProfile: async () => {
    const client = new ApiClient();
    return client.get('/auth/me');
  },

  changePassword: async (oldPassword, newPassword) => {
    const client = new ApiClient();
    return client.post('/auth/password/change', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  logout: () => {
    const client = new ApiClient();
    client.setToken(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('otpCode');
    return Promise.resolve({ success: true });
  },
};

// Stock API
export const stockApi = {
  getStock: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/stock/', params);
  },

  getRegions: async () => {
    const client = new ApiClient();
    return client.get('/stock/metadata/regions');
  },

  getDepots: async (regionCode = null) => {
    const client = new ApiClient();
    const params = regionCode ? { region_code: regionCode } : {};
    return client.get('/stock/metadata/depots', params);
  },

  getProducts: async (depotCode = null) => {
    const client = new ApiClient();
    const params = depotCode ? { depot_code: depotCode } : {};
    return client.get('/stock/metadata/products', params);
  },

  getCities: async () => {
    const client = new ApiClient();
    return client.get('/stock/metadata/cities');
  },

  getSummary: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/stock/summary', params);
  },

  getStockByProduct: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/stock/by-product', params);
  },
};

// Receptions API
export const receptionsApi = {
  getReceptions: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/receptions/', params);
  },

  getDepots: async () => {
    const client = new ApiClient();
    return client.get('/receptions/metadata/depots');
  },

  getProducts: async () => {
    const client = new ApiClient();
    return client.get('/receptions/metadata/products');
  },

  getDistributors: async () => {
    const client = new ApiClient();
    return client.get('/receptions/metadata/distributors');
  },

  getOrigins: async () => {
    const client = new ApiClient();
    return client.get('/receptions/metadata/origins');
  },

  exportCsv: async (params = {}) => {
    const client = new ApiClient();
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/receptions/export/csv?${queryString}` : '/receptions/export/csv';
    const response = await fetch(`${client.baseURL}${url}`, {
      method: 'GET',
      headers: client.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'receptions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  previewExport: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/receptions/export/preview', params);
  },
};

// Exits API
export const exitsApi = {
  getExits: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/exits/', params);
  },

  getDepots: async () => {
    const client = new ApiClient();
    return client.get('/exits/metadata/depots');
  },

  getProducts: async () => {
    const client = new ApiClient();
    return client.get('/exits/metadata/products');
  },

  getDistributors: async () => {
    const client = new ApiClient();
    return client.get('/exits/metadata/distributors');
  },

  getDestinations: async () => {
    const client = new ApiClient();
    return client.get('/exits/metadata/destinations');
  },

  exportCsv: async (params = {}) => {
    const client = new ApiClient();
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/exits/export/csv?${queryString}` : '/exits/export/csv';
    const response = await fetch(`${client.baseURL}${url}`, {
      method: 'GET',
      headers: client.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'sorties.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  previewExport: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/exits/export/preview', params);
  },
};

// Admin API
export const adminApi = {
  getDistributors: async () => {
    const client = new ApiClient();
    return client.get('/admin/distributors');
  },

  getMarketers: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/admin/marketers', params);
  },

  createMarketer: async (data) => {
    const client = new ApiClient();
    return client.post('/admin/marketers', data);
  },

  updateMarketerStatus: async (marketerId, isActive) => {
    const client = new ApiClient();
    return client.patch(`/admin/marketers/${marketerId}/status`, { isActive });
  },

  deleteMarketer: async (marketerId) => {
    const client = new ApiClient();
    return client.delete(`/admin/marketers/${marketerId}`);
  },

  createAdmin: async (data) => {
    const client = new ApiClient();
    return client.post('/admin/admins', data);
  },

  getDashboardSummary: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/admin/dashboard/summary', params);
  },

  triggerSync: async (tables = null) => {
    const client = new ApiClient();
    return client.post('/admin/synchronization/run', tables ? { tables } : {});
  },

  getSyncHistory: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/admin/synchronization/runs', params);
  },

  getCityStatistics: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/admin/dashboard/statistics/cities', params);
  },

  getMarketerStatistics: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/admin/dashboard/statistics/marketers', params);
  },

  getDepotStockStatistics: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/admin/dashboard/stock/depots', params);
  },

  createStockGestionnaire: async (data) => {
    const client = new ApiClient();
    return client.post('/admin/stock-gestionnaires', data);
  },

  getStockGestionnaires: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/admin/stock-gestionnaires', params);
  },

  updateStockGestionnaireStatus: async (gestionnaireId, isActive) => {
    const client = new ApiClient();
    return client.patch(`/admin/stock-gestionnaires/${gestionnaireId}/status`, { isActive });
  },

  deleteStockGestionnaire: async (gestionnaireId) => {
    const client = new ApiClient();
    return client.delete(`/admin/stock-gestionnaires/${gestionnaireId}`);
  },

  createAdminWithOtp: async (data) => {
    const client = new ApiClient();
    return client.post('/admin/admins-otp', data);
  },

  getAdmins: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/admin/admins', params);
  },

  updateAdminStatus: async (adminId, isActive) => {
    const client = new ApiClient();
    return client.patch(`/admin/admins/${adminId}/status`, { isActive });
  },

  deleteAdmin: async (adminId) => {
    const client = new ApiClient();
    return client.delete(`/admin/admins/${adminId}`);
  },

  viewAsUser: async (userId) => {
    const client = new ApiClient();
    const response = await client.post(`/admin/view-as/${userId}`);
    if (response.accessToken) {
      client.setToken(response.accessToken);
    }
    return response;
  },

  exitViewAs: async () => {
    const client = new ApiClient();
    const response = await client.post('/admin/exit-view-as');
    if (response.accessToken) {
      client.setToken(response.accessToken);
    }
    return response;
  },
};

// Auth OTP API
export const otpApi = {
  sendOtp: async (email, type = 'ACCOUNT_VERIFICATION') => {
    const client = new ApiClient();
    return client.post('/auth/otp/send', { email, type });
  },

  verifyOtp: async (email, code, type = 'ACCOUNT_VERIFICATION') => {
    const client = new ApiClient();
    return client.post('/auth/otp/verify', { email, code, type });
  },

  setInitialPassword: async (email, code, password) => {
    const client = new ApiClient();
    return client.post('/auth/password/set-initial', { email, code, password });
  },
};

// Stock Gestionnaire Document API
export const stockGestionnaireApi = {
  uploadDocument: async (formData) => {
    const client = new ApiClient();
    return client.postFormData('/stock-gestionnaire/documents', formData);
  },

  getDocuments: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/stock-gestionnaire/documents', params);
  },

  getDocumentFileUrl: (documentId) => {
    return `${API_BASE_URL}/stock-gestionnaire/documents/${documentId}/file`;
  },

  getDepots: async (params = {}) => {
    const client = new ApiClient();
    return client.get('/stock/metadata/depots', params);
  },

  downloadDocument: async (documentId, fileName = 'rapport_stock.pdf') => {
    const client = new ApiClient();
    const url = `${client.baseURL}/stock-gestionnaire/documents/${documentId}/file`;
    const response = await fetch(url, {
      method: 'GET',
      headers: client.getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Échec du téléchargement' }));
      throw new Error(err.detail || err.message || 'Échec du téléchargement');
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  fetchDocumentBlobUrl: async (documentId) => {
    const client = new ApiClient();
    const url = `${client.baseURL}/stock-gestionnaire/documents/${documentId}/file`;
    const response = await fetch(url, {
      method: 'GET',
      headers: client.getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Échec de la prévisualisation' }));
      throw new Error(err.detail || err.message || 'Échec de la prévisualisation');
    }
    const blob = await response.blob();
    return window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
  },
};

// User Settings API
export const userSettingsApi = {
  getSettings: async () => {
    const client = new ApiClient();
    return client.get('/user/settings/');
  },

  updateSettings: async (data) => {
    const client = new ApiClient();
    return client.put('/user/settings/', data);
  },

  changePassword: async (oldPassword, newPassword) => {
    const client = new ApiClient();
    return client.post('/auth/password/change', { old_password: oldPassword, new_password: newPassword });
  },
};

export default new ApiClient();

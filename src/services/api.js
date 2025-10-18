import axios from 'axios';

// Safari/iOS detection utility
const isSafariOrIOS = () => {
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isMac = /Macintosh/.test(userAgent);
  return isSafari || isIOS || isMac;
};

// Create axios instance for admin API
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
});

let isRefreshing = false;
let failedQueue = [];
let adminAuthToken = null;

// Token queue processor
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor for Safari/iOS fallback
adminApi.interceptors.request.use(
  async (config) => {
    // Always attach the adminAuthToken if it exists
    if (adminAuthToken) {
      config.headers.Authorization = `Bearer ${adminAuthToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with Safari/iOS token extraction
adminApi.interceptors.response.use(
  (response) => {
    if (isSafariOrIOS() && response.headers['x-auth-token']) {
      adminAuthToken = response.headers['x-auth-token'];
      localStorage.setItem('safari_admin_auth_token', adminAuthToken);
    }
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      adminAuthToken = null;
      localStorage.removeItem('admin-auth');
      localStorage.removeItem('safari_admin_auth_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Initialize Safari/iOS fallback token on app start
if (isSafariOrIOS()) {
  const storedAdminToken = localStorage.getItem('safari_admin_auth_token');
  if (storedAdminToken) {
    adminAuthToken = storedAdminToken;
  }
}

// Admin Auth API
export const adminAuthAPI = {
  login: (credentials) => adminApi.post('/admin/auth/login', credentials),
  logout: () => adminApi.post('/admin/auth/logout'),
  getCurrentAdmin: () => adminApi.get('/admin/auth/me'),
  refreshToken: () => adminApi.post('/admin/auth/refresh'),
};

// Safari/iOS token management
export const setAdminSafariAuthToken = (token) => {
  if (isSafariOrIOS()) {
    adminAuthToken = token;
    localStorage.setItem('safari_admin_auth_token', token);
  }
};

export const clearAdminSafariAuthToken = () => {
  if (isSafariOrIOS()) {
    adminAuthToken = null;
    localStorage.removeItem('safari_admin_auth_token');
  }
};

// Products API for admin (updated with discount support)
export const adminProductsAPI = {
  getProducts: (params) => adminApi.get('/admin/products', { params }),
  getProduct: (id) => adminApi.get(`/admin/products/${id}`),
  createProduct: (productData) => adminApi.post('/admin/products', productData),
  updateProduct: (id, productData) => adminApi.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => adminApi.delete(`/admin/products/${id}`),
};

// Upload API for admin
export const uploadAPI = {
  uploadProductFiles: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return adminApi.post('/upload/product-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
  },
  deleteFile: (publicId) => adminApi.delete('/upload/images', { data: { publicId } }),
};

// Orders API for admin
export const ordersAPI = {
  getOrders: (params) => adminApi.get('/admin/orders', { params }),
  getOrder: (id) => adminApi.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, statusData) => adminApi.patch(`/admin/orders/${id}/status`, statusData),
  generateOTP: (orderId) => adminApi.post(`/admin/orders/${orderId}/generate-otp`),
  verifyOTP: (orderId, otp) => adminApi.post(`/admin/orders/${orderId}/verify-otp`, { otp }),
};

export const inventoryAPI = {
  getLowStock: () => adminApi.get('/admin/products/inventory/low-stock'),
  getOutOfStock: () => adminApi.get('/admin/products/inventory/out-of-stock'),
  updateStock: (id, stockData) => adminApi.patch(`/admin/products/${id}/stock`, stockData),
  bulkUpdateStock: (updates) => adminApi.patch('/admin/products/bulk-stock', { updates }),
};

export const customersAPI = {
  getAllCustomers: (params) => adminApi.get('/admin/customers', { params }),
  getCustomers: (params) => adminApi.get('/admin/customers', { params }),
  getCustomer: (id) => adminApi.get(`/admin/customers/${id}`),
  updateCustomer: (id, customerData) => adminApi.put(`/admin/customers/${id}`, customerData),
  updateCustomerStatus: (id, status) => adminApi.patch(`/admin/customers/${id}/status`, { status }),
};

export const campaignsAPI = {
  getCampaigns: (params) => adminApi.get('/admin/campaigns', { params }),
  getCampaign: (id) => adminApi.get(`/admin/campaigns/${id}`),
  createCampaign: (campaignData) => adminApi.post('/admin/campaigns', campaignData),
  updateCampaign: (id, campaignData) => adminApi.put(`/admin/campaigns/${id}`, campaignData),
  deleteCampaign: (id) => adminApi.delete(`/admin/campaigns/${id}`),
  sendCampaign: (id) => adminApi.post(`/admin/campaigns/${id}/send`),
};

// Analytics API for admin
export const analyticsAPI = {
  getDashboardStats: () => adminApi.get('/admin/analytics/dashboard'),
  getRevenueAnalytics: (params) => adminApi.get('/admin/analytics/revenue', { params }),
  getCustomerAnalytics: (params) => adminApi.get('/admin/analytics/customers', { params }),
  getProductAnalytics: (params) => adminApi.get('/admin/analytics/products', { params }),
  getBrandSizeAnalytics: () => adminApi.get('/admin/analytics/brand-size'),
  getSalesData: (params) => adminApi.get('/admin/analytics/revenue', { params }),
};

// Broadcast API for admin
export const broadcastAPI = {
  sendBroadcastEmail: (emailData) => adminApi.post('/admin/broadcast/email', emailData),
  sendTargetedEmail: (emailData) => adminApi.post('/admin/broadcast/email/targeted', emailData),
};

// Error handling utility
export const handleAPIError = (error, defaultMessage = 'An unexpected error occurred.') => {
  console.error('API Error:', error);
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

export default adminApi;

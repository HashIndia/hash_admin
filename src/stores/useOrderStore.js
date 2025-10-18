import { create } from 'zustand';
import { ordersAPI, handleAPIError } from '../services/api.js';

// Mock data for development
const mockOrders = [
  {
    _id: 'ORD-1756873879613-JGSH',
    id: 'ORD001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1 234 567 8900',
    customerAddress: '123 Main St, New York, NY 10001',
    total: 1399,
    totalAmount: 1399,
    status: 'pending',
    orderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    trackingNumber: null,
    otpVerified: false,
    items: [
      { 
        name: 'Cotton T-Shirt', 
        quantity: 2, 
        price: 299, 
        size: 'M', 
        color: 'Black',
        image: '/api/placeholder/100/100'
      },
      { 
        name: 'Denim Jeans', 
        quantity: 1, 
        price: 799, 
        size: 'L', 
        color: 'Blue',
        image: '/api/placeholder/100/100'
      }
    ],
    notes: null
  },
  {
    _id: 'ORD-1756846208365-ECIJ',
    id: 'ORD002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+1 234 567 8901',
    customerAddress: '456 Oak Ave, Los Angeles, CA 90210',
    total: 1199,
    totalAmount: 1199,
    status: 'shipped',
    orderDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    trackingNumber: 'TRK123456789',
    otpVerified: false,
    items: [
      { 
        name: 'Summer Dress', 
        quantity: 1, 
        price: 599, 
        size: 'S', 
        color: 'Red',
        image: '/api/placeholder/100/100'
      },
      { 
        name: 'Cotton T-Shirt', 
        quantity: 2, 
        price: 299, 
        size: 'L', 
        color: 'White',
        image: '/api/placeholder/100/100'
      }
    ],
    notes: 'Customer requested express shipping'
  },
  {
    _id: 'ORD-1756753684925-TED3',
    id: 'ORD003',
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
    customerPhone: '+1 234 567 8902',
    customerAddress: '789 Pine St, Chicago, IL 60601',
    total: 897,
    totalAmount: 897,
    status: 'delivered',
    orderDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    trackingNumber: 'TRK987654321',
    otpVerified: true,
    items: [
      { 
        name: 'Cotton T-Shirt', 
        quantity: 1, 
        price: 299, 
        size: 'M', 
        color: 'Black',
        image: '/api/placeholder/100/100'
      },
      { 
        name: 'Denim Jeans', 
        quantity: 1, 
        price: 799, 
        size: 'M', 
        color: 'Blue',
        image: '/api/placeholder/100/100'
      }
    ],
    notes: null
  },
  {
    _id: 'ORD-1756747252098-7TGR',
    id: 'ORD004',
    customerName: 'Alice Brown',
    customerEmail: 'alice@example.com',
    customerPhone: '+1 234 567 8903',
    customerAddress: '321 Elm St, Miami, FL 33101',
    total: 1497,
    totalAmount: 1497,
    status: 'shipped',
    orderDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    trackingNumber: 'TRK555444333',
    otpVerified: false,
    items: [
      { 
        name: 'Summer Dress', 
        quantity: 2, 
        price: 599, 
        size: 'M', 
        color: 'Green',
        image: '/api/placeholder/100/100'
      },
      { 
        name: 'Cotton T-Shirt', 
        quantity: 1, 
        price: 299, 
        size: 'S', 
        color: 'White',
        image: '/api/placeholder/100/100'
      }
    ],
    notes: 'Gift wrapping requested'
  },
  {
    _id: 'ORD-1756745953196-CCIR',
    id: 'ORD005',
    customerName: 'Charlie Wilson',
    customerEmail: 'charlie@example.com',
    customerPhone: '+1 234 567 8904',
    customerAddress: '654 Maple Ave, Seattle, WA 98101',
    total: 2095,
    totalAmount: 2095,
    status: 'confirmed',
    orderDate: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    trackingNumber: null,
    otpVerified: true,
    items: [
      { 
        name: 'Denim Jeans', 
        quantity: 2, 
        price: 799, 
        size: 'L', 
        color: 'Black',
        image: '/api/placeholder/100/100'
      },
      { 
        name: 'Cotton T-Shirt', 
        quantity: 2, 
        price: 299, 
        size: 'L', 
        color: 'Black',
        image: '/api/placeholder/100/100'
      }
    ],
    notes: null
  }
];

const useOrderStore = create((set, get) => ({
  // State
  orders: [],
  searchTerm: '',
  statusFilter: 'all',
  dateRange: 'all',
  otps: {}, // Store OTPs for orders
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  analytics: {
    summary: null,
    dailyStats: []
  },
  isLoading: false,
  error: null,

  // Order Management Actions
  loadOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();
      const queryParams = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        ...params
      };

      const response = await ordersAPI.getAllOrders(queryParams);
      
      set({
        orders: response.data.orders,
        pagination: {
          page: response.page,
          limit: response.limit || 10,
          total: response.total,
          totalPages: response.totalPages
        },
        isLoading: false
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  loadOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersAPI.getOrder(orderId);
      set({ 
        selectedOrder: response.data.order, 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  updateOrderStatus: async (orderId, statusData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersAPI.updateOrderStatus(orderId, statusData);
      const updatedOrder = response.data.order;
      
      set(state => ({
        orders: state.orders.map(order =>
          order._id === orderId ? updatedOrder : order
        ),
        selectedOrder: state.selectedOrder?._id === orderId ? updatedOrder : state.selectedOrder,
        isLoading: false
      }));
      
      return { success: true, data: updatedOrder };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Analytics Actions
  loadOrderAnalytics: async (period = '30d') => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersAPI.getOrderAnalytics(period);
      
      set({
        analytics: {
          summary: response.data.summary,
          dailyStats: response.data.dailyStats
        },
        isLoading: false
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Filter and Search Actions
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 } // Reset to first page
    }));
    
    // Automatically reload orders with new filters
    get().loadOrders();
  },

  clearFilters: () => {
    const defaultFilters = {
      status: 'all',
      paymentStatus: 'all',
      search: '',
      startDate: '',
      endDate: ''
    };
    
    set({ 
      filters: defaultFilters,
      pagination: { ...get().pagination, page: 1 }
    });
    
    get().loadOrders();
  },

  searchOrders: (searchTerm) => {
    set(state => ({
      filters: { ...state.filters, search: searchTerm },
      pagination: { ...state.pagination, page: 1 }
    }));
    
    get().loadOrders();
  },

  // Pagination Actions
  setPage: (page) => {
    set(state => ({
      pagination: { ...state.pagination, page }
    }));
    get().loadOrders();
  },

  nextPage: () => {
    const { pagination } = get();
    if (pagination.page < pagination.totalPages) {
      get().setPage(pagination.page + 1);
    }
  },

  prevPage: () => {
    const { pagination } = get();
    if (pagination.page > 1) {
      get().setPage(pagination.page - 1);
    }
  },

  // Utility Actions
  getOrderById: (orderId) => {
    const { orders } = get();
    return orders.find(order => order._id === orderId);
  },

  getOrdersByStatus: (status) => {
    const { orders } = get();
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  },

  getOrdersCount: () => {
    const { orders } = get();
    return {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      processing: orders.filter(order => order.status === 'processing').length,
      shipped: orders.filter(order => order.status === 'shipped').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length,
    };
  },

  getTotalRevenue: () => {
    const { orders } = get();
    return orders
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => total + order.total, 0);
  },

  getRecentOrders: (limit = 5) => {
    const { orders } = get();
    return orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  // Clear actions
  clearSelectedOrder: () => set({ selectedOrder: null }),
  clearError: () => set({ error: null }),

  // New actions for mock data
  setSearchTerm: (term) => set({ searchTerm: term }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setDateRange: (range) => set({ dateRange: range }),
  
  // Update order status
  updateOrderStatus: (orderId, newStatus) => {
    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId 
          ? { ...order, status: newStatus, trackingNumber: newStatus === 'shipped' ? `TRK${Date.now()}` : order.trackingNumber }
          : order
      )
    }));
  },
  
  // Generate OTP for order
  generateOTP: (orderId) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    set(state => ({
      otps: { ...state.otps, [orderId]: otp }
    }));
    return otp;
  },
  
  // Verify OTP
  verifyOTP: (orderId, enteredOTP) => {
    const state = get();
    const storedOTP = state.otps[orderId];
    
    if (storedOTP === enteredOTP) {
      // Mark order as delivered and OTP verified
      set(state => ({
        orders: state.orders.map(order =>
          order.id === orderId 
            ? { ...order, status: 'delivered', otpVerified: true }
            : order
        ),
        otps: { ...state.otps, [orderId]: null } // Clear OTP after verification
      }));
      return true;
    }
    return false;
  },
  
  // Add note to order
  addOrderNote: (orderId, note) => {
    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId 
          ? { ...order, notes: note }
          : order
      )
    }));
  }
}));

export default useOrderStore;
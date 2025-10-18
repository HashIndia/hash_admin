import { create } from 'zustand';
import { customersAPI, handleAPIError } from '../services/api.js';

// Mock data for development
const mockCustomers = [
  {
    id: 'cust-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    status: 'active',
    tags: ['VIP', 'Loyal Customer'],
    totalOrders: 15,
    totalSpent: 2340.50,
    lastOrder: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: false
    }
  },
  {
    id: 'cust-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 234 567 8901',
    status: 'active',
    tags: ['New Customer'],
    totalOrders: 3,
    totalSpent: 287.99,
    lastOrder: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true
    }
  },
  {
    id: 'cust-3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1 234 567 8902',
    status: 'active',
    tags: ['Loyal Customer'],
    totalOrders: 8,
    totalSpent: 1150.75,
    lastOrder: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    preferences: {
      emailNotifications: false,
      smsNotifications: true,
      whatsappNotifications: true
    }
  },
  {
    id: 'cust-4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    phone: '+1 234 567 8903',
    status: 'inactive',
    tags: ['VIP'],
    totalOrders: 25,
    totalSpent: 4567.80,
    lastOrder: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: false
    }
  }
];

const useCustomerStore = create((set, get) => ({
  // State
  customers: [],
  searchTerm: '',
  statusFilter: 'all',
  selectedCustomers: [],
  filters: {
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    order: 'desc'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  isLoading: false,
  error: null,

  // Customer Management Actions
  loadCustomers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();
      const queryParams = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        _t: Date.now(), // Add timestamp to prevent caching
        ...params
      };

      const response = await customersAPI.getAllCustomers(queryParams);
      
      const customers = response.data?.customers || response.customers || [];
      
      // Transform customers to ensure they have the expected format
      const transformedCustomers = customers.map(customer => ({
        ...customer,
        id: customer._id || customer.id, // Ensure 'id' field exists
        status: customer.status || 'active', // Ensure status field exists
        totalOrders: customer.totalOrders || 0,
        totalSpent: customer.totalSpent || 0,
        tags: customer.tags || [],
        lastOrder: customer.lastOrder || null, // Handle missing lastOrder
        lastLogin: customer.lastLogin || customer.createdAt, // Use createdAt as fallback
        preferences: customer.preferences || {
          emailNotifications: true,
          smsNotifications: true,
          whatsappNotifications: false
        }
      }));
      
      set({
        customers: transformedCustomers,
        pagination: {
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 1
        },
        isLoading: false
      });
      
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage, customers: [] });
    }
  },

  loadCustomer: async (customerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await customersAPI.getCustomer(customerId);
      set({ 
        selectedCustomer: response.data.customer, 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  updateCustomerStatus: async (customerId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await customersAPI.updateCustomerStatus(customerId, status);
      const updatedCustomer = response.data.customer;
      
      set(state => ({
        customers: state.customers.map(customer =>
          (customer._id === customerId || customer.id === customerId) ? 
          { ...customer, status } : customer
        ),
        selectedCustomer: (state.selectedCustomer?._id === customerId || state.selectedCustomer?.id === customerId) ? 
          { ...state.selectedCustomer, status } : state.selectedCustomer,
        isLoading: false
      }));
      
      return { success: true, data: updatedCustomer };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Filter and Search Actions
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 } // Reset to first page
    }));
    
    // Automatically reload customers with new filters
    get().loadCustomers();
  },

  clearFilters: () => {
    const defaultFilters = {
      search: '',
      status: 'all',
      sortBy: 'createdAt',
      order: 'desc'
    };
    
    set({ 
      filters: defaultFilters,
      pagination: { ...get().pagination, page: 1 }
    });
    
    get().loadCustomers();
  },

  searchCustomers: (searchTerm) => {
    set(state => ({
      filters: { ...state.filters, search: searchTerm },
      pagination: { ...state.pagination, page: 1 }
    }));
    
    get().loadCustomers();
  },

  // Pagination Actions
  setPage: (page) => {
    set(state => ({
      pagination: { ...state.pagination, page }
    }));
    get().loadCustomers();
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

  // Customer selection
  selectCustomer: (customerId) => {
    set(state => {
      const isSelected = state.selectedCustomers.includes(customerId);
      return {
        selectedCustomers: isSelected
          ? state.selectedCustomers.filter(id => id !== customerId)
          : [...state.selectedCustomers, customerId]
      };
    });
  },
  
  selectAllCustomers: () => {
    const state = get();
    const allCustomerIds = state.customers.map(c => c.id || c._id);
    set({ selectedCustomers: allCustomerIds });
  },
  
  deselectAllCustomers: () => {
    set({ selectedCustomers: [] });
  },
  
  // Get selected customers
  getSelectedCustomers: () => {
    const state = get();
    return state.customers.filter(customer => 
      state.selectedCustomers.includes(customer.id || customer._id)
    );
  },
  
  // Get customer stats
  getCustomerStats: () => {
    const state = get();
    const total = state.customers.length;
    const vip = state.customers.filter(c => c.tags && c.tags.includes('VIP')).length;
    const active = state.customers.filter(c => c.status === 'active').length;
    const totalRevenue = state.customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    
    return { total, vip, active, totalRevenue };
  },

  // Utility Actions
  getCustomerById: (customerId) => {
    const { customers } = get();
    return customers.find(customer => 
      customer._id === customerId || customer.id === customerId
    );
  },

  getCustomersByStatus: (status) => {
    const { customers } = get();
    if (status === 'all') return customers;
    
    if (status === 'verified') {
      return customers.filter(customer => customer.phoneVerified);
    } else if (status === 'unverified') {
      return customers.filter(customer => !customer.phoneVerified);
    }
    
    return customers.filter(customer => customer.status === status);
  },

  getCustomersCount: () => {
    const { customers } = get();
    return {
      total: customers.length,
      verified: customers.filter(customer => customer.phoneVerified).length,
      unverified: customers.filter(customer => !customer.phoneVerified).length,
      active: customers.filter(customer => customer.status === 'active').length,
      inactive: customers.filter(customer => customer.status === 'inactive').length,
    };
  },

  getTopCustomers: (limit = 5) => {
    const { customers } = get();
    return customers
      .filter(customer => customer.orderStats)
      .sort((a, b) => (b.orderStats.totalSpent || 0) - (a.orderStats.totalSpent || 0))
      .slice(0, limit);
  },

  getRecentCustomers: (limit = 5) => {
    const { customers } = get();
    return customers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  // Clear actions
  clearSelectedCustomer: () => set({ selectedCustomer: null }),
  clearError: () => set({ error: null }),
  
  // Initialize store by loading customers
  initialize: async () => {
    const { loadCustomers } = get();
    await loadCustomers();
  },

  // Stats helper
  getCustomerStats: () => {
    const { customers } = get();
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active' || !c.status).length;
    const verified = customers.filter(c => c.isPhoneVerified).length;
    
    return { total, active, verified };
  }
}));

export default useCustomerStore;
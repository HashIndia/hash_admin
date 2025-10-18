import { create } from 'zustand';
import { analyticsAPI, handleAPIError } from '../services/api.js';

const useAnalyticsStore = create((set, get) => ({
  // State
  dashboardStats: null,
  revenueAnalytics: null,
  customerAnalytics: null,
  productAnalytics: null,
  brandSizeAnalytics: null,
  isLoading: false,
  error: null,

  // Actions
  loadDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await analyticsAPI.getDashboardStats();
      set({
        dashboardStats: response.data,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      console.error('Failed to load dashboard stats:', error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  loadRevenueAnalytics: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await analyticsAPI.getRevenueAnalytics(params);
      set({
        revenueAnalytics: response.data,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      console.error('Failed to load revenue analytics:', error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  loadCustomerAnalytics: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await analyticsAPI.getCustomerAnalytics(params);
      set({
        customerAnalytics: response.data,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      console.error('Failed to load customer analytics:', error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  loadProductAnalytics: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await analyticsAPI.getProductAnalytics(params);
      set({
        productAnalytics: response.data,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      console.error('Failed to load product analytics:', error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Initialize store by loading all analytics data

  loadBrandSizeAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await analyticsAPI.getBrandSizeAnalytics();
      set({
        brandSizeAnalytics: response.data,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      console.error('Failed to load brand size analytics:', error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Initialize store by loading all analytics data
  initialize: async () => {
    const { loadDashboardStats, loadRevenueAnalytics, loadCustomerAnalytics, loadProductAnalytics, loadBrandSizeAnalytics } = get();
    await Promise.all([
      loadDashboardStats(),
      loadRevenueAnalytics(),
      loadCustomerAnalytics(),
      loadProductAnalytics(),
      loadBrandSizeAnalytics()
    ]);
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useAnalyticsStore;

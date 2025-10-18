import { create } from 'zustand';
import { campaignsAPI, customersAPI, handleAPIError } from '../services/api.js';

// Mock campaigns data
const mockCampaigns = [
  {
    id: 'camp-1',
    name: 'Summer Sale 2024',
    type: 'email',
    subject: 'Don\'t Miss Our Summer Sale - Up to 50% Off!',
    content: 'Get ready for summer with our amazing collection. Shop now and save big on all your favorite items.',
    status: 'completed',
    recipients: 'all_customers',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    sentCount: 1250,
    deliveredCount: 1198,
    openedCount: 456,
    clickedCount: 89
  },
  {
    id: 'camp-2',
    name: 'New Collection Alert',
    type: 'sms',
    content: 'Check out our new arrivals! Fresh styles just dropped. Visit our store now.',
    status: 'completed',
    recipients: 'vip_customers',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    sentCount: 89,
    deliveredCount: 87,
    openedCount: 34,
    clickedCount: 12
  },
  {
    id: 'camp-3',
    name: 'Cart Abandonment Follow-up',
    type: 'email',
    subject: 'You left something behind...',
    content: 'Complete your purchase and get free shipping on your order.',
    status: 'draft',
    recipients: 'custom_list',
    createdAt: new Date().toISOString(),
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    clickedCount: 0
  }
];

// Mock templates data
const mockTemplates = [
  {
    id: 'tmpl-1',
    name: 'Welcome Email',
    type: 'email',
    subject: 'Welcome to Our Store!',
    content: 'Thank you for joining us! Here\'s a special 10% off coupon for your first purchase.'
  },
  {
    id: 'tmpl-2',
    name: 'Order Confirmation',
    type: 'email',
    subject: 'Your Order is Confirmed',
    content: 'We\'ve received your order and it\'s being processed. You\'ll receive tracking information soon.'
  },
  {
    id: 'tmpl-3',
    name: 'Flash Sale SMS',
    type: 'sms',
    content: 'FLASH SALE! 24 hours only - 30% off everything. Use code FLASH30. Shop now!'
  },
  {
    id: 'tmpl-4',
    name: 'Birthday Wishes',
    type: 'whatsapp',
    content: 'Happy Birthday! 🎉 Celebrate with a special 25% discount on your next purchase.'
  }
];

const useBroadcastStore = create((set, get) => ({
  // State
  campaigns: [],
  templates: mockTemplates,
  currentCampaign: {
    name: '',
    type: 'email',
    subject: '',
    content: '',
    recipients: 'all_customers'
  },
  filters: {
    type: 'all',
    status: 'all',
    search: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  isLoading: false,
  error: null,
  recipients: {
    all: [],
    verified: [],
    custom: []
  },

  // Campaign Management Actions
  loadCampaigns: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();
      const queryParams = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        ...params
      };

      const response = await campaignsAPI.getCampaigns(queryParams);
      
      set({
        campaigns: response.data.campaigns,
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
      console.error('Failed to load campaigns:', error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  loadCampaign: async (campaignId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsAPI.getCampaign(campaignId);
      set({ 
        selectedCampaign: response.data.campaign, 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
    }
  },

  createCampaign: async (campaignData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsAPI.createCampaign(campaignData);
      const newCampaign = response.data.campaign;
      
      set(state => ({
        campaigns: [newCampaign, ...state.campaigns],
        isLoading: false
      }));
      
      return { success: true, data: newCampaign };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateCampaign: async (campaignId, campaignData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsAPI.updateCampaign(campaignId, campaignData);
      const updatedCampaign = response.data.campaign;
      
      set(state => ({
        campaigns: state.campaigns.map(campaign =>
          campaign._id === campaignId ? updatedCampaign : campaign
        ),
        selectedCampaign: state.selectedCampaign?._id === campaignId ? updatedCampaign : state.selectedCampaign,
        isLoading: false
      }));
      
      return { success: true, data: updatedCampaign };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  deleteCampaign: async (campaignId) => {
    set({ isLoading: true, error: null });
    try {
      await campaignsAPI.deleteCampaign(campaignId);
      
      set(state => ({
        campaigns: state.campaigns.filter(campaign => campaign._id !== campaignId),
        selectedCampaign: state.selectedCampaign?._id === campaignId ? null : state.selectedCampaign,
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  sendCampaign: async (campaignId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsAPI.sendCampaign(campaignId);
      const updatedCampaign = response.data.campaign;
      
      set(state => ({
        campaigns: state.campaigns.map(campaign =>
          campaign._id === campaignId ? updatedCampaign : campaign
        ),
        selectedCampaign: state.selectedCampaign?._id === campaignId ? updatedCampaign : state.selectedCampaign,
        isLoading: false
      }));
      
      return { 
        success: true, 
        data: updatedCampaign,
        message: response.message,
        stats: {
          successCount: response.successCount,
          failureCount: response.failureCount,
          totalRecipients: response.totalRecipients
        }
      };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Template Management Actions
  loadTemplates: async () => {
    try {
      const response = await campaignsAPI.getCampaignTemplates();
      set({ templates: response.data.templates });
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  },

  createTemplate: async (templateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsAPI.createTemplate(templateData);
      const newTemplate = response.data.template;
      
      set(state => ({
        templates: [...state.templates, newTemplate],
        isLoading: false
      }));
      
      return { success: true, data: newTemplate };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Recipients Management
  loadRecipients: async () => {
    try {
      // Load all customers for recipient targeting
      const allResponse = await customersAPI.getAllCustomers({ limit: 1000 });
      const verifiedResponse = await customersAPI.getAllCustomers({ 
        status: 'verified', 
        limit: 1000 
      });
      
      set({
        recipients: {
          all: allResponse.data.customers,
          verified: verifiedResponse.data.customers,
          custom: []
        }
      });
    } catch (error) {
      console.error('Failed to load recipients:', error);
    }
  },

  setCustomRecipients: (customRecipients) => {
    set(state => ({
      recipients: {
        ...state.recipients,
        custom: customRecipients
      }
    }));
  },

  // Filter and Search Actions
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 } // Reset to first page
    }));
    
    // Automatically reload campaigns with new filters
    get().loadCampaigns();
  },

  clearFilters: () => {
    const defaultFilters = {
      type: 'all',
      status: 'all',
      search: ''
    };
    
    set({ 
      filters: defaultFilters,
      pagination: { ...get().pagination, page: 1 }
    });
    
    get().loadCampaigns();
  },

  searchCampaigns: (searchTerm) => {
    set(state => ({
      filters: { ...state.filters, search: searchTerm },
      pagination: { ...state.pagination, page: 1 }
    }));
    
    get().loadCampaigns();
  },

  // Pagination Actions
  setPage: (page) => {
    set(state => ({
      pagination: { ...state.pagination, page }
    }));
    get().loadCampaigns();
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
  getCampaignById: (campaignId) => {
    const { campaigns } = get();
    return campaigns.find(campaign => campaign._id === campaignId);
  },

  getCampaignsByType: (type) => {
    const { campaigns } = get();
    if (type === 'all') return campaigns;
    return campaigns.filter(campaign => campaign.type === type);
  },

  getCampaignsByStatus: (status) => {
    const { campaigns } = get();
    if (status === 'all') return campaigns;
    return campaigns.filter(campaign => campaign.status === status);
  },

  getCampaignsCount: () => {
    const { campaigns } = get();
    return {
      total: campaigns.length,
      draft: campaigns.filter(campaign => campaign.status === 'draft').length,
      sent: campaigns.filter(campaign => campaign.status === 'sent').length,
      scheduled: campaigns.filter(campaign => campaign.status === 'scheduled').length,
      email: campaigns.filter(campaign => campaign.type === 'email').length,
      sms: campaigns.filter(campaign => campaign.type === 'sms').length,
    };
  },

  getRecentCampaigns: (limit = 5) => {
    const { campaigns } = get();
    return campaigns
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  getTemplateById: (templateId) => {
    const { templates } = get();
    return templates.find(template => template._id === templateId);
  },

  getTemplatesByType: (type) => {
    const { templates } = get();
    if (type === 'all') return templates;
    return templates.filter(template => template.type === type);
  },

  // Analytics
  getCampaignAnalytics: () => {
    const { campaigns } = get();
    const sentCampaigns = campaigns.filter(campaign => campaign.status === 'sent');
    
    if (sentCampaigns.length === 0) {
      return {
        totalSent: 0,
        totalRecipients: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        successRate: 0
      };
    }

    const totalSent = sentCampaigns.length;
    const totalRecipients = sentCampaigns.reduce((sum, campaign) => sum + (campaign.sentCount || 0), 0);
    const totalOpened = sentCampaigns.reduce((sum, campaign) => sum + (campaign.openedCount || 0), 0);
    const totalClicked = sentCampaigns.reduce((sum, campaign) => sum + (campaign.clickedCount || 0), 0);
    const totalSuccess = sentCampaigns.reduce((sum, campaign) => sum + (campaign.sentCount || 0), 0);
    const totalAttempted = sentCampaigns.reduce((sum, campaign) => sum + (campaign.totalRecipients || 0), 0);

    return {
      totalSent,
      totalRecipients,
      avgOpenRate: totalRecipients > 0 ? (totalOpened / totalRecipients) * 100 : 0,
      avgClickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      successRate: totalAttempted > 0 ? (totalSuccess / totalAttempted) * 100 : 0
    };
  },

  // Clear actions
  clearSelectedCampaign: () => set({ selectedCampaign: null }),
  clearError: () => set({ error: null }),

  // New actions for current campaign
  setCampaignField: (field, value) => {
    set(state => ({
      currentCampaign: { ...state.currentCampaign, [field]: value }
    }));
  },
  
  resetCurrentCampaign: () => {
    set({
      currentCampaign: {
        name: '',
        type: 'email',
        subject: '',
        content: '',
        recipients: 'all_customers'
      }
    });
  },
  
  loadTemplate: (templateId) => {
    const state = get();
    const template = state.templates.find(t => t.id === templateId);
    if (template) {
      set({
        currentCampaign: {
          name: template.name,
          type: template.type,
          subject: template.subject || '',
          content: template.content,
          recipients: 'all_customers'
        }
      });
    }
  },
  
  saveCampaign: async (campaign) => {
    const newCampaign = {
      ...campaign,
      id: `camp-${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0
    };
    
    set(state => ({
      campaigns: [...state.campaigns, newCampaign]
    }));
    
    return { success: true };
  },
  
  deleteCampaign: (campaignId) => {
    set(state => ({
      campaigns: state.campaigns.filter(c => c.id !== campaignId)
    }));
  },
  
  duplicateCampaign: (campaignId) => {
    const state = get();
    const campaign = state.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      const duplicated = {
        ...campaign,
        id: `camp-${Date.now()}`,
        name: `${campaign.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0
      };
      
      set(state => ({
        campaigns: [...state.campaigns, duplicated]
      }));
    }
  },

  // Initialize store by loading campaigns
  initialize: async () => {
    const { loadCampaigns } = get();
    await loadCampaigns();
  }
}));

export default useBroadcastStore;
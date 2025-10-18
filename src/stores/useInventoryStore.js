import { create } from 'zustand';

// Mock data for development
const mockProducts = [
  {
    id: 'prod-1',
    name: 'Cotton T-Shirt',
    category: 'T-Shirts',
    price: 29.99,
    stock: 45,
    sku: 'TSH-001',
    images: ['https://placehold.co/400x500/64748b/fff?text=T-Shirt'],
    description: 'Comfortable cotton t-shirt',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Denim Jeans',
    category: 'Jeans',
    price: 79.99,
    stock: 23,
    sku: 'JNS-001',
    images: ['https://placehold.co/400x500/64748b/fff?text=Jeans'],
    description: 'Classic denim jeans',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Summer Dress',
    category: 'Dresses',
    price: 59.99,
    stock: 18,
    sku: 'DRS-001',
    images: ['https://placehold.co/400x500/64748b/fff?text=Dress'],
    description: 'Light summer dress',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Leather Belt',
    category: 'Accessories',
    price: 39.99,
    stock: 8,
    sku: 'ACC-001',
    images: ['https://placehold.co/400x500/64748b/fff?text=Belt'],
    description: 'Genuine leather belt',
    createdAt: new Date().toISOString()
  }
];

const useInventoryStore = create((set, get) => ({
  // State
  products: mockProducts,
  searchTerm: '',
  selectedCategory: 'all',
  sortBy: 'name',
  
  // Actions
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSortBy: (sort) => set({ sortBy: sort }),
  
  // Add product
  addProduct: (product) => {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set(state => ({
      products: [...state.products, newProduct]
    }));
  },
  
  // Update product
  updateProduct: (id, updates) => {
    set(state => ({
      products: state.products.map(product =>
        product.id === id ? { ...product, ...updates } : product
      )
    }));
  },
  
  // Delete product
  deleteProduct: (id) => {
    set(state => ({
      products: state.products.filter(product => product.id !== id)
    }));
  }
}));

export default useInventoryStore;
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { adminProductsAPI } from '../services/api';
import toast from 'react-hot-toast';
import AddProductModal from '../components/AddProductModal';
import ProductViewModal from '../components/ProductViewModal';

const Inventory = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          search: searchTerm,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: sortBy
        };
        const response = await adminProductsAPI.getProducts(params);
        setProducts(response?.data?.products || []);
      } catch (error) {
        toast.error('Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return uniqueCategories.filter(Boolean);
  }, [products]);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminProductsAPI.deleteProduct(id);
        setProducts(prev => prev.filter(p => p._id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    if (stock < 20) return { label: 'Medium Stock', color: 'bg-blue-100 text-blue-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const handleProductAdded = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(prev => prev.map(p => 
      p._id === updatedProduct._id ? updatedProduct : p
    ));
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleToggleTrending = async (product) => {
    try {
      await adminProductsAPI.updateProduct(product._id, {
        isTrending: !product.isTrending,
      });
      setProducts(prev =>
        prev.map(p =>
          p._id === product._id ? { ...p, isTrending: !p.isTrending } : p
        )
      );
      toast.success(
        `Product marked as ${!product.isTrending ? "Trending" : "Not Trending"}`
      );
    } catch (error) {
      toast.error("Failed to update trending status");
    }
  };

  const handleToggleHero = async (product) => {
    try {
      await adminProductsAPI.updateProduct(product._id, {
        isHero: !product.isHero,
      });
      setProducts(prev =>
        prev.map(p =>
          p._id === product._id ? { ...p, isHero: !p.isHero } : p
        )
      );
      toast.success(
        `Product marked as ${!product.isHero ? "Hero" : "Not Hero"}`
      );
    } catch (error) {
      toast.error("Failed to update hero status");
    }
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.isPrimary);
      return primary?.url || product.images[0].url || 'https://via.placeholder.com/200';
    }
    return 'https://via.placeholder.com/200';
  };

  // Enhanced: Calculate discounted price and percentage for limited offers
  const calculateDiscountedPrice = (product) => {
    if (product.limitedOffer?.isActive && product.limitedOffer.specialPrice) {
      return product.limitedOffer.specialPrice;
    }
    if (!product.discount || !product.discountValue) return product.price;
    return (product.price - (product.price * product.discountValue / 100)).toFixed(2);
  };

  const calculateDiscountPercent = (product) => {
    if (product.limitedOffer?.isActive && product.limitedOffer.specialPrice) {
      const discount = ((product.price - product.limitedOffer.specialPrice) / product.price) * 100;
      return Math.round(discount);
    }
    if (!product.discount || !product.discountValue) return 0;
    return Math.round(product.discountValue);
  };

  const getOfferStatus = (product) => {
    if (!product.limitedOffer?.isActive) return null;
    
    const remainingUnits = product.limitedOffer.maxUnits - (product.limitedOffer.unitsSold || 0);
    const isExpired = product.limitedOffer.endDate && new Date() > new Date(product.limitedOffer.endDate);
    
    if (isExpired || remainingUnits <= 0) {
      return { status: 'expired', text: 'Offer Ended', color: 'bg-gray-500' };
    }
    
    if (remainingUnits <= 10) {
      return { status: 'low', text: `${remainingUnits} left`, color: 'bg-red-500' };
    }
    
    return { status: 'active', text: `${remainingUnits} left`, color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog and stock levels</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>/
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="createdAt">Date Added</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </div>
        </div>
      </Card>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or add a new product.</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Product
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {products.map((product, index) => {
              const stockStatus = getStockStatus(product.stock || 0);
              const discountedPrice = calculateDiscountedPrice(product);
              const discountPercent = calculateDiscountPercent(product);
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                      <img
                        src={getProductImage(product)}
                        alt={product.name || 'Product Image'}
                        className="w-full h-48 object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200'; }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{product.category} • {product.sku}</p>
                      <p className="text-xs text-gray-600 mb-2">Brand: {product.brand || '-'}</p>
                      {/* Enhanced: Limited Offer display */}
                      {product.limitedOffer?.isActive ? (
                        <div className="mb-2">
                          <div className="text-lg font-bold">
                            <span className="line-through text-gray-400">₹{product.price}</span>
                            <span className="ml-2 font-semibold text-green-600">₹{discountedPrice}</span>
                            <span className="ml-1 text-red-600 text-xs">{discountPercent}% OFF</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-blue-600">{product.limitedOffer.offerTitle}</span>
                            {getOfferStatus(product) && (
                              <span className={`px-2 py-1 text-xs text-white rounded-full ${getOfferStatus(product).color}`}>
                                {getOfferStatus(product).text}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : discountPercent > 0 ? (
                        <div className="text-lg font-bold mb-2">
                          <span className="line-through text-gray-400">₹{product.price}</span>
                          <span className="ml-2 font-semibold text-green-600">₹{discountedPrice}</span>
                          <span className="ml-1 text-red-600 text-xs">{discountPercent}% OFF</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900 mb-2">₹{product.price}</span>
                      )}
                      <p className="text-sm text-gray-600 mb-3">Stock: {product.stock || 0} units</p>
                      <div className="flex space-x-2 mb-2">
                        {product.isTrending && (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">
                            Trending
                          </span>
                        )}
                        {product.isHero && (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-700">
                            Hero Section
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2 mb-2">
                        <Button
                          size="sm"
                          variant={product.isTrending ? "default" : "outline"}
                          onClick={() => handleToggleTrending(product)}
                        >
                          {product.isTrending ? "Remove Trending" : "Mark Trending"}
                        </Button>
                        <Button
                          size="sm"
                          variant={product.isHero ? "default" : "outline"}
                          onClick={() => handleToggleHero(product)}
                        >
                          {product.isHero ? "Remove Hero" : "Mark Hero"}
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProduct(product)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hero</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock || 0);
                  const discountedPrice = calculateDiscountedPrice(product);
                  const discountPercent = calculateDiscountPercent(product);
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={getProductImage(product)}
                            alt={product.name || 'Product Image'}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.brand || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {/* NEW: Discount display for table */}
                        {discountPercent > 0 ? (
                          <div>
                            <span className="line-through text-gray-400">₹{product.price}</span>
                            <span className="ml-2 font-semibold text-green-600">₹{discountedPrice}</span>
                            <span className="ml-1 text-red-600 text-xs">{discountPercent}% OFF</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-gray-900">₹{product.price}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          size="sm"
                          variant={product.isTrending ? "default" : "outline"}
                          onClick={() => handleToggleTrending(product)}
                        >
                          {product.isTrending ? "Remove Trending" : "Mark Trending"}
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          size="sm"
                          variant={product.isHero ? "default" : "outline"}
                          onClick={() => handleToggleHero(product)}
                        >
                          {product.isHero ? "Remove Hero" : "Mark Hero"}
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewProduct(product)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />
      <AddProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onProductAdded={handleProductUpdated}
        editProduct={selectedProduct}
      />
      <ProductViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
};

export default Inventory;

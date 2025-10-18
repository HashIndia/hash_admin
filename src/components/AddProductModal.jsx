import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { adminProductsAPI, uploadAPI } from '../services/api';
import FileUpload from './FileUpload';
import toast from 'react-hot-toast';
import useProductStore from '../../../frontend/src/stores/useProductStore';

const AddProductModal = ({ isOpen, onClose, onProductAdded, editProduct = null }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // const availableSizes = ['s', 'm', 'l', 'xl', 'xxl', 'xxxl'];
  // const availableColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Gray', 'Yellow', 'Purple', 'Pink', 'Orange'];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: '',
    stock: '',
    sku: '',
    brand: '',
    isTrending: false,
    isHero: false,
    variants: [],
    sizeChart: {
      hasChart: false,
      chartType: 'clothing',
      measurements: [],
      guidelines: []
    },
    images: [],
    limitedOffer: {
      isActive: false,
      specialPrice: '',
      maxUnits: '',
      offerTitle: 'Limited Time Offer',
      offerDescription: 'Special price for first customers',
      endDate: '',
      discountPercentage: ''
    }
  });

  const categories = [
    'clothing',
    'accessories',
    'shoes',
    'bags',
    'electronics',
    'home',
    'beauty',
    'sports',
  ];
  const availableSizes = ['s', 'm', 'l', 'xl', 'xxl', 'xxxl'];
  const availableColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Gray', 'Yellow', 'Purple', 'Pink', 'Orange'];

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || '',
        description: editProduct.description || '',
        price: editProduct.price?.toString() || '',
        discount: editProduct.discount?.toString() || '',
        category: editProduct.category || '',
        stock: editProduct.stock?.toString() || '',
        sku: editProduct.sku || '',
        brand: editProduct.brand || '',
        isTrending: editProduct.isTrending || false,
        isHero: editProduct.isHero || false,
        variants: editProduct.variants || [],
        sizeChart: editProduct.sizeChart || {
          hasChart: false,
          chartType: 'clothing',
          measurements: [],
          guidelines: []
        },
        images: editProduct.images?.length > 0 ? [editProduct.images[0].url] : [],
        limitedOffer: editProduct.limitedOffer || {
          isActive: false,
          specialPrice: '',
          maxUnits: '',
          offerTitle: 'Limited Time Offer',
          offerDescription: 'Special price for first customers',
          endDate: '',
          discountPercentage: ''
        }
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        discount: '',
        category: '',
        stock: '',
        sku: '',
        brand: '',
        isTrending: false,
        isHero: false,
        variants: [],
        sizeChart: {
          hasChart: false,
          chartType: 'clothing',
          measurements: [],
          guidelines: []
        },
        images: [],
        limitedOffer: {
          isActive: false,
          specialPrice: '',
          maxUnits: '',
          offerTitle: 'Limited Time Offer',
          offerDescription: 'Special price for first customers',
          endDate: '',
          discountPercentage: ''
        }
      });
    }
  }, [editProduct, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTrendingChange = (e) => {
    setFormData((prev) => ({ ...prev, isTrending: e.target.checked }));
  };

  const handleHeroChange = (e) => {
    setFormData((prev) => ({ ...prev, isHero: e.target.checked }));
  };

  const handleLimitedOfferChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      limitedOffer: {
        ...prev.limitedOffer,
        [field]: value
      }
    }));
  };

  const calculateDiscountPercentage = () => {
    if (formData.price && formData.limitedOffer.specialPrice) {
      const originalPrice = parseFloat(formData.price);
      const offerPrice = parseFloat(formData.limitedOffer.specialPrice);
      const discount = ((originalPrice - offerPrice) / originalPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const handleVariantAdd = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size: '',
          color: { name: '', hex: '#000000' },
          stock: 0,
          price: '',
          sku: '',
          brand: ''
        }
      ]
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) => {
        if (i === index) {
          if (field === 'color.name' || field === 'color.hex') {
            const colorField = field.split('.')[1];
            return {
              ...variant,
              color: { ...variant.color, [colorField]: value }
            };
          }
          return { ...variant, [field]: value };
        }
        return variant;
      })
    }));
  };

  const handleVariantRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalStock = () => {
    if (formData.variants.length > 0) {
      return formData.variants.reduce((total, variant) => {
        const variantStock = parseInt(variant.stock) || 0;
        return total + variantStock;
      }, 0);
    }
    return parseInt(formData.stock) || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalStock = calculateTotalStock();

    // Validate required fields
    if (!formData.name || !formData.price || !formData.category) {
      const missingFields = [];
      if (!formData.name) missingFields.push('Product Name');
      if (!formData.price) missingFields.push('Price');
      if (!formData.category) missingFields.push('Category');
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    if (totalStock === 0) {
      toast.error('Please add stock either through variants or base stock field');
      return;
    }

    try {
      setLoading(true);

      let uploadedFiles = [];

      if (selectedFiles.length > 0) {
        setIsUploading(true);
        try {
          const uploadResponse = await uploadAPI.uploadProductFiles(selectedFiles);
          if (uploadResponse && uploadResponse.data && uploadResponse.data.files) {
            uploadedFiles = uploadResponse.data.files;
            toast.success(`${uploadedFiles.length} files uploaded successfully`);
          } else {
            toast.warning('No files were uploaded or response format was unexpected');
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          toast.error(`Failed to upload files: ${uploadError.message || 'Unknown error'}`);
          setIsUploading(false);
          setLoading(false);
          return;
        }
        setIsUploading(false);
      }

      // Ensure all numeric values are properly parsed and validated
      const productData = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : '',
        price: isNaN(parseFloat(formData.price)) ? 0 : parseFloat(formData.price),
        discount: isNaN(parseFloat(formData.discount)) ? 0 : parseFloat(formData.discount),
        category: formData.category.trim(),
        stock: totalStock,
        sku: formData.sku ? formData.sku.trim() : undefined,
        brand: formData.brand ? formData.brand.trim() : '',
        isTrending: Boolean(formData.isTrending),
        isHero: Boolean(formData.isHero),
        limitedOffer: {
          isActive: Boolean(formData.limitedOffer.isActive),
          specialPrice: isNaN(parseFloat(formData.limitedOffer.specialPrice)) ? 0 : parseFloat(formData.limitedOffer.specialPrice),
          maxUnits: isNaN(parseInt(formData.limitedOffer.maxUnits)) ? 0 : parseInt(formData.limitedOffer.maxUnits),
          offerTitle: formData.limitedOffer.offerTitle ? formData.limitedOffer.offerTitle.trim() : 'Limited Time Offer',
          offerDescription: formData.limitedOffer.offerDescription ? formData.limitedOffer.offerDescription.trim() : '',
          endDate: formData.limitedOffer.endDate ? new Date(formData.limitedOffer.endDate) : null,
          discountPercentage: calculateDiscountPercentage()
        },
        variants: formData.variants.map(variant => ({
          size: variant.size ? variant.size.toUpperCase() : '',
          color: variant.color || { name: '', hex: '#000000' },
          stock: isNaN(parseInt(variant.stock)) ? 0 : parseInt(variant.stock),
          price: isNaN(parseFloat(variant.price)) ? 0 : parseFloat(variant.price),
          sku: variant.sku ? variant.sku.trim() : undefined,
          images: variant.images || [],
        })),
        images: uploadedFiles.length > 0 ? uploadedFiles : (formData.images || []),
      };

      console.log('Product Data being sent:', productData);

      let response;
      if (editProduct) {
        response = await adminProductsAPI.updateProduct(editProduct._id, productData);
        if (response && response.data) {
          toast.success('Product updated successfully');
        } else {
          throw new Error('Invalid response format from update API');
        }
      } else {
        response = await adminProductsAPI.createProduct(productData);
        if (response && response.data) {
          toast.success('Product added successfully');
        } else {
          throw new Error('Invalid response format from create API');
        }
      }

      if (onProductAdded && response && response.data) {
        onProductAdded(response.data?.product || response.data);
      }

      // Refresh products in the frontend store
      try {
        useProductStore.getState().loadProducts();
      } catch (storeError) {
        console.warn('Failed to refresh product store:', storeError);
        // Continue with normal flow even if store refresh fails
      }

      handleClose();
    } catch (error) {
      console.error('Product operation error:', error);
      const errorMessage = error.message || (editProduct ? 'Failed to update product' : 'Failed to add product');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '',
      category: '',
      stock: '',
      sku: '',
      brand: '',
      isTrending: false,
      isHero: false,
      variants: [],
      sizeChart: {
        hasChart: false,
        chartType: 'clothing',
        measurements: [],
        guidelines: []
      },
      images: []
    });
    setSelectedFiles([]);
    setUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Product Name"
                />
                <Input
                  label="SKU"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="SKU (auto-generated if empty)"
                />
                <Select
                    value={formData.brand}
                    onValueChange={(value) => handleInputChange('brand', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Polo', 'Regular fit', 'Oversized tees', 'Vest', 'Hoodie', 'Varsity', 'Croptop'].map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                  placeholder="Price"
                  min={0}
                />
                <Input
                  label="Discount (%)"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  placeholder="Discount percentage"
                  min={0}
                  max={100}
                />
                <Input
                  label="Stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="Stock (auto-calculated from variants)"
                  min={0}
                />
              </div>
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                placeholder="Product description"
              />
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={handleTrendingChange}
                  />
                  <span>Trending</span>
                </label>
              </div>
                {/* <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isHero}
                    onChange={handleHeroChange}
                  />
                  <span>Hero Section</span>
                </label> */}
              {/* </div> */}

              {/* Limited Offer Section */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-4 text-gray-800">Limited Time Offer</h4>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.limitedOffer.isActive}
                    onChange={(e) => handleLimitedOfferChange('isActive', e.target.checked)}
                  />
                  <span className="font-medium">Enable Limited Offer</span>
                </div>
                
                {formData.limitedOffer.isActive && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Offer Title"
                      value={formData.limitedOffer.offerTitle}
                      onChange={(e) => handleLimitedOfferChange('offerTitle', e.target.value)}
                      placeholder="e.g., Flash Sale - First 100 Customers"
                    />
                    <Input
                      label="Special Price"
                      type="number"
                      value={formData.limitedOffer.specialPrice}
                      onChange={(e) => handleLimitedOfferChange('specialPrice', e.target.value)}
                      placeholder="Offer price"
                      min={0}
                    />
                    <Input
                      label="Max Units for Offer"
                      type="number"
                      value={formData.limitedOffer.maxUnits}
                      onChange={(e) => handleLimitedOfferChange('maxUnits', e.target.value)}
                      placeholder="e.g., 100"
                      min={1}
                    />
                    <Input
                      label="Offer End Date"
                      type="datetime-local"
                      value={formData.limitedOffer.endDate}
                      onChange={(e) => handleLimitedOfferChange('endDate', e.target.value)}
                    />
                    <div className="col-span-2">
                      <Input
                        label="Offer Description"
                        value={formData.limitedOffer.offerDescription}
                        onChange={(e) => handleLimitedOfferChange('offerDescription', e.target.value)}
                        placeholder="Describe the offer for customers"
                      />
                    </div>
                    {formData.price && formData.limitedOffer.specialPrice && (
                      <div className="col-span-2 p-3 bg-green-100 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Discount:</strong> {calculateDiscountPercentage()}% OFF 
                          (₹{formData.price} → ₹{formData.limitedOffer.specialPrice})
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Variants and Images logic remains same */}
              <div>
                <h4 className="font-semibold mb-2">Variants</h4>
                {formData.variants.map((variant, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2 mb-2">
                    <Select
                      value={variant.size}
                      onValueChange={(value) => handleVariantChange(idx, 'size', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={variant.color.name}
                      onChange={(e) => handleVariantChange(idx, 'color.name', e.target.value)}
                      placeholder="Color Name"
                    />
                    <Input
                      type="color"
                      value={variant.color.hex}
                      onChange={(e) => handleVariantChange(idx, 'color.hex', e.target.value)}
                    />
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                      placeholder="Stock"
                      min={0}
                    />
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                      placeholder="Price"
                      min={0}
                    />
                    <Input
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                      placeholder="SKU"
                    />
                    <Input
                      value={variant.brand}
                      onChange={(e) => handleVariantChange(idx, 'brand', e.target.value)}
                      placeholder="Brand"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleVariantRemove(idx)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={handleVariantAdd} className="mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Add Variant
                </Button>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Images</h4>
                <FileUpload
                  files={selectedFiles}
                  setFiles={setSelectedFiles}
                  uploading={uploading}
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (editProduct ? 'Updating...' : 'Adding...') : editProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddProductModal;

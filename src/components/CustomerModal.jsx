import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  ShoppingBag,
  DollarSign,
  Edit2,
  Save,
  XCircle
} from 'lucide-react';
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
import { format } from 'date-fns';
import useCustomerStore from '../stores/useCustomerStore';

const CustomerModal = ({ customer, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(customer);
  const { updateCustomerStatus, isLoading, selectedCustomer } = useCustomerStore();

  // Use selectedCustomer from store if available, otherwise use prop
  const currentCustomer = selectedCustomer || customer;

  useEffect(() => {
    setEditedCustomer(currentCustomer);
  }, [currentCustomer]);

  const handleSave = async () => {
    try {
      if (editedCustomer.status !== currentCustomer.status) {
        await updateCustomerStatus(currentCustomer.id || currentCustomer._id, editedCustomer.status);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const handleCancel = () => {
    setEditedCustomer(currentCustomer);
    setIsEditing(false);
  };

  if (!currentCustomer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {currentCustomer.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentCustomer.name}</h2>
                <p className="text-sm text-gray-500">{currentCustomer.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">{currentCustomer.totalOrders || 0}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">${(currentCustomer.totalSpent || 0).toFixed(0)}</p>
                <p className="text-xs text-gray-500">Total Spent</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {currentCustomer.lastOrder 
                    ? format(new Date(currentCustomer.lastOrder), 'MMM dd')
                    : 'No orders'
                  }
                </p>
                <p className="text-xs text-gray-500">Last Order</p>
              </Card>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{currentCustomer.email}</span>
                </div>
                
                {currentCustomer.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{currentCustomer.phone}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Joined {format(new Date(currentCustomer.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
                
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <Select 
                      value={editedCustomer.status} 
                      onValueChange={(value) => setEditedCustomer({...editedCustomer, status: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentCustomer.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : currentCustomer.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {currentCustomer.status?.charAt(0)?.toUpperCase() + currentCustomer.status?.slice(1)}
                    </span>
                  </div>
                )}

                {currentCustomer.tags && currentCustomer.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {currentCustomer.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Addresses */}
            {currentCustomer.addresses && currentCustomer.addresses.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Addresses</h3>
                <div className="space-y-3">
                  {currentCustomer.addresses.map((address, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {address.name || currentCustomer.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.line1}
                            {address.line2 && `, ${address.line2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.pincode}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-gray-500">Phone: {address.phone}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Communication Preferences</h3>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    customer.preferences?.emailNotifications ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Mail className={`w-6 h-6 ${
                      customer.preferences?.emailNotifications ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">
                    {customer.preferences?.emailNotifications ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Email is the primary communication method for customer notifications and marketing.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomerModal;

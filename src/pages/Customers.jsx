import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Mail,
  MessageSquare,
  Phone,
  Users,
  CheckSquare,
  Square,
  Send,
  Tag,
  UserPlus
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
import useCustomerStore from '../stores/useCustomerStore';
import CustomerModal from '../components/CustomerModal';
import BroadcastModal from '../components/BroadcastModal';
import { format } from 'date-fns';

const Customers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerToView, setCustomerToView] = useState(null);
  
  const {
    searchTerm,
    statusFilter,
    selectedCustomers,
    isLoading,
    error,
    setSearchTerm,
    setStatusFilter,
    selectCustomer,
    selectAllCustomers,
    deselectAllCustomers,
    initialize,
    loadCustomer
  } = useCustomerStore();

  // Initialize customers on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Get raw customers from store
  const allCustomers = useCustomerStore(state => state.customers || []);

  // Memoize filtered customers to prevent infinite loops
  const customers = useMemo(() => {
    let filtered = [...allCustomers];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }
    
    // Sort by name
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    return filtered;
  }, [allCustomers, searchTerm, statusFilter]);

  // Memoize selected customers list
  const selectedCustomersList = useMemo(() => {
    return allCustomers.filter(customer => selectedCustomers.includes(customer.id));
  }, [allCustomers, selectedCustomers]);

  // Memoize customer stats
  const stats = useMemo(() => {
    const total = allCustomers.length;
    const vip = allCustomers.filter(c => c.tags?.includes('VIP')).length;
    const active = allCustomers.filter(c => c.status === 'active').length;
    const totalRevenue = allCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    
    return { total, vip, active, totalRevenue };
  }, [allCustomers]);

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      deselectAllCustomers();
    } else {
      selectAllCustomers();
    }
  };

  const handleViewCustomer = async (customer) => {
    try {
      setCustomerToView(customer);
      setShowCustomerModal(true);
      // Load full customer details
      await loadCustomer(customer.id || customer._id);
    } catch (error) {
      console.error('Failed to load customer details:', error);
    }
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
    setCustomerToView(null);
  };

  const getCustomerTypeColor = (tags) => {
    if (tags.includes('VIP')) return 'bg-purple-100 text-purple-800';
    if (tags.includes('Loyal Customer')) return 'bg-blue-100 text-blue-800';
    if (tags.includes('New Customer')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage customer relationships and communications</p>
        </div>
        <div className="flex space-x-2">
          {selectedCustomers.length > 0 && (
            <Button
              onClick={() => setShowBroadcastModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Broadcast ({selectedCustomers.length})
            </Button>
          )}
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="bg-gray-300 w-12 h-12 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">VIP Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.vip}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(0)}</p>
            </div>
          </div>
        </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleSelectAll}>
            {selectedCustomers.length === customers.length && customers.length > 0 ? (
              <>
                <CheckSquare className="w-4 h-4 mr-2" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="w-4 h-4 mr-2" />
                Select All
              </>
            )}
          </Button>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        <AnimatePresence>
          {customers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <button
                        onClick={() => selectCustomer(customer.id)}
                        className="mr-3 p-1 rounded hover:bg-gray-100"
                      >
                        {selectedCustomers.includes(customer.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    <div className="w-12 h-12 bg-hash-purple rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {customer.name.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                        {customer.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getCustomerTypeColor([tag])}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-6 mb-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{customer.totalOrders}</p>
                        <p className="text-xs text-gray-500">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">₹{customer.totalSpent.toFixed(0)}</p>
                        <p className="text-xs text-gray-500">Spent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          {customer.lastOrder 
                            ? format(new Date(customer.lastOrder), 'MMM dd')
                            : 'No orders'
                          }
                        </p>
                        <p className="text-xs text-gray-500">Last Order</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!customer.preferences?.emailNotifications}
                        title={customer.preferences?.emailNotifications ? "Send Email" : "Email notifications disabled"}
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Customer Preferences */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Communication:</span>
                    <div className="flex items-center space-x-2">
                      <Mail className={`w-4 h-4 ${customer.preferences?.emailNotifications ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Email {customer.preferences?.emailNotifications ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Selected customers summary */}
      {selectedCustomers.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <CheckSquare className="w-5 h-5" />
            <span>{selectedCustomers.length} customers selected</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowBroadcastModal(true)}
            >
              <Send className="w-3 h-3 mr-1" />
              Broadcast
            </Button>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showCustomerModal && customerToView && (
        <CustomerModal 
          customer={customerToView}
          onClose={handleCloseCustomerModal}
        />
      )}

      {/* Broadcast Modal */}
      <BroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        selectedCustomers={selectedCustomersList}
        type={selectedCustomers.length > 0 ? 'selected' : 'all'}
      />
    </div>
  );
};

export default Customers;
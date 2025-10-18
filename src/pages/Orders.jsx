import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Truck, 
  CheckCircle, 
  Clock,
  Package,
  AlertCircle,
  Send,
  Square,
  CheckSquare,
  Users
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
import { ordersAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpLoading, setOTPLoading] = useState(false);
  const [otp, setOTP] = useState('');
  const [currentOrderForOTP, setCurrentOrderForOTP] = useState(null);
  
  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Real state from API
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = {
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          dateRange: dateRange !== 'all' ? dateRange : undefined
        };
        
        const response = await ordersAPI.getOrders(params);
        
        setOrders(response?.data?.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [searchTerm, statusFilter, dateRange]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, { status: newStatus });
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      // Update selected order if it's the one being changed
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleGenerateOTP = async (orderId) => {
    try {
      setOTPLoading(true);
      await ordersAPI.generateOTP(orderId);
      setCurrentOrderForOTP(orderId);
      setShowOTPModal(true);
      toast.success('OTP generated and sent to customer');
    } catch (error) {
      console.error('Error generating OTP:', error);
      toast.error('Failed to generate OTP');
    } finally {
      setOTPLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setOTPLoading(true);
      await ordersAPI.verifyOTP(currentOrderForOTP, otp);
      
      // Update the order status to delivered
      setOrders(prev => prev.map(order => 
        order._id === currentOrderForOTP ? { ...order, status: 'delivered' } : order
      ));
      
      // Update selected order if it's the one being delivered
      if (selectedOrder && selectedOrder._id === currentOrderForOTP) {
        setSelectedOrder({ ...selectedOrder, status: 'delivered' });
      }
      
      toast.success('Order delivered successfully!');
      setShowOTPModal(false);
      setOTP('');
      setCurrentOrderForOTP(null);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setOTPLoading(false);
    }
  };

  const closeOTPModal = () => {
    setShowOTPModal(false);
    setOTP('');
    setCurrentOrderForOTP(null);
  };

  // Bulk selection functions
  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order._id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to update');
      return;
    }

    setBulkActionLoading(true);
    try {
      // Update orders in parallel
      const updatePromises = selectedOrders.map(orderId =>
        ordersAPI.updateOrderStatus(orderId, { status: newStatus })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        selectedOrders.includes(order._id) 
          ? { ...order, status: newStatus }
          : order
      ));
      
      setSelectedOrders([]);
      toast.success(`${selectedOrders.length} orders updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating orders:', error);
      toast.error('Failed to update some orders');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-medium">
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate('confirmed')}
                disabled={bulkActionLoading}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark as Confirmed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate('shipped')}
                disabled={bulkActionLoading}
                className="text-green-600 border-green-300 hover:bg-green-100"
              >
                <Truck className="w-4 h-4 mr-1" />
                Mark as Shipped
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrders([])}
                className="text-gray-600"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All Header */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              <button
                onClick={handleSelectAll}
                className="flex items-center justify-center w-5 h-5 border-2 border-gray-300 rounded hover:border-blue-500 transition-colors"
              >
                {selectedOrders.length === orders.length ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : selectedOrders.length > 0 ? (
                  <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <span className="text-sm font-medium text-gray-700">
                {selectedOrders.length === orders.length ? 'Deselect All' : 
                 selectedOrders.length > 0 ? `${selectedOrders.length} selected` : 
                 'Select All'}
              </span>
            </div>
            
            <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white"
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Checkbox for bulk selection */}
                      <button
                        onClick={() => handleSelectOrder(order._id)}
                        className="flex items-center justify-center w-5 h-5 border-2 border-gray-300 rounded hover:border-blue-500 transition-colors"
                      >
                        {selectedOrders.includes(order._id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">
                            Order #{order.orderNumber || order._id.slice(-8)}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Customer: {order.user?.email || order.shippingAddress?.name || 'N/A'}</p>
                          <p>Date: {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                          <p>Amount: ₹{order.totalAmount?.toFixed(2)}</p>
                          <p>Payment: {
                            order.paymentMethod === 'upi' ? 'UPI' :
                            order.paymentMethod === 'netbanking' ? 'Net Banking' :
                            order.paymentMethod === 'wallet' ? 'Wallet' :
                            order.paymentMethod === 'card' ? 'Card' :
                            order.paymentMethod === 'emi' ? 'EMI' :
                            order.paymentMethod || 'Online Payment'
                          }</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(order._id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                      )}
                      
                      {(order.status === 'confirmed' || order.status === 'processing') && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(order._id, 'shipped')}
                        >
                          <Truck className="w-3 h-3 mr-1" />
                          Mark as Shipped
                        </Button>
                      )}
                      
                      {order.status === 'shipped' && (
                        <Button
                          size="sm"
                          onClick={() => handleGenerateOTP(order._id)}
                          disabled={otpLoading}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {otpLoading ? 'Generating OTP...' : 'Generate Delivery OTP'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Information */}
              <div>
                <h3 className="font-semibold mb-2">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order Number:</span>
                    <p className="font-medium">{selectedOrder.orderNumber || selectedOrder._id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)} ml-2`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Order Date:</span>
                    <p className="font-medium">{format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-medium">₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <p className="font-medium capitalize">
                      {selectedOrder.paymentMethod === 'upi' ? 'UPI' :
                       selectedOrder.paymentMethod === 'netbanking' ? 'Net Banking' :
                       selectedOrder.paymentMethod === 'wallet' ? 'Wallet' :
                       selectedOrder.paymentMethod === 'card' ? 'Card' :
                       selectedOrder.paymentMethod === 'emi' ? 'EMI' :
                       selectedOrder.paymentMethod || 'Online Payment'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.paymentStatus || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="text-sm">
                  <p><span className="text-gray-600">Name:</span> {selectedOrder.shippingAddress?.name || 'N/A'}</p>
                  <p><span className="text-gray-600">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                  <p><span className="text-gray-600">Phone:</span> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-600">
                  <p>{selectedOrder.shippingAddress?.line1}</p>
                  {selectedOrder.shippingAddress?.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  {selectedOrder.shippingAddress?.landmark && <p>Near: {selectedOrder.shippingAddress.landmark}</p>}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <img
                        src={item.image || item.product?.images?.[0] || 'https://placehold.co/50x50/64748b/fff?text=Item'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                        {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.price?.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">₹{(item.price * item.quantity)?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>₹{selectedOrder.shippingCost?.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Gateway Charges:</span>
                      <span>₹{selectedOrder.taxAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base border-t pt-2">
                    <span>Total:</span>
                    <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Update Status</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedOrder.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedOrder._id, 'confirmed')}
                    >
                      Confirm Order
                    </Button>
                  )}
                  {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'processing') && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedOrder._id, 'shipped')}
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <Button
                      size="sm"
                      onClick={() => handleGenerateOTP(selectedOrder._id)}
                      disabled={otpLoading}
                    >
                      {otpLoading ? 'Generating OTP...' : 'Generate Delivery OTP'}
                    </Button>
                  )}
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Verify Delivery OTP</h2>
                <button
                  onClick={closeOTPModal}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Delivery Verification</h3>
                <p className="text-gray-600 text-sm">
                  OTP has been sent to the customer's email. Please collect the OTP from the customer and enter it below to confirm delivery.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit OTP
                </label>
                <Input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-wider"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={closeOTPModal}
                  disabled={otpLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleVerifyOTP}
                  disabled={otpLoading || otp.length !== 6}
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Deliver'}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleGenerateOTP(currentOrderForOTP)}
                  disabled={otpLoading}
                  className="text-blue-600"
                >
                  Resend OTP
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

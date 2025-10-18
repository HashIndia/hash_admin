import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Download,
  Pencil,
  Trash2,
  Save,
  X,
  RefreshCw,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useOrderStore from "../stores/useOrderStore";
import useAnalyticsStore from "../stores/useAnalyticsStore";

const VENDOR_ENTRIES_KEY = "hash_vendor_entries";

const trafficSourceData = [
  { source: "Organic Search", visitors: 2400, conversions: 180 },
  { source: "Social Media", visitors: 1800, conversions: 95 },
  { source: "Direct", visitors: 1200, conversions: 145 },
  { source: "Email", visitors: 800, conversions: 120 },
  { source: "Paid Ads", visitors: 600, conversions: 85 },
];

const ManualVendorEntryTable = ({
  vendorEntries,
  setVendorEntries,
  soldVariants,
}) => {
  const [newEntry, setNewEntry] = useState({
    brand: "",
    size: "",
    price: "",
    quantityBought: "",
  });

  const [editIndex, setEditIndex] = useState(null);
  const [editEntry, setEditEntry] = useState({
    brand: "",
    size: "",
    price: "",
    quantityBought: "",
  });

  const sizes = [
    "XS", "S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40", "42", "ONE_SIZE"
  ];

  const handleInputChange = (field, value) => {
    setNewEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field, value) => {
    setEditEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddEntry = () => {
    if (
      !newEntry.brand ||
      !newEntry.size ||
      !newEntry.price ||
      !newEntry.quantityBought
    ) {
      return;
    }
    const entry = {
      ...newEntry,
      price: parseFloat(newEntry.price),
      quantityBought: parseInt(newEntry.quantityBought),
    };
    const updatedEntries = [...vendorEntries, entry];
    setVendorEntries(updatedEntries);
    localStorage.setItem(VENDOR_ENTRIES_KEY, JSON.stringify(updatedEntries));
    setNewEntry({
      brand: "",
      size: "",
      price: "",
      quantityBought: "",
    });
  };

  const handleDeleteEntry = (idx) => {
    const updatedEntries = vendorEntries.filter((_, i) => i !== idx);
    setVendorEntries(updatedEntries);
    localStorage.setItem(VENDOR_ENTRIES_KEY, JSON.stringify(updatedEntries));
    setEditIndex(null);
  };

  const handleEditEntry = (idx) => {
    setEditIndex(idx);
    setEditEntry({ ...vendorEntries[idx] });
  };

  const handleSaveEditEntry = (idx) => {
    if (
      !editEntry.brand ||
      !editEntry.size ||
      !editEntry.price ||
      !editEntry.quantityBought
    ) {
      return;
    }
    const updatedEntries = vendorEntries.map((entry, i) =>
      i === idx
        ? {
            ...editEntry,
            price: parseFloat(editEntry.price),
            quantityBought: parseInt(editEntry.quantityBought),
          }
        : entry
    );
    setVendorEntries(updatedEntries);
    localStorage.setItem(VENDOR_ENTRIES_KEY, JSON.stringify(updatedEntries));
    setEditIndex(null);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Vendor Purchase Entry (Manual)
      </h3>
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <input
          type="text"
          placeholder="Brand Name"
          value={newEntry.brand}
          onChange={(e) => handleInputChange("brand", e.target.value)}
          className="border px-3 py-2 rounded w-32"
        />
        <select
          value={newEntry.size}
          onChange={(e) => handleInputChange("size", e.target.value)}
          className="border px-3 py-2 rounded w-24"
        >
          <option value="">Size</option>
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Price per unit"
          value={newEntry.price}
          onChange={(e) => handleInputChange("price", e.target.value)}
          className="border px-3 py-2 rounded w-28"
        />
        <input
          type="number"
          placeholder="Quantity Bought"
          value={newEntry.quantityBought}
          onChange={(e) => handleInputChange("quantityBought", e.target.value)}
          className="border px-3 py-2 rounded w-32"
        />
        <Button type="button" onClick={handleAddEntry}>
          Add Entry
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Brand
              </th>
              <th className="border px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Size
              </th>
              <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Price/Unit
              </th>
              <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Bought from Vendor
              </th>
              <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Sold to Customer
              </th>
              <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Remaining Stock
              </th>
              <th className="border px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {vendorEntries.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="border px-4 py-8 text-center text-gray-500"
                >
                  No vendor entries yet. Please add manually.
                </td>
              </tr>
            ) : (
              vendorEntries.map((entry, idx) => {
                const sold = soldVariants
                  .filter(
                    (v) =>
                      v.brand === entry.brand && v.size === entry.size
                  )
                  .reduce((sum, v) => sum + v.quantity, 0);
                const isEditing = editIndex === idx;
                return (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border px-4 py-3 text-sm font-medium text-gray-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editEntry.brand}
                          onChange={(e) =>
                            handleEditInputChange("brand", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-24"
                        />
                      ) : (
                        entry.brand
                      )}
                    </td>
                    <td className="border px-4 py-3 text-sm text-gray-700">
                      {isEditing ? (
                        <select
                          value={editEntry.size}
                          onChange={(e) =>
                            handleEditInputChange("size", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-20"
                        >
                          <option value="">Size</option>
                          {sizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      ) : (
                        entry.size
                      )}
                    </td>
                    <td className="border px-4 py-3 text-sm text-right text-gray-700">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editEntry.price}
                          onChange={(e) =>
                            handleEditInputChange("price", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-16 text-right"
                        />
                      ) : (
                        `₹${entry.price}`
                      )}
                    </td>
                    <td className="border px-4 py-3 text-sm text-right text-gray-900 font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editEntry.quantityBought}
                          onChange={(e) =>
                            handleEditInputChange("quantityBought", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-16 text-right"
                        />
                      ) : (
                        entry.quantityBought
                      )}
                    </td>
                    <td className="border px-4 py-3 text-sm text-right text-blue-700 font-semibold">
                      {sold}
                    </td>
                    <td className="border px-4 py-3 text-sm text-right text-green-700 font-semibold">
                      {entry.quantityBought - sold}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="flex gap-2 justify-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveEditEntry(idx)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEntry(idx)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteEntry(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Analytics = () => {
  const [dateRange, setDateRange] = useState("7d");
  const [expanded, setExpanded] = useState({});
  const [vendorEntries, setVendorEntries] = useState([]);
  const {
    dashboardStats,
    revenueAnalytics,
    customerAnalytics,
    brandSizeAnalytics,
    isLoading,
    error,
    initialize,
    loadRevenueAnalytics,
    loadCustomerAnalytics,
    loadBrandSizeAnalytics,
  } = useAnalyticsStore();

  useEffect(() => {
    initialize();
    const savedEntries = localStorage.getItem(VENDOR_ENTRIES_KEY);
    if (savedEntries) {
      setVendorEntries(JSON.parse(savedEntries));
    }
  }, [initialize]);

  useEffect(() => {
    if (dateRange) {
      const params = { period: dateRange };
      Promise.all([
        loadRevenueAnalytics(params),
        loadCustomerAnalytics(params),
        loadBrandSizeAnalytics(),
      ]);
    }
  }, [
    dateRange,
    loadRevenueAnalytics,
    loadCustomerAnalytics,
    loadBrandSizeAnalytics,
  ]);

  const orders = useOrderStore((state) => state.orders);

  const soldVariants = useMemo(() => {
    const variants = [];
    orders.forEach((order) => {
      if (order.status !== "cancelled" && order.items) {
        order.items.forEach((item) => {
          variants.push({
            brand: item.brand || "",
            size: item.size || "",
            quantity: item.quantity || 0,
          });
        });
      }
    });
    return variants;
  }, [orders]);

  const orderStats = useMemo(() => {
    let totalRevenue = 0;
    let totalSoldProducts = 0;

    orders.forEach((order) => {
      if (order.status !== "cancelled" && order.items) {
        order.items.forEach((item) => {
          totalSoldProducts += item.quantity || 0;
          totalRevenue += (item.quantity || 0) * (item.price || 0);
        });
      }
    });

 
    const avgOrderValue = totalSoldProducts > 0 ? totalRevenue / totalSoldProducts : 0;

    return {
      total: totalSoldProducts,
      totalRevenue: totalRevenue,
      avgOrderValue: avgOrderValue,
    };
  }, [orders]);

  // Prefer dashboard stats from analytics store for header KPIs; fall back to computed orderStats
  const kpis = [
    {
      title: "Total Revenue",
      value: `₹${(
        dashboardStats?.revenue?.total ?? orderStats.totalRevenue ?? 0
      ).toFixed ? (dashboardStats?.revenue?.total ?? orderStats.totalRevenue ?? 0).toFixed(2) : (dashboardStats?.revenue?.total ?? orderStats.totalRevenue ?? 0)}`,
      change: "+12.5%",
      changeType: "increase",
      icon: DollarSign,
      color: "bg-green-500",
      type: "revenue",
    },
    {
      title: "Total Orders",
      value: dashboardStats?.orders?.total ?? orderStats.total ?? 0,
      change: "+8.2%",
      changeType: "increase",
      icon: ShoppingCart,
      color: "bg-blue-500",
      type: "orders",
    },
    {
      title: "Avg Order Value",
      value: `₹${(
        dashboardStats?.revenue && dashboardStats?.orders && dashboardStats.orders.total > 0
          ? (dashboardStats.revenue.total / dashboardStats.orders.total)
          : orderStats.avgOrderValue ?? 0
      ).toFixed(2)}`,
      change: "-2.1%",
      changeType: "decrease",
      icon: DollarSign,
      color: "bg-orange-500",
      type: "avg",
    },
  ];

  const revenueData = useMemo(() => {
    return revenueAnalytics?.dailyData?.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(
        2,
        "0"
      )}-${String(item._id.day).padStart(2, "0")}`,
      revenue: item.revenue,
      orders: item.orders,
    })) || [];
  }, [revenueAnalytics]);

  const customerSegmentData = useMemo(() => {
    return customerAnalytics?.customerSegments?.map((segment) => ({
      name:
        segment._id === "new"
          ? "New Customers"
          : segment._id === "regular"
          ? "Regular Customers"
          : segment._id === "loyal"
          ? "Loyal Customers"
          : segment._id,
      value: segment.count,
      color:
        segment._id === "new"
          ? "#3b82f6"
          : segment._id === "regular"
          ? "#8b5cf6"
          : segment._id === "loyal"
          ? "#10b981"
          : "#6b7280",
    })) || [];
  }, [customerAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Track your business performance and insights
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {kpi.value}
                  </p>
                  <div
                    className={`flex items-center mt-2 text-sm ${
                      kpi.changeType === "increase"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {kpi.changeType === "increase" ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {kpi.change}
                  </div>
                </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`${kpi.color} p-3 rounded-lg`}>
                      <kpi.icon className="w-6 h-6 text-white" />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpanded((s) => ({ ...s, [kpi.title]: !s[kpi.title] }))}
                    >
                      {expanded[kpi.title] ? "Hide" : "Details"}
                    </Button>
                  </div>
              </div>
              {/* Expandable details for each KPI (Revenue / Orders / Customers / Products) */}
              {expanded[kpi.title] && (
                <div className="mt-4 border-t pt-3 text-sm text-gray-700">
                  {kpi.type === "revenue" && (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Today</span>
                        <span>₹{(dashboardStats?.revenue?.today ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Week</span>
                        <span>₹{(dashboardStats?.revenue?.week ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Month</span>
                        <span>₹{(dashboardStats?.revenue?.month ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{(dashboardStats?.revenue?.total ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  {kpi.type === "orders" && (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span>{dashboardStats?.orders?.total ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <span>{dashboardStats?.orders?.pending ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed</span>
                        <span>{dashboardStats?.orders?.completed ?? 0}</span>
                      </div>
                    </div>
                  )}
                  {kpi.type === "avg" && (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Avg Order Value (computed)</span>
                        <span>{kpi.value}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Source</span>
                        <span>Analytics Store</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          key="revenue-chart"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Trend
              </h3>
              <Button variant="outline" size="sm">
                <Eye className="w-3 h-3 mr-1" />
                View Details
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [`₹${value}`, "Revenue"]}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
        <motion.div
          key="customer-segments-chart"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Segments
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  <div className="font-medium">Customers</div>
                  <div className="text-gray-600">Total: {dashboardStats?.customers?.total ?? '-'}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpanded((s) => ({ ...s, Customers: !s.Customers }))}
                  >
                    {expanded.Customers ? 'Hide' : 'Details'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="w-3 h-3 mr-1" />
                    Manage Segments
                  </Button>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {customerSegmentData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Expandable customers details from dashboardStats */}
            {expanded.Customers && (
              <div className="mt-4 border-t pt-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Total Customers</span>
                  <span>{dashboardStats?.customers?.total ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified</span>
                  <span>{dashboardStats?.customers?.verified ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Today</span>
                  <span>{dashboardStats?.customers?.newToday ?? 0}</span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
      {/* Real-time Brand & Size Analytics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Brand & Size Analytics</h3>
            <p className="text-sm text-gray-500 mt-1">
              Real-time data from product inventory and customer orders
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-medium">Products</div>
              <div className="text-gray-600">Total: {dashboardStats?.products?.total ?? '-'}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpanded((s) => ({ ...s, Products: !s.Products }))}
              >
                {expanded.Products ? 'Hide' : 'Details'}
              </Button>
              <Button
                onClick={() => loadBrandSizeAnalytics()}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : brandSizeAnalytics?.analytics ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Brand
                  </th>
                  <th className="border px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Size
                  </th>
                  <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Price/Unit
                  </th>
                  <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Initial Stock
                  </th>
                  <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Sold to Customer
                  </th>
                  <th className="border px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Remaining Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {brandSizeAnalytics.analytics.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="border px-4 py-8 text-center text-gray-500">
                      No analytics data available. Add products to see analytics.
                    </td>
                  </tr>
                ) : (
                  brandSizeAnalytics.analytics.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border px-4 py-3 text-sm font-medium text-gray-900">
                        {item.brand}
                      </td>
                      <td className="border px-4 py-3 text-sm text-gray-900">
                        {item.size}
                      </td>
                      <td className="border px-4 py-3 text-sm text-gray-900 text-right">
                        ₹{item.pricePerUnit}
                      </td>
                      <td className="border px-4 py-3 text-sm text-gray-900 text-right">
                        {item.boughtFromVendor}
                      </td>
                      <td className="border px-4 py-3 text-sm text-gray-900 text-right">
                        <span className="text-green-600 font-medium">
                          {item.soldToCustomer}
                        </span>
                      </td>
                      <td className="border px-4 py-3 text-sm text-gray-900 text-right">
                        <span className={`font-medium ${
                          item.remainingStock <= 5 ? 'text-red-600' : 
                          item.remainingStock <= 10 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {item.remainingStock}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Failed to load analytics data. Please try again.
          </div>
        )}
        {/* Expandable products details from dashboardStats */}
        {expanded.Products && (
          <div className="mt-4 border-t pt-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Total Products</span>
              <span>{dashboardStats?.products?.total ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Low Stock</span>
              <span>{dashboardStats?.products?.lowStock ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Out of Stock</span>
              <span>{dashboardStats?.products?.outOfStock ?? 0}</span>
            </div>
          </div>
        )}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          key="traffic-sources"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Traffic Sources
              </h3>
              <Button variant="outline" size="sm">
                Optimize
              </Button>
            </div>
            <div className="space-y-4">
              {trafficSourceData.map((source, index) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {source.source}
                      </span>
                      <span className="text-sm text-gray-600">
                        {source.visitors} visitors
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (source.conversions / source.visitors) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-900">
                    {((source.conversions / source.visitors) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
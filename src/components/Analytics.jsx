import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Package, DollarSign, Users, AlertTriangle, ShoppingCart } from 'lucide-react';

export default function Analytics() { 
  const { currentUser, userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);
  const [timeRange, setTimeRange] = useState('month'); // month, week, year
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('shopId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const fertilizersQuery = query(
      collection(db, 'fertilizers'),
      where('shopId', '==', currentUser.uid)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setOrders(ordersData);
    });

    const unsubscribeFertilizers = onSnapshot(fertilizersQuery, (snapshot) => {
      const fertilizersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFertilizers(fertilizersData);
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeFertilizers();
    };
  }, [currentUser]);

  // Calculate key metrics
  const calculateMetrics = () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'confirmed');
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const lowStockItems = fertilizers.filter(f => f.quantity > 0 && f.quantity < 10).length;
    const outOfStockItems = fertilizers.filter(f => f.quantity === 0).length;

    return {
      totalRevenue,
      totalOrders,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      averageOrderValue,
      lowStockItems,
      outOfStockItems,
      totalProducts: fertilizers.length
    };
  };

  // Sales data for charts
  const getSalesData = () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    
    if (timeRange === 'week') {
      // Last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const daySales = completedOrders
          .filter(order => {
            const orderDate = order.createdAt;
            return orderDate && orderDate.toDateString() === date.toDateString();
          })
          .reduce((sum, order) => sum + (order.total || 0), 0);
        
        days.push({
          name: dayKey,
          sales: daySales,
          orders: completedOrders.filter(order => {
            const orderDate = order.createdAt;
            return orderDate && orderDate.toDateString() === date.toDateString();
          }).length
        });
      }
      return days;
    } else if (timeRange === 'year') {
      // Last 12 months
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthSales = completedOrders
          .filter(order => {
            const orderDate = order.createdAt;
            return orderDate && 
                   orderDate.getMonth() === date.getMonth() && 
                   orderDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, order) => sum + (order.total || 0), 0);
        
        months.push({
          name: monthKey,
          sales: monthSales,
          orders: completedOrders.filter(order => {
            const orderDate = order.createdAt;
            return orderDate && 
                   orderDate.getMonth() === date.getMonth() && 
                   orderDate.getFullYear() === date.getFullYear();
          }).length
        });
      }
      return months;
    } else {
      // Last 30 days (default)
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayKey = date.getDate().toString();
        
        const daySales = completedOrders
          .filter(order => {
            const orderDate = order.createdAt;
            return orderDate && orderDate.toDateString() === date.toDateString();
          })
          .reduce((sum, order) => sum + (order.total || 0), 0);
        
        days.push({
          name: dayKey,
          sales: daySales,
          orders: completedOrders.filter(order => {
            const orderDate = order.createdAt;
            return orderDate && orderDate.toDateString() === date.toDateString();
          }).length
        });
      }
      return days;
    }
  };

  // Product performance data
  const getProductPerformance = () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    const productSales = {};

    completedOrders.forEach(order => {
      order.items?.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = {
            name: item.name,
            sales: 0,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
        productSales[item.name].sales += 1;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Order status distribution
  const getOrderStatusData = () => {
    const statusCount = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      count: count
    }));
  };

  const metrics = calculateMetrics();
  const salesData = getSalesData();
  const productPerformance = getProductPerformance();
  const orderStatusData = getOrderStatusData();

  const statusColors = {
    pending: '#fbbf24',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    completed: '#10b981',
    cancelled: '#ef4444'
  };

  const productColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your business performance and insights
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last 12 Months</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${metrics.totalRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            From {metrics.completedOrders} completed orders
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {metrics.pendingOrders} pending orders
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Order</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${metrics.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Per completed order
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {metrics.lowStockItems} low, {metrics.outOfStockItems} out of stock
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Sales Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              <Bar 
                dataKey="sales" 
                name="Revenue ($)" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="orders" 
                name="Orders" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Order Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={statusColors[entry.name.toLowerCase()] || '#6B7280'} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value, name) => [value, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Top Performing Products
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={productPerformance}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#6B7280"
                fontSize={12}
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value, name) => {
                  if (name === 'revenue') return [`$${value}`, 'Revenue'];
                  if (name === 'quantity') return [value, 'Quantity Sold'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                name="Revenue ($)" 
                fill="#8B5CF6" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Inventory Health
          </h3>
          <div className="space-y-4">
            {/* Stock Status Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {metrics.totalProducts - metrics.lowStockItems - metrics.outOfStockItems}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">In Stock</div>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {metrics.lowStockItems}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Low Stock</div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {metrics.outOfStockItems}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Out of Stock</div>
              </div>
            </div>

            {/* Low Stock Items */}
            {(metrics.lowStockItems > 0 || metrics.outOfStockItems > 0) && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  Stock Alerts
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {fertilizers
                    .filter(f => f.quantity < 10)
                    .sort((a, b) => a.quantity - b.quantity)
                    .map(fertilizer => (
                      <div
                        key={fertilizer.id}
                        className={`p-3 rounded-lg border ${
                          fertilizer.quantity === 0
                            ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
                            : 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{fertilizer.name}</span>
                          <span className={`text-sm font-semibold ${
                            fertilizer.quantity === 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {fertilizer.quantity === 0 ? 'Out of Stock' : `${fertilizer.quantity} left`}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {metrics.lowStockItems === 0 && metrics.outOfStockItems === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>All products are well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {orders.slice(0, 5).map(order => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    order.status === 'completed'
                      ? 'bg-green-500'
                      : order.status === 'pending'
                      ? 'bg-yellow-500'
                      : order.status === 'cancelled'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                />
                <div>
                  <p className="font-medium text-sm">
                    Order from {order.farmerName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {order.createdAt?.toLocaleDateString()} • {order.items?.length} items
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">${order.total?.toFixed(2)}</p>
                <p
                  className={`text-xs capitalize ${
                    order.status === 'completed'
                      ? 'text-green-600 dark:text-green-400'
                      : order.status === 'pending'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : order.status === 'cancelled'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {order.status}
                </p>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
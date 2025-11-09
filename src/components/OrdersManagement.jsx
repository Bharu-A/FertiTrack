import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('shopId', '==', currentUser.uid)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(data);
    });

    // Fetch fertilizers
    const fertilizersQuery = query(
      collection(db, 'fertilizers'),
      where('shopId', '==', currentUser.uid)
    );

    const unsubscribeFertilizers = onSnapshot(fertilizersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFertilizers(data);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeFertilizers();
    };
  }, [currentUser]);

  // Calculate analytics data
  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  
  const lowStockItems = fertilizers.filter(f => f.quantity < 10).length;
  const outOfStockItems = fertilizers.filter(f => f.quantity === 0).length;

  // Sales by month data
  const salesByMonth = orders.reduce((acc, order) => {
    if (order.status === 'completed' && order.createdAt) {
      const month = order.createdAt.toDate().toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + (order.total || 0);
    }
    return acc;
  }, {});

  const chartData = Object.entries(salesByMonth).map(([month, sales]) => ({
    month,
    sales: parseFloat(sales.toFixed(2))
  }));

  // Top selling products
  const productSales = orders.reduce((acc, order) => {
    if (order.status === 'completed' && order.items) {
      order.items.forEach(item => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
    }
    return acc;
  }, {});

  const pieData = Object.entries(productSales).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Sales Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your business performance and sales metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Total Sales</h3>
          <p className="text-3xl font-bold text-green-600">${totalSales.toFixed(2)}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Completed Orders</h3>
          <p className="text-3xl font-bold text-blue-600">{completedOrders}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Low Stock Items</h3>
          <p className="text-3xl font-bold text-red-600">{lowStockItems + outOfStockItems}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#22c55e" name="Sales ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock Alerts */}
      {(lowStockItems > 0 || outOfStockItems > 0) && (
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Stock Alerts
          </h3>
          <div className="space-y-2">
            {outOfStockItems > 0 && (
              <p className="text-red-600 dark:text-red-400">
                ⚠️ {outOfStockItems} product(s) are out of stock
              </p>
            )}
            {lowStockItems > 0 && (
              <p className="text-yellow-600 dark:text-yellow-400">
                ⚠️ {lowStockItems} product(s) are running low on stock
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
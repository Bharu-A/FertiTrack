import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, DollarSign, ShoppingCart } from 'lucide-react';

export default function FarmerInsights() {
  // Mock data for insights
  const monthlyData = [
    { month: 'Jan', spending: 450, orders: 3 },
    { month: 'Feb', spending: 620, orders: 4 },
    { month: 'Mar', spending: 780, orders: 5 },
    { month: 'Apr', spending: 540, orders: 3 },
    { month: 'May', spending: 890, orders: 6 },
    { month: 'Jun', spending: 720, orders: 4 },
  ];

  const cropSpending = [
    { crop: 'Wheat', spending: 1560 },
    { crop: 'Rice', spending: 890 },
    { crop: 'Corn', spending: 670 },
    { crop: 'Vegetables', spending: 450 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Spent</p>
              <p className="text-white text-2xl font-bold">$3,890</p>
            </div>
            <DollarSign className="text-emerald-300" size={24} />
          </div>
          <p className="text-emerald-300 text-xs mt-2">+12% from last month</p>
        </div>

        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Orders</p>
              <p className="text-white text-2xl font-bold">25</p>
            </div>
            <ShoppingCart className="text-blue-300" size={24} />
          </div>
          <p className="text-emerald-300 text-xs mt-2">+3 this month</p>
        </div>

        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Products Used</p>
              <p className="text-white text-2xl font-bold">18</p>
            </div>
            <Package className="text-purple-300" size={24} />
          </div>
          <p className="text-emerald-300 text-xs mt-2">5 different types</p>
        </div>

        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Avg. Order</p>
              <p className="text-white text-2xl font-bold">$156</p>
            </div>
            <TrendingUp className="text-yellow-300" size={24} />
          </div>
          <p className="text-emerald-300 text-xs mt-2">+8% increase</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
          <h3 className="text-white text-lg font-semibold mb-4">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="month" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="spending" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Spending Distribution */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
          <h3 className="text-white text-lg font-semibold mb-4">Spending by Crop Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cropSpending}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ crop, percent }) => `${crop} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="spending"
              >
                {cropSpending.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
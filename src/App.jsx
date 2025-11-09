import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { AuthPage } from './pages/AuthPage';
import  FarmerDashboard  from './pages/FarmerDashboard';
import  ShopkeeperDashboard  from './pages/ShopkeeperDashboard';
import { Toaster } from 'react-hot-toast';

// Protected Route component to handle authentication and role-based access
function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, userData } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  
  if (requiredRole && userData?.role !== requiredRole) {
    return <Navigate to={userData?.role === 'farmer' ? '/farmer' : '/shopkeeper'} />;
  }
  
  return children;
}

// Main routes component
function AppRoutes() {
  const { currentUser, userData } = useAuth();

  return (
    <Routes>
      {/* Public route for authentication */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected farmer route */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute requiredRole="farmer">
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Protected shopkeeper route */}
      <Route
        path="/shopkeeper"
        element={
          <ProtectedRoute requiredRole="shopkeeper">
            <ShopkeeperDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Home route - redirect based on user role */}
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to={userData?.role === 'shopkeeper' ? '/shopkeeper' : '/farmer'} replace />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      
      {/* Fallback route for undefined paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Main layout container with flex column */}
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navigation />
            
            {/* Main content area that grows to fill available space */}
            <main className="flex-1">
              <AppRoutes />
            </main>
            
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
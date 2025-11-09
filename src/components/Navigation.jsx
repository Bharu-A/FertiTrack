import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User, Menu, X } from 'lucide-react';

export default function Navigation() {
  const { currentUser, userData, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', show: true },
    { name: 'Dashboard', path: currentUser ? (userData?.role === 'farmer' ? '/farmer' : '/shopkeeper') : '/auth', show: true },
    { name: 'About', path: '/about', show: true },
  ];

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="backdrop-blur-lg bg-white/10 border-b border-white/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            onClick={handleNavClick}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🌿</span>
            </div>
            <span className="font-bold text-2xl text-white bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
              FertiTrack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              link.show && (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-white/90 hover:text-emerald-300 px-4 py-2 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 font-medium"
                >
                  {link.name}
                </Link>
              )
            ))}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-white" />}
            </button>

            {/* User Info */}
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                  <User size={18} className="text-emerald-300" />
                  <span className="text-white text-sm">{userData?.name}</span>
                  <span className="text-emerald-300 text-xs bg-emerald-500/20 px-2 py-1 rounded-full">
                    {userData?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-xl border border-red-300/30 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-emerald-500/80 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl backdrop-blur-sm border border-emerald-300/30 hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-white/10 border border-white/20"
            >
              {darkMode ? <Sun size={18} className="text-yellow-300" /> : <Moon size={18} className="text-white" />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
            >
              {isMenuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 backdrop-blur-lg bg-white/5">
            <div className="px-2 pt-2 pb-4 space-y-2">
              {navLinks.map((link) => (
                link.show && (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={handleNavClick}
                    className="text-white/90 hover:text-emerald-300 block px-3 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              
              {currentUser ? (
                <div className="border-t border-white/20 pt-3 space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2 text-white/80">
                    <User size={16} />
                    <span className="text-sm">{userData?.name} ({userData?.role})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center space-x-2 text-red-300 hover:bg-red-500/20 px-3 py-3 rounded-xl transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={handleNavClick}
                  className="block bg-emerald-500/80 text-white px-3 py-3 rounded-xl text-center hover:bg-emerald-500 transition-colors font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
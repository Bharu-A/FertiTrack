import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="backdrop-blur-lg bg-white/10 border-t border-white/20 shadow-xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          
          {/* Footer Content */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-white/80 text-sm">
                © {currentYear} FertiTrack. All rights reserved.
              </p>
            </div>

            {/* Footer Links */}
            <div className="flex items-center space-x-8">
              <Link
                to="/privacy"
                className="text-white/70 hover:text-emerald-300 text-sm transition-all duration-300 hover:scale-105"
              >
                Privacy Policy
              </Link>
              <Link
                to="/contact"
                className="text-white/70 hover:text-emerald-300 text-sm transition-all duration-300 hover:scale-105"
              >
                Contact Us
              </Link>
            </div>

          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/50">
              Cultivating the future of smart farming 🌱
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
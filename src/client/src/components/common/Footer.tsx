import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Planner</h3>
            <p className="text-gray-600 text-sm mb-4">
              Plan your meals, manage your recipes, and organize your grocery shopping all in one place. 
              Make meal planning simple and stress-free.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to={routes.home}
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to={routes.calendar}
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  Calendar
                </Link>
              </li>
              <li>
                <Link 
                  to={routes.dishes}
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  Recipes
                </Link>
              </li>
              <li>
                <Link 
                  to={routes.products}
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  to={routes.cart}
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Features
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 text-sm">Meal Planning</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Recipe Management</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Grocery Lists</span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">Product Tracking</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} Meal Planner. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a 
                href="#" 
                className="text-gray-500 hover:text-primary-600 text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-gray-500 hover:text-primary-600 text-sm transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


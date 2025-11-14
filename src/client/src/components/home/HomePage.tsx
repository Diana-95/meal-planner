import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';

const HomePage = () => {
  return (
    <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to Meal Planner
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Plan your meals, manage your recipes, and organize your grocery shopping all in one place.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Calendar Feature */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Meal Calendar</h3>
          <p className="text-gray-600 mb-4">
            Plan your meals for the week or month ahead. Drag and drop to reschedule, and easily visualize your meal plan.
          </p>
          <Link 
            to={routes.calendar}
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
          >
            View Calendar
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Recipes Feature */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Recipe Collection</h3>
          <p className="text-gray-600 mb-4">
            Save and organize your favorite recipes. Add ingredients, instructions, and images to create your personal cookbook.
          </p>
          <Link 
            to={routes.dishes}
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
          >
            Browse Recipes
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products Feature */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Management</h3>
          <p className="text-gray-600 mb-4">
            Keep track of your grocery products, prices, and measurements. Build your shopping list based on your meal plans.
          </p>
          <Link 
            to={routes.products}
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
          >
            Manage Products
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full font-bold text-lg mx-auto mb-3">
              1
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Create Recipes</h4>
            <p className="text-sm text-gray-600">
              Add your favorite dishes with ingredients and instructions
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full font-bold text-lg mx-auto mb-3">
              2
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Manage Products</h4>
            <p className="text-sm text-gray-600">
              Keep track of grocery items and their prices
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full font-bold text-lg mx-auto mb-3">
              3
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Plan Meals</h4>
            <p className="text-sm text-gray-600">
              Schedule your meals on the calendar for easy planning
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full font-bold text-lg mx-auto mb-3">
              4
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Stay Organized</h4>
            <p className="text-sm text-gray-600">
              Everything in one place for stress-free meal planning
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Start planning your meals today! Create your first recipe or add a meal to your calendar.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to={routes.calendar}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            View Calendar
          </Link>
          <Link
            to={routes.dishes}
            className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
          >
            Browse Recipes
          </Link>
          <Link
            to={routes.products}
            className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
          >
            Manage Products
          </Link>
          <Link
            to={routes.cart}
            className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
          >
            Shopping Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;


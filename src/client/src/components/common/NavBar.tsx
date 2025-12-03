import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import { useUser } from '../../context/UserContextProvider';

const NavBar = () => {
    const { user, setUser } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
   
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-1.5 text-gray-700 hover:text-primary-600 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                        <Link 
                            to={routes.home} 
                            className="text-sm lg:text-base text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Home
                        </Link>
                        <Link 
                            to={routes.calendar} 
                            className="text-sm lg:text-base text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Calendar
                        </Link>
                        <Link 
                            to={routes.dishes} 
                            className="text-sm lg:text-base text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Recipes
                        </Link>
                        <Link 
                            to={routes.products}
                            className="text-sm lg:text-base text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Products
                        </Link>
                        <Link 
                            to={routes.cart}
                            className="text-sm lg:text-base text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Cart
                        </Link>
                    </div>

                    {/* User info and logout - desktop */}
                    <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                        <Link
                            to={routes.profile}
                            className="text-xs lg:text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors cursor-pointer truncate max-w-[100px] lg:max-w-none"
                            title="View Profile"
                        >
                            {user?.username}
                        </Link>
                        <button 
                            onClick={() => {setUser(null)}} 
                            className="px-2 py-1 lg:px-4 lg:py-2 text-xs lg:text-base bg-red-500 text-white rounded-md lg:rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile user info - minimal */}
                    <div className="md:hidden flex items-center space-x-1">
                        <Link
                            to={routes.profile}
                            className="text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors cursor-pointer truncate max-w-[70px]"
                            title="View Profile"
                        >
                            {user?.username}
                        </Link>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-2 py-2 space-y-0.5">
                            <Link 
                                to={routes.home}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                            >
                                Home
                            </Link>
                            <Link 
                                to={routes.calendar}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                            >
                                Calendar
                            </Link>
                            <Link 
                                to={routes.dishes}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                            >
                                Recipes
                            </Link>
                            <Link 
                                to={routes.products}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                            >
                                Products
                            </Link>
                            <Link 
                                to={routes.cart}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                            >
                                Cart
                            </Link>
                            <Link 
                                to={routes.profile}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                            >
                                Profile
                            </Link>
                            <button 
                                onClick={() => {
                                    setUser(null);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full mt-1 px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium text-left"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
export default NavBar;
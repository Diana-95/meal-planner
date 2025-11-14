import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import { useUser } from '../../context/UserContextProvider';

const NavBar = () => {
    const { user, setUser } = useUser();
   
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-6">
                        <Link 
                            to={routes.home} 
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Home
                        </Link>
                        <Link 
                            to={routes.calendar} 
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Calendar
                        </Link>
                        <Link 
                            to={routes.dishes} 
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Recipes
                        </Link>
                        <Link 
                            to={routes.products}
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Products
                        </Link>
                        <Link 
                            to={routes.cart}
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Cart
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 font-medium">{user?.username}</span>
                        <button 
                            onClick={() => {setUser(null)}} 
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
export default NavBar;
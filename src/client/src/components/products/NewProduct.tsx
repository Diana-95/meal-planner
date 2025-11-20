import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import classes from '../../styles/NewMeal.module.css';
import routes from '../../routes/routes';
import { useApi } from '../../context/ApiContextProvider';
import { useProducts } from '../../context/ProductsContextProvider';
import { Product } from '../../types/types';
import { toastError, toastInfo } from '../common/toastService';


const NewProduct = () => {
    const navigate = useNavigate();
    const { api, loading } = useApi();
    const { setProducts } = useProducts();
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [measure, setMeasure] = useState('kg');
    const [emoji, setEmoji] = useState('');

    const onClickSaveHandle = async () => {
        const response = await api.products.create(name, measure, price, emoji || null);
        if(response) {
            toastInfo(`New product "${name}" was created`);
            setProducts(prevProds => [...prevProds, {id: response.rowID, name, measure, price, emoji: emoji || null} satisfies Product])
            
        }
        else { toastError('Failed to create product. Please try again.'); }
        navigate(routes.products);
    };

    const onCancelHandle = () => {
        navigate(routes.products);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onCancelHandle}
        >
            <div 
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Product</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter product name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0.00"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Measure
                        </label>
                        <select
                            value={measure}
                            onChange={(e) =>
                                setMeasure(e.target.value as 'kg' | 'gram' | 'piece')
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="kg">kg</option>
                            <option value="gram">gram</option>
                            <option value="piece">piece</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emoji (Optional)
                        </label>
                        <input
                            type="text"
                            value={emoji}
                            onChange={(e) => setEmoji(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-2xl"
                            placeholder="🍗"
                            maxLength={2}
                        />
                        <p className="mt-1 text-xs text-gray-500">Enter an emoji to represent this product</p>
                    </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onCancelHandle}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClickSaveHandle}
                        disabled={loading || !name || price <= 0}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewProduct;

import React, { useEffect, useState } from 'react';
import { Outlet, useLoaderData, useNavigate } from 'react-router-dom';

import styles from '../../styles/Products.module.css';
import routes from '../../routes/routes';
import { Product } from '../../types/types';
import { useApi } from '../../context/ApiContextProvider';
import { useProducts } from '../../context/ProductsContextProvider';

const ProductList = () => {

  const { api } = useApi();
  const loadedProducts = useLoaderData() as Product[];
  console.log(loadedProducts);
  const navigate = useNavigate();

  const { products, setProducts } = useProducts();

  useEffect(() => {
    // Optionally revalidate on certain conditions, or after editing
    // e.g., re-fetch data after saving to backend
    setProducts(loadedProducts);
  }, [loadedProducts]);

  const handleAddProduct = () => {
    navigate(routes.newProduct);
  };

  const handleDeleteProduct = async (id: number) => {

    const response = await api.products.delete(id);
    if(response !== undefined){
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    }
  };

  const handlePriceChange = async (id: number, price: number) => {
    const response = await api.products.updatePart(id, undefined, undefined, price);
    if(response !== undefined) {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? { ...product, price } : product
        )
     );
    }
  };

  const handleMeasureChange = async (id: number, measure: 'kg' | 'gram' | 'piece') => {
    const response = await api.products.updatePart(id, undefined, measure);
    if(response !== undefined) {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? { ...product, measure } : product
        )
      );
    }
  };

  const tableHeaders = ['Product Name', 'Price', 'Measure', 'Actions'];
  const baseCellClass = "px-6 py-2 whitespace-nowrap";
  
  const cellRenderers: Record<string, (product: Product) => React.ReactNode> = {
    'Product Name': (product) => (
      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
        {product.emoji && <span className="text-xl">{product.emoji}</span>}
        <span>{product.name}</span>
      </div>
    ),
    'Price': (product) => (
      <input
        type="number"
        value={product.price}
        onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value))}
        className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
        step="0.01"
      />
    ),
    'Measure': (product) => (
      <select
        value={product.measure}
        onChange={(e) => handleMeasureChange(product.id, e.target.value as 'kg' | 'gram' | 'piece')}
        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
      >
        <option value="kg">kg</option>
        <option value="gram">gram</option>
        <option value="piece">piece</option>
      </select>
    ),
    'Actions': (product) => (
      <button 
        onClick={() => handleDeleteProduct(product.id)}
        className="text-red-600 hover:text-red-900 font-medium"
      >
        Delete
      </button>
    ),
  };
  
  const renderCell = (product: Product, header: string) => {
    const renderer = cellRenderers[header];
    const cellClass = header === 'Actions' ? `${baseCellClass} text-sm font-medium` : baseCellClass;
    return (
      <td key={header} className={cellClass}>
        {renderer ? renderer(product) : null}
      </td>
    );
  };
  
  return (
    <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Products List</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your grocery products and prices</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
        >
          + Add New Product
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeaders.map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                {tableHeaders.map((header) => renderCell(product, header))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Outlet />
    </div>
  );
};

export default ProductList;
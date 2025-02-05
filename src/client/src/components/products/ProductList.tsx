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
  
  return (
    <div className={styles.container}>
      <h2>Products List</h2>
      <button onClick={handleAddProduct} className={styles.addButton}>Add New Product</button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>measure</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td style={{ padding: '8px' }}>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) =>
                    handlePriceChange(product.id, parseFloat(e.target.value))
                  }
                  style={{ width: '60px', padding: '4px' }}
                />
              </td>
              <td style={{ padding: '8px' }}>
                <select
                  value={product.measure}
                  onChange={(e) =>
                    handleMeasureChange(product.id, e.target.value as 'kg' | 'gram' | 'piece')
                  }
                  style={{ padding: '4px' }}
                >
                  <option value="kg">kg</option>
                  <option value="gram">gram</option>
                  <option value="piece">piece</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleDeleteProduct(product.id)} className={styles.deleteButton}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Outlet />
    </div>
  );
};

export default ProductList;
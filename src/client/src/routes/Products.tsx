import React, { useState } from 'react';
import { Outlet, useLoaderData, useNavigate } from 'react-router-dom';

import styles from './Groceries.module.css';
import { Product } from '../types/types';
import { deleteProduct, getAllProducts } from '../Apis/productsApi';
import routes from './routes';

const Products = () => {

  const loadedProducts = useLoaderData() as Product[];
  console.log(loadedProducts);
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>(loadedProducts);

  const handleAddProduct = () => {
    // Placeholder function for adding a new product
    navigate(routes.newProduct);
    console.log("Add new product functionality to be implemented");
  };

  const handleEditProduct = (id: number) => {
    
    console.log(`Edit product with id: ${id}`);
  };

  const handleDeleteProduct = (id: number) => {
    deleteProduct(id)
    .then(() => {
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    })
    .catch((error) => {
      throw new Error(error)
    });
    
  };

  const handlePriceChange = (id: number, price: number) => {

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, price } : product
      )
    );
  };

  const handleMeasureChange = (id: number, measure: 'kg' | 'gram' | 'piece') => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, measure } : product
      )
    );
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
                <button onClick={() => handleEditProduct(product.id)} className={styles.editButton}>Edit</button>
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

export default Products;

export const productsLoader = async () => {
  return getAllProducts()
  .then((prods) => {
      console.log('get dishes', prods);
      
      return prods;
  })
  .catch((error) => {
      throw new Error(error);
  });
}
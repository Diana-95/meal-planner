import React, { useState } from 'react';
import { useNavigate, useRevalidator } from 'react-router-dom';

import classes from '../../styles/NewMeal.module.css';
import { createProduct } from '../../apis/productsApi';
import routes from '../../routes/routes';
import { useApi } from '../../context/ApiContextProvider';
import { useProducts } from '../../context/ProductsContextProvider';
import { Product } from '../../types/types';


const NewProduct = () => {
    const navigate = useNavigate();
    const { api } = useApi();
    const { setProducts } = useProducts();
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [measure, setMeasure] = useState('kg');

    const onClickSaveHandle = async () => {
        const response = await api.products.create(name, measure, price );
           if(response) {
                console.log('Saved new product:', response.rowID);
                setProducts(prevProds => [...prevProds, {id: response.rowID, name, measure, price} satisfies Product])
                navigate(routes.products);
            }
    };

    const onCancelHandle = () => {
        navigate(routes.products);
    };

    return (
        <div className={classes.overlay}>
            <div className={classes.modal_window} style={{ height: '400px' }}>
                <h2>Create New Product</h2>
                <label>
                    Name:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', margin: '8px 0' }}
                    />
                </label>
                <label>
                    Price:
                    <input
                        type="number"
                        step="0.5"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value))}
                        style={{ width: '100%', margin: '8px 0' }}
                    />
                </label>
                <label>
                    Measure:
                    <select
                        value={measure}
                        onChange={(e) =>
                            setMeasure(e.target.value as 'kg' | 'gram' | 'piece')
                        }
                        style={{ padding: '4px' }}
                    >
                        <option value="kg">kg</option>
                        <option value="gram">gram</option>
                        <option value="piece">piece</option>
                    </select>
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                        onClick={onClickSaveHandle}
                        style={{
                            padding: '8px 12px',
                            background: '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        Save
                    </button>
                    <button
                        onClick={onCancelHandle}
                        style={{
                            padding: '8px 12px',
                            background: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewProduct;

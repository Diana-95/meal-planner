import React, { useState } from 'react';
import { useNavigate, useRevalidator } from 'react-router-dom';

import classes from '../../styles/NewMeal.module.css';
import { createProduct } from '../../apis/productsApi';
import routes from '../../routes/routes';


const NewProduct = () => {
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [measure, setMeasure] = useState('kg');

    const onClickSaveHandle = () => {
        createProduct(name, measure, price )
            .then((response) => {
                console.log('Saved new product:', response.rowID);
                revalidator.revalidate();
                navigate(routes.products);
            })
            .catch((error) => {
                console.error('Error saving product:', error);
            });
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

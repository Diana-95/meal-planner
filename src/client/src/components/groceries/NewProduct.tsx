import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import classes from '../calendar/NewMeal.module.css';
import { createProduct } from '../../Apis/productsApi';
import routes from '../../routes/routes';


const NewProduct = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [measure, setMeasure] = useState('');

    const onClickSaveHandle = () => {
        createProduct(name, measure, parseFloat(price) )
            .then((response) => {
                console.log('Saved new product:', response.rowID);
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
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
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

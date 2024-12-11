import React, { useState } from 'react';
import { useNavigate, useRevalidator } from 'react-router-dom';

import classes from '../../styles/NewMeal.module.css';
import { createDish } from '../../apis/dishesApi';
import routes from '../../routes/routes';


const NewDishWindow = () => {

  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [name, setName] = useState('');
  const [recipe, setRecipe] = useState('');
  const [imageUrl, setImage] = useState('');

  const onClickSaveHandle = () => {
    createDish(name, recipe, imageUrl)
    .then((response) => {
        console.log('save new dish', response.rowID);
        revalidator.revalidate();
        navigate(routes.dishes);
    })
    .catch((error) => {
        console.error('Error sending data:', error);
    });
  }
  return (
    <div className={classes.overlay}>
        <div className={classes.modal_window} style={{height: '400px'}}>
        <h2>Create new dish recipe</h2>
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
            Recipe:
            <textarea
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
            style={{ width: '100%', height: '60px', margin: '8px 0' }}
            />
        </label>
        <label>
            Image URL:
            <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImage(e.target.value)}
            style={{ width: '100%', margin: '8px 0' }}
            />
        </label>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onClickSaveHandle}  style={{ padding: '8px 12px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Save
            </button>
            <button  style={{ padding: '8px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Cancel
            </button>
        </div>
        </div>
    </div>
  );
};

export default NewDishWindow;

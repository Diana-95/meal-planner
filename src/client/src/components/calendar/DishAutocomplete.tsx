import React from 'react';
import { Dish } from '../../types/types';

const DishAutocomplete: React.FC<{item: Dish}> = ({ item }) => {

  return (
        <div style={{ marginTop: '16px' }}>
          <h4>Selected Dish:</h4>
          <p><strong>Name:</strong> {item.name}</p>
          <p><strong>Recipe:</strong> {item.recipe}</p>
          <p><img style= {{ width: '80px'}} src={item.imageUrl} /></p>
        </div>
)};
export default DishAutocomplete;

import React from 'react';
import { Product } from '../../types/types';

const ProductAutocomplete: React.FC<{item: Product}> = ({ item }) => {


  return (
        <div style={{ marginTop: '16px' }}>
          <p><strong>Name:</strong> {item.name}</p>
          <p><strong>Measure:</strong> {item.price}</p>
          <p><strong>Price:</strong> {item.price}</p>
        </div>
)};
export default ProductAutocomplete;

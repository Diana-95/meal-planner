import React from 'react';
import ProductList from '../../../../components/products/ProductList';
import { getAllProducts } from '../../../../apis/productsApi';


const Products = () => {
  return (
    <ProductList />
  )
}
export const productsLoader = async () => {
    return getAllProducts()
    .then((prods) => {
        return prods;
    })
    .catch((error) => {
        throw new Error(error);
    });
}

export default Products;
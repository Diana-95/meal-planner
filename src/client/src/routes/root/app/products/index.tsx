
import ProductList from '../../../../components/products/ProductList';
import { getAllProducts } from '../../../../apis/productsApi';
import { ProductsContextProvider } from '../../../../context/ProductsContextProvider';


const Products = () => {
  return (
    <ProductsContextProvider>
        <ProductList />
    </ProductsContextProvider>
    
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
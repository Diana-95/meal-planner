import { createContext, ReactNode, useContext, useState } from "react";
import { Dish, Product } from "../types/types";

interface Products {
    products: Product[]; 
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  }
  
  const ProductsContext = createContext< Products | undefined >(undefined);
  
  export const ProductsContextProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    return (
      <ProductsContext.Provider value={{ products, setProducts }}>
        {children}
      </ProductsContext.Provider>
    );
  };
  
  export const useProducts = () => {
    const context = useContext(ProductsContext);
    if (!context) throw new Error("useDishes must be used within a DishesProvider");
    return context;
  }
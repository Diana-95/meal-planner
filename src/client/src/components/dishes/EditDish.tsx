import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Dish, Ingredient, Product } from '../../types/types';

import styles from '../../styles/EditDish.module.css';
import routes from '../../routes/routes';
import Autocomplete from '../common/Autocomplete';
import ProductAutocomplete from './IngredientOption';
import { useApi } from '../../context/ApiContextProvider';
import { useDishes } from '../../context/DishesContextProvider';
import { toastError, toastInfo } from '../common/toastService';

const EditDish = () => {

  const navigate = useNavigate();
  const { id: dishId } = useParams<{ id: string }>();;

  const { api, loading } = useApi();
  const { setDishes } = useDishes();

  const [name, setName] = useState('');
  const [recipe, setRecipe] = useState('');
  const [imageUrl, setImage] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddIngredient = async() => {
   
    if (selectedProduct === null) return;
    const newIngredient: Ingredient = {
      id: -1,
      product: selectedProduct,
      dishId: Number(dishId),
      quantity: quantity,
    };
    setIngredients(prevIngredients => 
      [...prevIngredients, newIngredient]);
  
      setSelectedProduct(null);
      setQuantity(0);
  };

  useEffect(() => {
    const fetchIngredients = async () => {
      const dish = await api.dishes.getById(Number(dishId));
      if(dish) {
        if(dish.ingredientList)
          setIngredients(dish.ingredientList);
        else setIngredients([]);
        setName(dish.name);
        setImage(dish.imageUrl);
        setRecipe(dish.recipe);
      }
      else {
        toastError('Dish not found');
        navigate(routes.dishes);  
      }
    }

    fetchIngredients();
  }, [api.dishes.getById]);

  useEffect(() => {
    handleAddIngredient();
  }, [selectedProduct]) ;

  const saveIngredients = async () => {
    ingredients.forEach(async (ingredient) => {
      const { id, product, dishId, quantity } = ingredient;
      if(id === -1) {
        const response = await api.ingredients.create(product.id, dishId, quantity);
        if(response !== undefined) {
          setIngredients((prevIngredients) =>
          prevIngredients.map((ing) => ing.id === id ? {...ing, id: response.rowID} : ing )
        )}
      }
      else {
        const response = await api.ingredients.update(product.id, dishId, quantity, id);
        if(response !== undefined) {
          setIngredients((prevIngredients) =>
            prevIngredients.map((ing) => ing.id === id ? {...ing, quantity} : ing )
          )
        }
      }
    });
  }

  const onSaveHandle = async () => {
    const response = await api.dishes.update(name, recipe, imageUrl, Number(dishId));
    
    if(response !== undefined) { 
      saveIngredients();
      setDishes(prevDishes => prevDishes.map((item) => 
        item.id === Number(dishId) ? {...item, name, recipe, imageUrl, ingredientList: ingredients} satisfies Dish
        : item));
      toastInfo(`${name} was updated`);
      navigate(routes.dishes);
    }
  }

  const onCloseHandle = () => {
    navigate(routes.dishes);
  }

  const onDeleteHandle = () => {
    const response = api.dishes.delete(Number(dishId));
    if(response !== undefined) {
      setDishes(prevDishes => prevDishes.filter(item => item.id !== Number(dishId)));
      toastInfo(`${name} was deleted`);
      navigate(routes.dishes);
    }
  }

  const onIngredientDeleteHandle = async (id: number) => {
    const response = await api.ingredients.delete(id);
    if(response !== undefined) {
      setIngredients((prevIngredients) => 
        prevIngredients.filter((ingredient) => ingredient.id !== id)
    );
    }
  }

  return (
    <div className={styles.backdrop} onClick={() => {onCloseHandle}} >
    <div className={styles.modal_window} onClick={(e) => e.stopPropagation()} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', width: '300px' }}>
      <h2>Edit Dish</h2>
      <label htmlFor='name'>
        Name:
      </label>
        <input
          id='name'
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', margin: '8px 0' }}
        />
      <label htmlFor='recipe'>
        Recipe:
        </label>
        <textarea
          id='recipe'
          value={recipe}
          onChange={(e) => setRecipe(e.target.value)}
          style={{ width: '100%', height: '60px', margin: '8px 0' }}
        />
      
      <label htmlFor='imageUrl'>
        Image URL:
        </label>
        <input
          id='imageUrl'
          type="text"
          value={imageUrl}
          onChange={(e) => setImage(e.target.value)}
          style={{ width: '100%', margin: '8px 0' }}
        />

      <h3>Add Ingredients</h3>
      <Autocomplete<Product>
                data={selectedProduct} 
                setData={setSelectedProduct} 
                fetchAllSuggestions={api.products.get}
                CustomComponent={ProductAutocomplete}
      />
     
      <h3>Ingredients List</h3>
      <table style={{ width: '100%', marginBottom: '16px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Product</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Quantity</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Measure</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ingredient.product.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) => {
                    setIngredients((prevIngredients) =>
                      prevIngredients.map((ing) =>
                        ing.id === ingredient.id ? { ...ing, quantity: Number(e.target.value) } : ing
                      )
                    );
                  }}
                />
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ingredient.product.measure}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}> 
                <button onClick={() => onIngredientDeleteHandle(ingredient.id)}>
                  delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onSaveHandle}  disabled={loading} style={{ padding: '8px 12px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px' }}>
          {loading ? 'Submitting' :'Save'}
        </button>
        <button onClick={onDeleteHandle} style={{ padding: '8px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Delete
        </button>
        <button onClick={onCloseHandle} style={{ padding: '8px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Cancel
        </button>
      </div>
    </div>
    </div>
  );
};

export default EditDish;
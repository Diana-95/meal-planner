import React, { useEffect, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate, useParams, useRevalidator } from 'react-router-dom';
import { deleteDish, getDishById, updateDish } from '../../apis/dishesApi';
import { Dish, Ingredient, Product } from '../../types/types';
import { deleteIngredient, getIngredients } from '../../apis/ingredientsApi';
import styles from '../../styles/EditDish.module.css';
import routes from '../../routes/routes';
import Autocomplete from '../common/Autocomplete';
import ProductAutocomplete from './IngredientOption';
import { getAllProducts } from '../../apis/productsApi';
import { useApi } from '../../context/ApiContextProvider';
import { useDishes } from '../../context/DishesContextProvider';

const EditDish = () => {

  const navigate = useNavigate();
  const { id: dishId } = useParams<{ id: string }>();;
    

  const { api } = useApi();
  const { setDishes } = useDishes();

  const [name, setName] = useState('');
  const [recipe, setRecipe] = useState('');
  const [imageUrl, setImage] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // console.log('ingredients:', ingredients);
  const handleAddIngredient = async() => {
    console.log('add ingredient', selectedProduct?.name);
    if (selectedProduct === null) return;

    // Add ingredient to list
    const response = await api.ingredients.create(selectedProduct.id, Number(dishId), quantity)
    console.log('response', response);
    console.log('response params:', selectedProduct.id, Number(dishId), quantity);
    if(response) {
      const newIngredient =  { id: response.rowID, product: selectedProduct, dishId: Number(dishId), quantity };
      setIngredients((prevIngredients) => [
          ...prevIngredients,
          newIngredient
        ]);
      setDishes((prevDishes: Dish[]) => (
        prevDishes.map(item => item.id === Number(dishId)
         ? {...item, ingredientList: [item.ingredientList, newIngredient] as Ingredient[] } satisfies Dish
        : item)
      ))
      // Clear selection
      setSelectedProduct(null);
      setQuantity(0);
    }
  };

  useEffect(() => {
    const fetchIngredients = async () => {
      const dish = await api.dishes.getById(Number(dishId));
      if(dish) {
        console.log('dish:', dish);
        if(dish.ingredientList)
          setIngredients(dish.ingredientList);
        else setIngredients([]);
        setName(dish.name);
        setImage(dish.imageUrl);
        setRecipe(dish.recipe);
      }
    }
    
    fetchIngredients();
  }, []);

  useEffect(() => {
    handleAddIngredient();
  }, [selectedProduct]) ;

  const onSaveHandle = async () => {
    const response = await api.dishes.update(name, recipe, imageUrl, Number(dishId));
    if(response !== undefined) {
      setDishes(prevDishes => prevDishes.map((item) => 
      item.id === Number(dishId) ? {...item, name, recipe, imageUrl} 
      : item));
      navigate(routes.dishes);

    }

  }

  const onCloseHandle = () => {
    navigate(routes.dishes);
  }

  const onDeleteHandle = () => {
      // todo: do you want to delete dialogue
    const response = api.dishes.delete(Number(dishId));
   if(response !== undefined) {
    setDishes(prevDishes => prevDishes.filter(item => item.id !== Number(dishId)));
    navigate(routes.dishes);
   }
  }

  const onIngredientDeleteHandle = async (id: number) => {
    const response = await api.ingredients.delete(id);
    if(response !== undefined) {
      setIngredients((prevIngredients) => 
        prevIngredients.filter((ingredient) => ingredient.id !== id)
      );
      setDishes((prevDishes: Dish[]) => (
        prevDishes.map(item => item.id === Number(id)
         ? {...item, 
          ingredientList: item.ingredientList.filter(ingr => ingr.id !== id) as Ingredient[] } satisfies Dish
        : item)
      ))

    }
  }

  return (
    <div className={styles.backdrop} >
    <div className={styles.modal_window} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', width: '300px' }}>
      <h2>Edit Dish</h2>
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

      <h3>Add Ingredients</h3>
      <Autocomplete<Product>
                data={selectedProduct} setData={setSelectedProduct} 
                fetchAllSuggestions={getAllProducts}
                CustomComponent={ProductAutocomplete}
               />
      {/* <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <select
          value={selectedProduct || ''}
          onChange={(e) => setSelectedProduct(Number(e.target.value))}
          style={{ marginRight: '8px', padding: '4px' }}
        >
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.measure})
            </option>
          ))}
        </select> */}
     

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
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ingredient.quantity}</td>
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
        <button onClick={onSaveHandle}  style={{ padding: '8px 12px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Save
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
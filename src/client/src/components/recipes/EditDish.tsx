import React, { useEffect, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import { deleteDish, getDishById, updateDish } from '../../apis/dishesApi';
import { Dish, Ingredient, Product } from '../../types/types';
import { getAllSuggestedProducts } from '../../apis/productsApi';
import { addIngredient, deleteIngredient, getIngredientsByDishId } from '../../apis/ingredientsApi';
import styles from './EditDish.module.css';
import routes from '../../routes/routes';
import { deleteDishfromMeals } from '../../apis/mealsApi';
import Autocomplete from '../patterns/Autocomplete';
import ProductAutocomplete from './ProductAutocomplete';

const EditDish = () => {

  const navigate = useNavigate();
  const revalidator = useRevalidator();
  
  const dish = useLoaderData() as Dish;

  const [name, setName] = useState(dish.name);
  const [recipe, setRecipe] = useState(dish.recipe);
  const [imageUrl, setImage] = useState(dish.imageUrl);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // console.log('ingredients:', ingredients);
  const handleAddIngredient = () => {
    if (selectedProduct === null) return;

    // Add ingredient to list
    addIngredient(selectedProduct.id, dish.id, quantity)
    .then((response) => {
      setIngredients((prevIngredients) => [
        ...prevIngredients,
        { id: response.rowID, product: selectedProduct, dishId: dish.id, quantity }
      ]);
    })
    .catch()
    
    // Clear selection
    setSelectedProduct(null);
    setQuantity(0);
  };

  useEffect(() => {
    getIngredientsByDishId(dish.id)
    .then(setIngredients)
    .catch((error) => {throw new Error(error)})
  }, []);

  useEffect(() => {
    handleAddIngredient();
  }, [selectedProduct]) ;

  const onSaveHandle = () => {
    updateDish(name,recipe, imageUrl, dish.id)
    .then(() => {
      revalidator.revalidate();
      navigate(routes.dishes);
    })
    .catch((error) => {
      throw new Error(error);
    });

  }

  const onCloseHandle = () => {
    navigate(routes.dishes);
  }

  const onDeleteHandle = () => {
      // todo: do you want to delete dialogue
    deleteDishfromMeals(dish.id)
    .then(() => {
      deleteDish(dish.id)
    })
    .then(() => {
      revalidator.revalidate();
      navigate(routes.dishes);
    })
    .catch((error) => {
      throw new Error(error);
    });
  }

  const onIngredientDeleteHandle = (id: number) => {
    deleteIngredient(id)
    .then(() => {
      setIngredients((prevIngredients) => 
        prevIngredients.filter((ingredient) => ingredient.id !== id)
      );
    })
    .catch((error) => {
      throw new Error(error);
    });
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
                fetchAllSuggestions={getAllSuggestedProducts}
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

export const dishLoader = async ({ params }: LoaderFunctionArgs): Promise<Dish> => {
    const { id } = params;
    try {
      const dish = await getDishById(Number(id));
      const ingredientList = await getIngredientsByDishId(dish.id);
      const loadedDish: Dish = {
        ...dish,
        ingredientList
      };
      return loadedDish;
    }
    catch (error) {
      console.error('Error getting dish by id:', error);
      throw new Error('Could not get dish by id');
    }
}
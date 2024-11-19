import React, { useEffect, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import { deleteDish, getDishById, updateDish } from '../../Apis/dishesApi';
import { Dish, Ingredient, Product } from '../../types/types';
import { getAllProducts } from '../../Apis/productsApi';
import { addIngredient, deleteIngredient, getIngredientsByDishId } from '../../Apis/ingredientsApi';
import styles from './EditDish.module.css';
import routes from '../../routes/routes';

const EditDish = () => {

  const navigate = useNavigate();
  const revalidator = useRevalidator();
  
  const dish = useLoaderData() as Dish;

  const [name, setName] = useState(dish.name);
  const [recipe, setRecipe] = useState(dish.recipe);
  const [imageUrl, setImage] = useState(dish.imageUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(0);

  console.log('ingredients:', ingredients);
  const handleAddIngredient = () => {
    if (selectedProduct === null || quantity <= 0) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    // Add ingredient to list
    addIngredient(product.id, dish.id, quantity)
    .then((response) => {
      setIngredients((prevIngredients) => [
        ...prevIngredients,
        { id: response.rowID, productId: product.id, dishId: dish.id, quantity}
      ]);
    })
    .catch()
    
    // Clear selection
    setSelectedProduct(null);
    setQuantity(0);
  };

  useEffect(() => {
    // Fetch products from the API
    getAllProducts().then(setProducts);
    getIngredientsByDishId(dish.id).then((ingrs) => {
      setIngredients(ingrs);
      console.log(ingrs);
  });

  }, []);
  
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
    deleteDish(dish.id)
    .then(() => {
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

  const filterProductById = (id: number) => {
    return products.find(product => product.id === id);
  };

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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
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
        </select>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="Quantity"
          style={{ marginRight: '8px', width: '80px' }}
        />
        <button onClick={handleAddIngredient}>Add Ingredient</button>
      </div>

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
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{filterProductById(ingredient.productId)?.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ingredient.quantity}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{filterProductById(ingredient.productId)?.measure}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}> 
                <button onClick={() => onIngredientDeleteHandle(ingredient.id)} />
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
    console.log('getDish');
    return getDishById(Number(id))
    .then((dish) => {
        console.log('getDish');
        console.log(dish);
        const loadedDish = dish;
        return getIngredientsByDishId(dish.id)
        .then((ingredients) => {
          loadedDish.ingredientList = ingredients;
          console.log(loadedDish);
          return loadedDish;
        })
        .catch()
      })
      .then()
      .catch((error) => {
        console.error('Error getting dish by id:', error);
        throw new Error('Could not get dish by id');
      });
}
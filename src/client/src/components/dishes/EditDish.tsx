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
import { validateImageUrl } from '../../utils/urlValidation';

const EditDish = () => {

  const navigate = useNavigate();
  const { id: dishId } = useParams<{ id: string }>();;

  const { api, loading } = useApi();
  const { setDishes } = useDishes();

  const [name, setName] = useState('');
  const [recipe, setRecipe] = useState('');
  const [imageUrl, setImage] = useState('');
  const [imageUrlError, setImageUrlError] = useState<string | undefined>(undefined);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const blobUrlRef = React.useRef<string | null>(null);
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
        setOriginalImageUrl(dish.imageUrl);
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
    // Use Promise.all to wait for all ingredient saves to complete
    await Promise.all(
      ingredients.map(async (ingredient) => {
        const { id, product, dishId, quantity } = ingredient;
        if (id === -1) {
          // New ingredient - create it
          const response = await api.ingredients.create(product.id, dishId, quantity);
          if (response !== undefined) {
            setIngredients((prevIngredients) =>
              prevIngredients.map((ing) => 
                ing.id === id ? { ...ing, id: response.rowID } : ing
              )
            );
          }
        } else {
          // Existing ingredient - update it
          await api.ingredients.update(product.id, dishId, quantity, id);
        }
      })
    );
  }

  const onSaveHandle = async () => {
    let finalImageUrl = imageUrl;
    
    // If a file was selected, upload it first
    if (selectedFile) {
      setUploadingImage(true);
      try {
        const uploadResult = await api.upload.image(selectedFile);
        if (!uploadResult) {
          toastError('Failed to upload image. Please try again.');
          setUploadingImage(false);
          return;
        }
        finalImageUrl = uploadResult.imageUrl;
        // Prepend server URL if it's a relative path
        if (finalImageUrl.startsWith('/')) {
          const serverUrl = process.env.REACT_APP_AUTH_URL || 'http://localhost:4000';
          finalImageUrl = `${serverUrl}${finalImageUrl}`;
        }
        // Optionally delete old image if it was a server upload
        if (originalImageUrl.startsWith('/uploads/')) {
          const oldFilename = originalImageUrl.split('/').pop();
          if (oldFilename) {
            try {
              await api.upload.deleteImage(oldFilename);
            } catch (error) {
              // Ignore errors when deleting old image
              console.warn('Failed to delete old image:', error);
            }
          }
        }
      } catch (error) {
        toastError('Failed to upload image. Please try again.');
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    } else if (imageUrl && !imageUrl.startsWith('blob:')) {
      // Validate image URL if it's not a file upload preview (blob URL)
      // Skip validation for server paths (already uploaded) or external URLs
      if (!imageUrl.startsWith('/uploads/') && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
        const urlValidation = validateImageUrl(imageUrl);
        if (!urlValidation.isValid) {
          toastError(urlValidation.error || 'Invalid image URL');
          setImageUrlError(urlValidation.error);
          return;
        }
      }
    }
    
    setImageUrlError(undefined);

    try {
      // First save the dish
      const response = await api.dishes.update(name, recipe, finalImageUrl, Number(dishId));
      
      if (response !== undefined) {
        // Then save all ingredients (wait for completion)
        await saveIngredients();
        
        // Update local state
        setDishes(prevDishes => prevDishes.map((item) => 
          item.id === Number(dishId) ? {...item, name, recipe, imageUrl: finalImageUrl, ingredientList: ingredients} satisfies Dish
          : item));
        
        toastInfo(`${name} was updated`);
        navigate(routes.dishes);
      }
    } catch (error) {
      console.error('Error saving dish:', error);
      toastError('Failed to save dish');
    }
  }

  const removeSelectedProduct = () => {
    setSelectedProduct(null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toastError('Please select an image file');
        return;
      }
      
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toastError(`Image file is too large. Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        return;
      }
      
      // Revoke previous blob URL if it exists
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      
      // Store the file and create preview URL
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      blobUrlRef.current = previewUrl;
      setImage(previewUrl);
      setImageUrlError(undefined);
    }
  }

  const handleRemoveImage = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setImage('');
    setSelectedFile(null);
  }
  
  // Cleanup blob URL on unmount
  React.useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);
  
  // Cleanup when imageUrl changes from blob URL to something else
  React.useEffect(() => {
    if (!imageUrl.startsWith('blob:') && blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, [imageUrl]);

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onCloseHandle}
    >
      <div 
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Dish</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor='name' className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id='name'
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor='recipe' className="block text-sm font-medium text-gray-700 mb-1">
              Recipe
            </label>
            <textarea
              id='recipe'
              value={recipe}
              onChange={(e) => setRecipe(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={name || 'Dish preview'}
                  className="w-full h-64 object-cover rounded-md border border-gray-300"
                />
                <div className="mt-2 flex gap-2">
                  <label className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium cursor-pointer text-center">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Or enter image URL:</p>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      const value = e.target.value;
                      setImage(value);
                      // Validate on change and show error
                      const validation = validateImageUrl(value);
                      if (validation.isValid || !value.trim()) {
                        setImageUrlError(undefined);
                      } else {
                        setImageUrlError(validation.error);
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm ${
                      imageUrlError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {imageUrlError && (
                    <p className="mt-1 text-xs text-red-600">{imageUrlError}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Ingredients</h3>
            <Autocomplete<Product>
              data={selectedProduct} 
              setData={setSelectedProduct} 
              removeData={removeSelectedProduct}
              fetchAllSuggestions={api.products.get}
              CustomComponent={ProductAutocomplete}
            />
          </div>
         
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingredients List</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Measure</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ingredients.map((ingredient, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{ingredient.product.name}</td>
                      <td className="px-4 py-3">
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
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ingredient.product.measure}</td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => onIngredientDeleteHandle(ingredient.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button 
            onClick={onCloseHandle}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={onDeleteHandle}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
          <button 
            onClick={onSaveHandle}
            disabled={loading || uploadingImage}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {uploadingImage ? 'Uploading image...' : loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDish;
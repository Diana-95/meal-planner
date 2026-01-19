import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import classes from '../../styles/NewMeal.module.css';
import routes from '../../routes/routes';
import { useDishes } from '../../context/DishesContextProvider';
import { Dish } from '../../types/types';
import { useApi } from '../../context/ApiContextProvider';
import { toastError, toastInfo } from '../common/toastService';
import { validateImageUrl } from '../../utils/urlValidation';


const NewDishWindow = () => {

  const navigate = useNavigate();
  const { api, loading } = useApi();
  const { setDishes } = useDishes();
  const [name, setName] = useState('');
  const [recipe, setRecipe] = useState('');
  const [imageUrl, setImage] = useState('');
  const [imageUrlError, setImageUrlError] = useState<string | undefined>(undefined);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const blobUrlRef = React.useRef<string | null>(null);

  const onClickSaveHandle = async () => {
    if(name === '' || recipe === ''){
        toastError('Please fill in all fields before saving.');
        return;
    }
    
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
      } catch (error) {
        toastError('Failed to upload image. Please try again.');
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    } else if (imageUrl && !imageUrl.startsWith('blob:')) {
      // Validate image URL if it's not a file upload preview (blob URL)
      // Skip validation for server paths (already uploaded)
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
    
    const response = await api.dishes.create(name, recipe, finalImageUrl);
    if(response !== undefined){
        toastInfo(`New dish "${name}" was created`);
        setDishes((prevDishes) => 
            [...prevDishes, ({ id: response.rowID, name, recipe, imageUrl: finalImageUrl} as Dish)]
        )
        navigate(routes.dishes);
    }   
  }

    const onCloseHandle = () => {
        navigate(routes.dishes);
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
  
  // Cleanup blob URL on unmount or when imageUrl changes away from blob URL
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
            data-testid="overlay" 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onCloseHandle}
        >
            <div 
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create new dish recipe</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter dish name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recipe
                        </label>
                        <textarea
                            value={recipe}
                            onChange={(e) => setRecipe(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter recipe instructions"
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
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
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
                                          setSelectedFile(null); // Clear file selection when typing URL
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
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                    <button 
                        onClick={onCloseHandle}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onClickSaveHandle} 
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

export default NewDishWindow;

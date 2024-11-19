import { DishRepository } from "./repository/dish_repository";
import { IngredientRepository } from "./repository/ingredients_repository";
import { MealRepository } from "./repository/meal_repository";
import { ProductRepository } from "./repository/products_repository";

export const mealRepository: MealRepository = new MealRepository();
export const dishRepository: DishRepository = new DishRepository();
export const productRepository: ProductRepository = new ProductRepository();
export const ingredientRepository: IngredientRepository = new IngredientRepository();
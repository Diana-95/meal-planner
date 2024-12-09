import { DishRepository } from "./repository/dishes";
import { IngredientRepository } from "./repository/ingredients";
import { MealRepository } from "./repository/meals";
import { ProductRepository } from "./repository/products";
import { UserRepository } from "./repository/users";

export const mealRepository: MealRepository = new MealRepository();
export const dishRepository: DishRepository = new DishRepository();
export const productRepository: ProductRepository = new ProductRepository();
export const ingredientRepository: IngredientRepository = new IngredientRepository();
export const userRepository: UserRepository = new UserRepository();
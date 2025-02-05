import { Ingredient } from "./ingredient";

export interface Dish {
    id: number,
    name: string,
    recipe: string,
    imageUrl: string,
    userId?: number,
    ingredientList: Ingredient[]
}
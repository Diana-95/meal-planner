import { Dish } from "./dish";

export interface Meal {
    id: number,
    name: string,
    startDate: number,
    endDate: number,
    dish: Dish | null
}
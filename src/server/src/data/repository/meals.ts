import { SqlRepository } from "../sql-repository";
import { Meal } from "../../entity/meal";
import { QueryParams } from "../repository";
import { Dish } from "../../entity/dish";

export type MealInput = Omit<Meal, 'dish'> & { dishId : number | null , userId: number};
export class MealRepository extends SqlRepository<Meal, MealInput> {
    
    async delete(id: number, userId: number): Promise<number> {
        return this.db('Meals')
                .where({
                    'id': id,
                    'userId': userId
                })
                .del();
    }

    async create(r: MealInput): Promise<number> {
        
        const [id] = await this.db('Meals').insert({
            name: r.name, 
            startDate: r.startDate, 
            endDate: r.endDate, 
            dishId: r.dishId, 
            userId: r.userId
        });
        return id;
    }

    async updatePatch(r: MealInput): Promise<void> {
        const query = this.db('Meals').where({
            'id': r.id,
            'userId': r.userId
        });

        const updateFields: Record<string, any> = {};
        
        if (r.name) updateFields.name = r.name;
        if (r.startDate) updateFields.startDate = r.startDate;
        if (r.endDate) updateFields.endDate = r.endDate;
        if (r.dishId) updateFields.dishId = r.dishId;

        if (Object.keys(updateFields).length > 0) {
            await query.update(updateFields);
        }
    }

    async update(r: MealInput): Promise<void> {
        await this.db('Meals').where({
            'id': r.id,
            'userId': r.userId
        })
        .update({
            "name": r.name,
            "startDate": r.startDate,
            "endDate": r.endDate,
            "dishId": r.dishId
        })
    }

    async get(cursor: number| undefined, limit: number, query: QueryParams): Promise<Meal[]> { 

        const {userId} = query;
        const rows = await this.db('Meals')
            .leftJoin('Dishes', 'Meals.dishId', 'Dishes.id')
            .select(
                'Meals.id AS mealId',
                'Meals.name AS mealName', 
                'Meals.startDate', 
                'Meals.endDate', 
                'Meals.userId as userId',
                'Dishes.id AS dishId', 
                'Dishes.name AS dishName', 
                'Dishes.recipe AS recipe', 
                'Dishes.imageUrl AS imageUrl')
            .where('Meals.userId', userId)
            .limit(limit);
        return rows.map((row: any) => ({
            id: row.mealId,
            name: row.mealName,
            startDate: row.startDate,
            endDate: row.endDate,
            dish: {
                id: row.dishId,
                name: row.dishName,
                recipe: row.recipe,
                imageUrl: row.imageUrl,
                userId: userId
            }
        } as Meal));
      
    }
    

    async getById(id: number, userId: number): Promise<Meal> {
        const row = await this.db('Meals')
                        .leftJoin('Dishes', 'Meals.dishId', 'Dishes.id')
                        .select('Meals.id AS mealId',
                            'Meals.name AS mealName', 
                            'Meals.startDate', 
                            'Meals.endDate', 
                            'Meals.userId as mealUserId',
                            'Dishes.id AS dishId', 
                            'Dishes.name AS dishName', 
                            'Dishes.recipe AS recipe', 
                            'Dishes.imageUrl AS imageUrl'
                        )
                        .where({
                            'mealId': id,
                            'mealUserId': userId
                        })
                        .first();
        return ({
            id: row.mealId,
            name: row.mealName,
            startDate: row.startDate,
            endDate: row.endDate,
            dish: ({
                id: row.dishId,
                name: row.dishName,
                recipe: row.recipe,
                imageUrl: row.imageUrl,
                userId: userId
            } as Dish)
        } as Meal);
    }
}
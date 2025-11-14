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

        const updateFields: Record<string, string | number | null> = {};
        
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

    async get(cursor: number| undefined, limit: number, query: QueryParams = {}): Promise<Meal[]> { 

        const { userId, startDate, endDate, searchName } = query;

        const normalizeDateParam = (value?: string): string | undefined => {
            if (!value) return undefined;

            // Accept numeric timestamps (in ms) or ISO strings
            const numericValue = Number(value);
            const date = !Number.isNaN(numericValue) && value.trim() !== ''
                ? new Date(numericValue)
                : new Date(value);

            if (Number.isNaN(date.getTime())) return undefined;
            return date.toISOString();
        };

        const normalizedStart = normalizeDateParam(startDate);
        const normalizedEnd = normalizeDateParam(endDate);

        const rowsQuery = this.db('Meals')
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

        if (normalizedStart) {
            // Keep meals that end on or after the selected start date
            rowsQuery.andWhere('Meals.endDate', '>=', normalizedStart);
        }

        if (normalizedEnd) {
            // Keep meals that start on or before the selected end date
            rowsQuery.andWhere('Meals.startDate', '<=', normalizedEnd);
        }

        if (searchName) {
            rowsQuery.andWhere('Meals.name', 'like', `%${searchName}%`);
        }

        const rows = await rowsQuery;
        return rows.map((row: {
            mealId: number;
            mealName: string;
            startDate: string | number;
            endDate: string | number;
            userId: number;
            dishId: number | null;
            dishName: string | null;
            recipe: string | null;
            imageUrl: string | null;
        }) => ({
            id: row.mealId,
            name: row.mealName,
            startDate: typeof row.startDate === 'string' ? new Date(row.startDate).getTime() : row.startDate,
            endDate: typeof row.endDate === 'string' ? new Date(row.endDate).getTime() : row.endDate,
            dish: row.dishId ? {
                id: row.dishId,
                name: row.dishName || '',
                recipe: row.recipe || '',
                imageUrl: row.imageUrl || '',
                userId: userId
            } : null
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

    /**
     * Get aggregated ingredients from multiple meals
     * Returns ingredients grouped by product with summed quantities using SQL aggregation
     */
    async getAggregatedIngredients(mealIds: number[], userId: number): Promise<Array<{
        productId: number;
        productName: string;
        measure: string;
        price: number;
        totalQuantity: number;
    }>> {
        // Use SQL GROUP BY and SUM to aggregate ingredients directly in the database
        // Join: Meals -> Dishes -> Ingredients -> Products
        const rows = await this.db('Meals')
            .leftJoin('Dishes', 'Meals.dishId', 'Dishes.id')
            .leftJoin('Ingredients', 'Dishes.id', 'Ingredients.dishId')
            .leftJoin('Products', 'Ingredients.productId', 'Products.id')
            .select(
                'Products.id as productId',
                'Products.name as productName',
                'Products.measure',
                'Products.price',
                this.db.raw('SUM(??) as ??', ['Ingredients.quantity', 'totalQuantity'])
            )
            .whereIn('Meals.id', mealIds)
            .andWhere('Meals.userId', userId)
            .whereNotNull('Ingredients.id') // Only meals with ingredients
            .whereNotNull('Products.id') // Only valid products
            .groupBy('Products.id', 'Products.name', 'Products.measure', 'Products.price')
            .orderBy('Products.name', 'asc');

        return rows.map((row: {
            productId: number;
            productName: string;
            measure: string | null;
            price: number | null;
            totalQuantity: number | string; // SQLite returns SUM as string sometimes
        }) => ({
            productId: row.productId,
            productName: row.productName,
            measure: row.measure || 'unit',
            price: row.price || 0,
            totalQuantity: typeof row.totalQuantity === 'string' ? parseFloat(row.totalQuantity) : row.totalQuantity
        }));
    }
}
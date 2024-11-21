import { SqlRepository } from "../sql_repository";
import { Meal } from "../../entity/meal";

export type MealInput = Omit<Meal, 'dish'> & { dishId : number | null };

export class MealRepository extends SqlRepository<Meal, MealInput> {
    
    async delete(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`DELETE FROM Meals 
                WHERE id = ?`, //db.run where no result needed
                id,
                function(err){
                    if (err) {
                        console.log(err.message);
                        reject(err.message);
                    }
                    resolve();
                });
        });
    }

    async create(r: MealInput): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.db.run('INSERT INTO Meals (name, startDate, endDate, dishId) VALUES (?, ?, ?, ?)', //db.run where no result needed
                [r.name, r.startDate, r.endDate, r.dishId],
                function(err){
                    if (err) {
                        console.log(err.message);
                        reject(err.message);
                    }
                    else if(this.lastID !== undefined) resolve(this.lastID);
                    console.log(this.lastID);
                });
        });
    }

    async update(r: MealInput): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                UPDATE Meals
                SET name = ?, startDate = ?, endDate = ?
                WHERE id = ?;
            `, 
            [r.name, r.startDate, r.endDate, r.id],
            function(err){
                if (err) {
                    console.log(err.message);
                    reject(err.message);
                }
                resolve();
                console.log(`Row(s) updated: ${this.changes}`);
            });
        });
    }

    async updateDishId(id: number, dishId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                UPDATE Meals
                SET dishId = ?
                WHERE id = ?;
            `, 
            [dishId, id],
            function(err){
                if (err) {
                    console.log(err.message);
                    reject(err.message);
                }
                resolve();
                console.log(`Row(s) updated: ${this.changes}`);
            });
        });
    }

    async deleteDishFromMeals(dishId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                UPDATE Meals
                SET dishId = NULL
                WHERE dishId = ?;
            `, 
            dishId,
            function(err){
                if (err) {
                    console.log(err.message);
                    reject(err.message);
                }
                resolve();
                console.log(`Row(s) updated: ${this.changes}`);
            });
        });
    }

    async getAll(limit: number): Promise<Meal[]> { 
        return new Promise<Meal[]>((resolve, reject) => {
            this.db.all(
                `SELECT Meals.id AS mealId, Meals.name AS mealName, Meals.startDate, Meals.endDate, 
                        Dishes.id AS dishId, Dishes.name AS dishName, Dishes.recipe AS dishRecipe, Dishes.imageUrl AS dishImageUrl
                 FROM Meals
                 LEFT JOIN Dishes ON Meals.dishId = Dishes.id
                 LIMIT $limit`, 
                {$limit: limit},
                (err, rows) => {
                    if (err) {
                        console.error('Database error:', err.message);
                        reject(err.message);
                        return;
                    }
    
                    resolve(
                        rows.map((row: any) => ({
                            id: row.mealId,
                            name: row.mealName,
                            startDate: row.startDate,
                            endDate: row.endDate,
                            dish: row.dishId
                                ? {
                                    id: row.dishId,
                                    name: row.dishName,
                                    recipe: row.dishRecipe,
                                    imageUrl: row.dishImageUrl,
                                  }
                                : null, // No associated dish
                        }))
                    );
                }
            );
        });
    }
    

    async findById(id: number): Promise<Meal> {
        return new Promise<Meal>((resolve, reject) => {
            this.db.get("SELECT * FROM Meals where id=$id",
                {$id: id},
                (error, row) => {
                    if(error) reject(error.message);
                    else resolve(row as Meal);
                }
            )
        })
    }

    async executeQuery(sql: string, params: any): Promise<Meal[]> {
        return new Promise<Meal[]>((resolve, reject) => {
            this.db.all<Meal>(sql, params, (err, rows) => {
                if (err == undefined) {
                    resolve(rows);
                } else {
                    reject(err);
                }
            })
        });
    }
}
import { SqlRepository } from "../sql_repository";
import { Dish } from "../../entity/dish";


export class DishRepository extends SqlRepository<Dish> {
    
    async delete(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                DELETE FROM Dishes
                WHERE id = ?;
            `, 
            id,
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

    async create(r: Dish): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.db.run('INSERT INTO Dishes (name, recipe, imageUrl, userId) VALUES (?, ?, ?, ?)', //db.run where no result needed
                [r.name, r.recipe, r.imageUrl, r.userId],
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

    async update(r: Dish): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                UPDATE Dishes
                SET name = ?, recipe = ?, imageUrl = ?
                WHERE id = ?;
            `, 
            [r.name, r.recipe, r.imageUrl, r.id],
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

    async getAll(limit: number, userId: number): Promise<Dish[]> { 
        return new Promise<Dish[]>((resolve, reject) => {
            this.db.all("SELECT * FROM Dishes WHERE userId=$userId limit $limit", //db.all returns all rows as a result
                {$userId: userId, $limit: limit},
                (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err.message);
                        return;
                    }
                    console.log("getall");
                    console.log(rows);
                    resolve(rows as Dish[]);
                }
            );
        });
    };

    async findSuggestedDishes(query: string, limit: number, userId: number): Promise<Dish[]> {
        return new Promise<Dish[]>((resolve, reject) => {
            this.db.all(`SELECT * FROM Dishes
                WHERE name LIKE $name AND userId=$userId
                LIMIT $limit ;`, //db.all returns all rows as a result
                {$name: `%${query}%`, $limit: limit, $userId: userId},
                (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err.message);
                        return;
                    }
                    console.log("getall");
                    console.log(rows);
                    resolve(rows as Dish[]);
                }
            );
        })
    };

    async findById(id: number): Promise<Dish> {
        return new Promise<Dish>((resolve, reject) => {
            this.db.get("SELECT * FROM Dishes where id=$id",
                {$id: id},
                (error, row) => {
                    if(error) reject(error.message);
                    else resolve(row as Dish);
                }
            )
        })
    };
}
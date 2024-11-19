import { SqlRepository } from "../sql_repository";
import { Ingredient } from "../../entity/ingredient";


export class IngredientRepository extends SqlRepository<Ingredient> {
    findById(id: number): Promise<Ingredient> {
        throw new Error("Method not implemented.");
    }

    async create(r: Ingredient): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.db.run('INSERT INTO Ingredients (productId, dishId, quantity) VALUES (?, ?, ?)', //db.run where no result needed
                [r.productId, r.dishId, r.quantity],
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

    async update(r: Ingredient): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                UPDATE Ingredients
                SET productId = ?, dishId = ?, quantity = ? 
                WHERE id = ?;
            `, 
            [r.productId, r.dishId, r.quantity, r.id],
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

    async getAll(limit: number): Promise<Ingredient[]> { 
        return new Promise<Ingredient[]>((resolve, reject) => {
            this.db.all("SELECT * FROM Ingredients limit $limit", //db.all returns all rows as a result
                {$limit: limit},
                (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err.message);
                        return;
                    }
                    console.log("getall");
                    console.log(rows);
                    resolve(rows as Ingredient[]);
                }
            );
        });
    };

    async findAllByDishId(id: number): Promise<Ingredient[]> {
        return new Promise<Ingredient[]>((resolve, reject) => {
            this.db.all("SELECT * FROM Ingredients where dishId=$id",
                {$id: id},
                (error, rows) => {
                    if(error) reject(error.message);
                    else resolve(rows as Ingredient[]);
                }
            )
        })
    }

    async findAllByProductId(id: number): Promise<Ingredient[]> {
        return new Promise<Ingredient[]>((resolve, reject) => {
            this.db.all("SELECT * FROM Ingredients where productId=$id",
                {$id: id},
                (error, rows) => {
                    if(error) reject(error.message);
                    else resolve(rows as Ingredient[]);
                }
            )
        })
    }


    async executeQuery(sql: string, params: any): Promise<Ingredient[]> {
        return new Promise<Ingredient[]>((resolve, reject) => {
            this.db.all<Ingredient>(sql, params, (err, rows) => {
                if (err == undefined) {
                    resolve(rows);
                } else {
                    reject(err);
                }
            })
        });
    }

    async delete(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`DELETE FROM Ingredients WHERE id = ?`, //db.run where no result needed
                id,
                function(err){
                    if (err) {
                        console.log(err.message);
                        reject();
                    }
                    resolve();
                    console.log(this.lastID);
                });
        });
    }
}
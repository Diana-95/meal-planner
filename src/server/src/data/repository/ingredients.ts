import { SqlRepository } from "../sql-repository";
import { Ingredient } from "../../entity/ingredient";

export type IngredientInput = Omit<Ingredient, 'product'> & { productId : number | null};

export class IngredientRepository extends SqlRepository<Ingredient, IngredientInput> {
    findById(id: number): Promise<Ingredient> {
        throw new Error("Method not implemented.");
    }

    async create(r: IngredientInput): Promise<number> {
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

    async update(r: IngredientInput): Promise<void> {
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
            this.db.all(
                `SELECT Ingredients.id AS id, 
                        Ingredients.dishId AS dishId, 
                        Ingredients.quantity AS quantity, 
                        Products.id AS productId, 
                        Products.name AS productName, 
                        Products.measure AS measure, 
                        Products.price AS price
                 FROM Ingredients 
                 INNER JOIN Products ON Ingredients.productId = Products.id
                 LIMIT $limit`,
                { $limit: limit },
                (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err.message);
                        return;
                    }
                    console.log("getall");
                    console.log(rows);
                    resolve(
                        rows.map((row: any) => ({
                            id: row.id,
                            product: {
                                id: row.productId,
                                name: row.productName,
                                measure: row.measure,
                                price: row.price,
                                userId: row.userId
                            },
                            dishId: row.dishId,
                            quantity: row.quantity
                        }))
                    );
                }
            );
            
        });
    };

    async findAllByDishId(id: number): Promise<Ingredient[]> {
        return new Promise<Ingredient[]>((resolve, reject) => {
            this.db.all(
                `SELECT Ingredients.id AS id, 
                        Ingredients.dishId AS dishId, 
                        Ingredients.quantity AS quantity,
                        Products.id AS productId, 
                        Products.name AS productName, 
                        Products.measure AS measure, 
                        Products.price AS price
                 FROM Ingredients 
                 INNER JOIN Products ON Ingredients.productId = Products.id
                 WHERE dishId = $id;`,
                { $id: id },
                (error, rows) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(
                            rows.map((row: any) => ({
                                id: row.id,
                                product: {
                                    id: row.productId,
                                    name: row.productName,
                                    measure: row.measure,
                                    price: row.price,
                                    userId: row.userId
                                },
                                dishId: row.dishId,
                                quantity: row.quantity
                            }))
                        );
                    }
                }
            );
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
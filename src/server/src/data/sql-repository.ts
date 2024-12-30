
import { QueryParams, Repository } from "./repository";
import knex, { Knex } from "knex";


export abstract class SqlRepository<T, I = T> implements Repository<T,I> {
    protected db: Knex;
    constructor() {
        this.db = knex({
            client: 'sqlite3',
            connection: {
                filename: 'meals.db' // Path to your SQLite file
            },
            useNullAsDefault: true // Recommended for SQLite to handle default values
        });
        
        this.db.raw('PRAGMA foreign_keys = ON');
        console.log('created');
    }
    abstract delete(id: number, userId:  number): Promise<number> ;
    abstract create(r: I): Promise<number> ;
    abstract update(r: I, userId:  number): Promise<void> ;
    abstract get(cursor: number|undefined, limit: number, query?: QueryParams): Promise<T[]> ;
    abstract getById(id: number, userId:  number): Promise<T> ; 
}
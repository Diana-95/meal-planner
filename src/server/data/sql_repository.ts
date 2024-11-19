import { Database } from "sqlite3";
import { Repository } from "./repository";

export abstract class SqlRepository<T> implements Repository<T> {
    protected db: Database;
    constructor() {
        this.db = new Database("meals.db");
        this.db.run('PRAGMA foreign_keys = ON;');
    }
    abstract delete(id: number): Promise<void> ;
    abstract create(r: T): Promise<number> ;
    abstract update(r: T): Promise<void> ;
    abstract getAll(limit: number): Promise<T[]> ;
    abstract findById(id: number): Promise<T> ;
}
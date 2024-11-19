
export interface Repository<T> {
    create(r: T): Promise<number>;
    update(r: T): Promise<void>;
    getAll(limit: number): Promise<T[]>;
    findById(id: number): Promise<T>;
    delete(id: number): Promise<void>;
}

export interface Repository<T, I=T> {
    create(r: I): Promise<number>;
    update(r: I): Promise<void>;
    getAll(limit: number): Promise<T[]>;
    findById(id: number): Promise<T>;
    delete(id: number): Promise<void>;
}
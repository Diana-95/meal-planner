
import { User } from "../../entity/user";
import { QueryParams } from "../repository";
import { SqlRepository } from "../sql-repository";




export class UserRepository extends SqlRepository<User> {
    get(cursor: number|undefined, limit: number, query?: QueryParams): Promise<User[]> {
        throw new Error("Method not implemented.");
    }

    delete(id: number): Promise<number> {
        return this.db('Users')
            .where('id', id)
            .del();
    }

    async create(r: User): Promise<number> {
        const [inserted] = await this.db('Users')
            .insert({
                username: r.username, 
                email: r.email, 
                password_hash: r.password_hash, 
                role: r.role ? r.role : 'user'
        })
            .returning("id");
        return typeof inserted === "number" ? inserted : inserted.id;
    }

    async update(r: User): Promise<void> {
        return await this.db('Users')
            .where('id', r.id)
            .update({
                'username': r.username,
                'email': r.email,
                'password_hash': r.password_hash
            });
    }

    async updatePart(r: Partial<User>): Promise<void> {
        const query = this.db('Users')
            .where('id', r.id);
        
        const updatedFields: Record<string, any> = {};
        if(r.username) updatedFields.username = r.username;
        if(r.email) updatedFields.email = r.email;
        if(r.password_hash) updatedFields.password_hash = r.password_hash;
        if (Object.keys(updatedFields).length > 0) {
            await query.update(updatedFields);
        }
    }

    getAll(limit: number): Promise<User[]> {
        throw new Error("Method not implemented.");
    }

    async getById(id: number): Promise<User> {
        return this.db('Users')
                    .select('*')
                    .where('id', id)
                    .first();
    }

    findOne(username: string): Promise<User> {
        return this.db('Users')
                    .select('*')
                    .where('username', username)
                    .first();
    }

    async isUserExists(username: string, email: string): Promise<boolean> {
        const res =  await this.db('Users')
                    .count('* as rows')
                    .where('username', username)
                    .orWhere('email', email);
        console.log(res);
        return Number(res[0].rows) > 0;
    }
}
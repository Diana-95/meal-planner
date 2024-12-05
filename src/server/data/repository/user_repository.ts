
import { User } from "../../entity/user";
import { SqlRepository } from "../sql_repository";




export class UserRepository extends SqlRepository<User> {
    delete(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run('DELETE FROM Meals WHERE id = ?', [id],
                function( error ){
                    if (error) {
                        console.log(error?.message);
                        reject(error?.message);
                    }
                    else if(this.lastID !== undefined) resolve();
                }
            )
        })
    }
    create(r: User): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.db.run('INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)', //db.run where no result needed
                [r.username, r.email, r.password_hash, r.role ? r.role : 'user'],
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
    update(r: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                UPDATE Users
                SET username = ?, email = ?, password_hash = ?
                WHERE id = ?;
            `, 
            [r.username, r.email, r.password_hash, r.id],
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
    getAll(limit: number): Promise<User[]> {
        throw new Error("Method not implemented.");
    }
    findById(id: number): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            this.db.get('SELECT * FROM Users WHERE id=$id', //db.run where no result needed
                {$id: id},
                function(err, row){
                    if (err) {
                        console.log(err.message);
                        reject(err.message);
                    }
                    else resolve(row as User);
                });
        });
    }

    findOne(username: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            this.db.get("SELECT * FROM Users where username=$username",
                {$username: username},
                (error, row) => {
                    if(error) reject(error.message);
                    else resolve(row as User);
                }
            )
        })
    }

    isUserExists(username: string, email: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
        this.db.get(`SELECT COUNT(*) AS total_rows 
                    FROM Users
                    where username=$username or email=$email`,
                {$username: username, $email: email},
                (error, {total_rows}) => {
                    if(error) reject(error.message);
                    else resolve(total_rows > 0);
                }
            )
        })
    }
    
   
}
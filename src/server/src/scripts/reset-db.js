import { readFileSync } from "fs";
import { Database } from "sqlite3";

const db = new Database("meals.db");

db.exec(readFileSync("meals.sql").toString(), err => {
    if (err != undefined) throw err;
})
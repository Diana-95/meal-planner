// test-utils/dbSetup.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function setupTestDB() {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });

  // Create schema
  await db.exec(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL
    );
  `);

  // Seed data
  await db.run(`INSERT INTO products (name, price) VALUES (?, ?)`, ['Pizza', 9.99]);
  await db.run(`INSERT INTO products (name, price) VALUES (?, ?)`, ['Burger', 7.5]);

  return db;
}

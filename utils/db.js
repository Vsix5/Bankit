import { Pool } from 'pg';
import 'dotenv/config';
import { dbContext } from './db-context.js';
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD
});

export default {
  async query(text, params) {
  
    const transactionClient = dbContext.getStore();

    if(transactionClient) {
      return transactionClient.query(text, params);
    }

    return pool.query(text, params);
  },

  async connect() {
    return pool.connect();
  },

  async end() {
    return pool.end();
  }
};


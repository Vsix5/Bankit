import { beforeEach, afterEach } from 'vitest';
import db from './utils/db.js';
import { dbContext } from './utils/db-context.js';

let client;

beforeEach(async () => {
  client = await db.connect();

  await client.query('BEGIN');

  dbContext.enterWith(client);

})

afterEach(async () => {
  if(client) {
    try{
      await client.query('ROLLBACK');
    }
    finally {
      client.release();
      client = null;
    }
  }
})
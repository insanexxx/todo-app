import knex, { Knex } from 'knex';
import config from '../knexfile';
import { env } from './env';

const db: Knex = knex({
  client: 'pg',
  connection: env.DATABASE_URL
});
export default db;

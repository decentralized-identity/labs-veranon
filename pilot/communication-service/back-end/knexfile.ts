import type { Knex } from 'knex';

const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: './users.db',
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './migrations',
  }
};

export default config;
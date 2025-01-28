import type { Knex } from 'knex';

const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite',
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    tableName: 'migrations',
    directory: './migrations',
  }
};

export default config;
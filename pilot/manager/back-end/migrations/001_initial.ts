import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('identity_data', (table) => {
    table.increments('id').primary();
    table.string('identity_url').notNullable().unique();
    table.string('current_identity_commitment').notNullable();
    table.string('new_identity_commitment').nullable();
    table.boolean('is_processed').defaultTo(false);
    table.timestamp('processed_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('identity_data');
}
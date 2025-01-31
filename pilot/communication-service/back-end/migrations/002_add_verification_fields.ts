import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('users', (table) => {
        table.boolean('verified').defaultTo(false);
        table.timestamp('verificationTime').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('users', (table) => {
        table.dropColumn('verified');
        table.dropColumn('verificationTime');
    });
} 
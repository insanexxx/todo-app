import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.date('due_date').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.enu('priority', ['HIGH','MEDIUM','LOW'], { useNative: true, enumName: 'priority_enum' }).notNullable();
    table.enu('status', ['TODO','IN_PROGRESS','DONE','CANCELED'], { useNative: true, enumName: 'status_enum' }).notNullable().defaultTo('TODO');
    table.integer('creator_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('assignee_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
  });
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at DESC)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_tasks_creator_id ON tasks(creator_id)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tasks');
  await knex.raw('DROP TYPE IF EXISTS priority_enum');
  await knex.raw('DROP TYPE IF EXISTS status_enum');
}

import type { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  await knex('tasks').del();
  await knex('users').del();

  const hash = async (password: string) => await bcrypt.hash(password, 10);

  const [boss] = await knex('users').insert({
    first_name: 'Иван', last_name: 'Иванов', patronymic: 'Иванович',
    login: 'boss', password_hash: await hash('boss123')
  }).returning('*');

  const [user1] = await knex('users').insert({
    first_name: 'Петр', last_name: 'Петров', patronymic: 'Петрович',
    login: 'user1', password_hash: await hash('user123'),
    manager_id: boss.id
  }).returning('*');

  const [user2] = await knex('users').insert({
    first_name: 'Сергей', last_name: 'Сергеев', patronymic: 'Сергеевич',
    login: 'user2', password_hash: await hash('user123'),
    manager_id: boss.id
  }).returning('*');

  await knex('tasks').insert([
    {
      title: 'Сделать отчет',
      description: 'За неделю',
      due_date: new Date(Date.now() + 2*24*3600*1000),
      priority: 'HIGH',
      status: 'TODO',
      creator_id: boss.id,
      assignee_id: user1.id
    },
    {
      title: 'Позвонить клиенту',
      description: 'Уточнить условия',
      due_date: new Date(Date.now() + 1*24*3600*1000),
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      creator_id: boss.id,
      assignee_id: user2.id
    }
  ]);
}

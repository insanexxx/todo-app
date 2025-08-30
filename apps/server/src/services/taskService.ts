import db from '../db';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

class TaskService {
    async getSubsIds(managerId: number): Promise<number[]> {
        const rows = await db('users').where({ manager_id: managerId }).select('id');
        return rows.map((r) => r.id);
    }

    async getVisibleTasks(userId: number) {
        const subs = await this.getSubsIds(userId);
        return db('tasks')
            .leftJoin('users as assignee', 'assignee.id', 'tasks.assignee_id')
            .leftJoin('users as creator', 'creator.id', 'tasks.creator_id')
            .where((b) => {
                b.where('tasks.creator_id', userId).orWhere('tasks.assignee_id', userId);
                if (subs.length) b.orWhereIn('tasks.assignee_id', subs);
            })
            .orderBy('tasks.updated_at', 'desc')
            .select(
                'tasks.*',
                db.raw(
                    "json_build_object('id', assignee.id, 'firstName', assignee.first_name, 'lastName', assignee.last_name, 'login', assignee.login) as assignee"
                ),
                db.raw(
                    "json_build_object('id', creator.id, 'firstName', creator.first_name, 'lastName', creator.last_name, 'login', creator.login) as creator"
                )
            );
    }

    async createTask(
        userId: number,
        dto: { title: string; description?: string; dueDate: string; priority: Priority; assigneeId: number }
    ) {
        const subs = await this.getSubsIds(userId);
        if (!subs.includes(dto.assigneeId)) {
            return { error: 'ASSIGNEE_NOT_SUBORDINATE' as const };
        }
        const [task] = await db('tasks')
            .insert({
                title: dto.title,
                description: dto.description,
                due_date: dto.dueDate,
                priority: dto.priority,
                creator_id: userId,
                assignee_id: dto.assigneeId
            })
            .returning('*');
        return { task };
    }

    async canEditAttributes(userId: number, taskId: number) {
        const task = await db('tasks').where({ id: taskId }).first();
        if (!task) return { ok: false, error: 'TASK_NOT_FOUND' as const };

        const me = await db('users').where({ id: userId }).first();
        if (me?.manager_id && task.creator_id === me.manager_id) {
            return { ok: false, error: 'BOSS_TASK' as const };
        }
        if (task.creator_id !== userId) {
            return { ok: false, error: 'FORBIDDEN' as const };
        }
        return { ok: true, task };
    }

    async updateAttributes(taskId: number, patch: any) {
        const [updated] = await db('tasks')
            .where({ id: taskId })
            .update({ ...patch, updated_at: db.fn.now() })
            .returning('*');
        return updated;
    }

    async updateStatus(userId: number, taskId: number, status: Status) {
        const task = await db('tasks').where({ id: taskId }).first();
        if (!task) return { error: 'TASK_NOT_FOUND' as const };
        if (![task.creator_id, task.assignee_id].includes(userId)) return { error: 'FORBIDDEN' as const };
        const [updated] = await db('tasks')
            .where({ id: taskId })
            .update({ status, updated_at: db.fn.now() })
            .returning('*');
        return { task: updated };
    }

    async remove(userId: number, taskId: number) {
        const task = await db('tasks').where({ id: taskId }).first();
        if (!task) return { error: 'TASK_NOT_FOUND' as const };
        if (task.creator_id !== userId) return { error: 'FORBIDDEN' as const };
        await db('tasks').where({ id: taskId }).del();
        return { ok: true };
    }
}

export default new TaskService();

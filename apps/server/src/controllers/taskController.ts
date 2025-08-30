import { Request, Response, NextFunction } from 'express';
import TaskService, { Priority, Status } from '../services/taskService';
import { EnumPriority, EnumStatus } from '../types/task';

class TaskController {
    getTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tasks = await TaskService.getVisibleTasks(req.user!.id);
            res.json(tasks);
        } catch (e) { next(e); }
    };

    createTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const { title, description, dueDate, priority, assigneeId } = req.body as {
                title: string; description?: string; dueDate: string; priority: EnumPriority | Priority; assigneeId: number;
            };
            const result = await TaskService.createTask(userId, {
                title, description, dueDate, priority: priority as Priority, assigneeId
            });
            if ('error' in result) return res.status(403).json({ error: result.error });
            res.status(201).json(result.task);
        } catch (e) { next(e); }
    };

    updateTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const id = Number(req.params.id);

            const can = await TaskService.canEditAttributes(userId, id);
            if (!can.ok) return res.status(can.error === 'TASK_NOT_FOUND' ? 404 : 403).json({ error: can.error });

            const body = req.body as { title?: string; description?: string; dueDate?: string; priority?: EnumPriority | Priority; assigneeId?: number; };
            const patch: any = {};
            if (body.title !== undefined) patch.title = body.title;
            if (body.description !== undefined) patch.description = body.description;
            if (body.dueDate !== undefined) patch.due_date = body.dueDate;
            if (body.priority !== undefined) patch.priority = body.priority as Priority;
            if (body.assigneeId !== undefined) {
                const subs = await TaskService.getSubsIds(userId);
                if (!subs.includes(body.assigneeId)) return res.status(403).json({ error: 'ASSIGNEE_NOT_SUBORDINATE' });
                patch.assignee_id = body.assigneeId;
            }

            const updated = await TaskService.updateAttributes(id, patch);
            if (!updated) return res.status(404).json({ error: 'TASK_NOT_FOUND' });
            res.json(updated);
        } catch (e) { next(e); }
    };

    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const id = Number(req.params.id);
            const { status } = req.body as { status: EnumStatus | Status };
            const result = await TaskService.updateStatus(userId, id, status as Status);
            if ('error' in result) return res.status(result.error === 'TASK_NOT_FOUND' ? 404 : 403).json({ error: result.error });
            res.json(result.task);
        } catch (e) { next(e); }
    };

    deleteTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const id = Number(req.params.id);
            const result = await TaskService.remove(userId, id);
            if ('error' in result) return res.status(result.error === 'TASK_NOT_FOUND' ? 404 : 403).json({ error: result.error });
            res.status(204).end();
        } catch (e) { next(e); }
    };
}

export default new TaskController();

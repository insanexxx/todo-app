import { Request, Response, NextFunction } from 'express';
import db from '../db';

class UserController {
    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const me = await db('users')
                .where({ id: req.user!.id })
                .first()
                .select('id', 'login', 'first_name', 'last_name', 'manager_id');
            res.json(me);
        } catch (error) {
            next(error);
        }
    }

    async getSubordinates(req: Request, res: Response, next: NextFunction) {
        try {
            const subs = await db('users')
                .where({ manager_id: req.user!.id })
                .select('id', 'first_name', 'last_name', 'login');
            res.json(subs);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();

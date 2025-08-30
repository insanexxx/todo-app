import { Request, response, Response } from 'express';
import db from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../env';

class AuthController {
    async tryLogin(req: Request, res: Response) {
        try {
            const { login, password } = req.body as { login: string, password: string };

            const user = await db('users').where({ login }).first();
            if (!user) {
                return res.status(404).json({ error: 'USER_NOT_FOUND' });
            }

            const ok = await bcrypt.compare(password, user.password_hash);
            if (!ok) {
                return res.status(401).json({ error: 'WRONG_PASSWORD' });
            }

            const token = jwt.sign({ id: user.id, login: user.login, managerId: user.manager_id ?? null }, env.JWT_SECRET, { expiresIn: '2d' });
            res.json({ token, user: { id: user.id, login: user.login, firstName: user.first_name, lastName: user.last_name, managerId: user.manager_id } });
        } catch (error) {
            res.status(500).json({ message: "get /login Error", error });
        }
    }
}

export default new AuthController();
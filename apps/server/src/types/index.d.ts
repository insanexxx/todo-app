import 'express';

declare global {
    namespace Express {
        interface UserPayload {
            id: number;
            login: string;
            managerId: number | null;
        }
        interface Request {
            user?: UserPayload;
        }
    }
}
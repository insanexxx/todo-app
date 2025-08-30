import { Router } from 'express';
import { requireAuth } from '../auth';
import UserController from '../controllers/userController';
import { asyncHandler } from '../utils/asyncHandler';

const userRouter = Router();
userRouter.use(requireAuth);

userRouter.get('/me', asyncHandler(UserController.getMe));
userRouter.get('/subordinates', asyncHandler(UserController.getSubordinates));

export default userRouter;

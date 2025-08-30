import { Router } from 'express';
import { requireAuth } from '../auth';
import TaskController from '../controllers/taskController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(TaskController.getTasks));
router.post('/', asyncHandler(TaskController.createTask));
router.patch('/:id', asyncHandler(TaskController.updateTask));
router.patch('/:id/status', asyncHandler(TaskController.updateStatus));
router.delete('/:id', asyncHandler(TaskController.deleteTask));

export default router;

import { Router } from 'express';
import authMiddleware from '../middlewares/Users';
import { handleLoggedInUserNotification, handleMarkNotificationAsRead } from '../controllers/Notifications';

const router = Router();

// Retrieve notifications for the logged-in user.
router.get('/', authMiddleware, handleLoggedInUserNotification);

// Marking notifications as read
router.post('/mark-read', authMiddleware, handleMarkNotificationAsRead);

export default router;

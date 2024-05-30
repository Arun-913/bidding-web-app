import 'dotenv/config';
import { Router, Request, Response } from 'express';
import authMiddleware from '../middlewares/Users';
import { handleExistingUser, handleGetUserProfile, handleNewUser, handleResetPassword } from '../controllers/Users';
import { passwordResetLimiter } from '../middlewares/ResetPassword';

const router = Router();

// handle new user
router.post('/register', handleNewUser);

// handle existing user
router.post('/login', handleExistingUser);

// get the logged in user profile
router.get('/profile', authMiddleware, handleGetUserProfile);

router.get('/password/reset', passwordResetLimiter, handleResetPassword);

export default router;
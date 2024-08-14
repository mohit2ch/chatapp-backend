import express from 'express';
import { registerUser, loginUser, allUsers } from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.route('/').get(protect, allUsers);

export default router;
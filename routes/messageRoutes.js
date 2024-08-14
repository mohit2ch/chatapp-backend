import { sendMessage, fetchMessages } from "../controllers/messageController.js";
import express from 'express';
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route('/:chatId').post(protect, sendMessage).get(protect, fetchMessages);

export default router;

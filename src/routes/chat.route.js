import express from 'express';

import { protectRoute } from '../middleware/auth.middleware.js';
import { getChatUsers, getChatMessages, sendChatMessage } from '../controllers/chat.controller.js';
import { fileUpload } from '../middleware/upload.middleware.js';

const chatRoutes = express.Router();

chatRoutes.get('/users', protectRoute, getChatUsers);
chatRoutes.get('/:contactId', protectRoute, getChatMessages);
chatRoutes.post('/send-message/:contactId', protectRoute, fileUpload.single('image'), sendChatMessage);

export { chatRoutes };

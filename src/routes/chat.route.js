import express from 'express';

import { protectRoute } from '../middleware/auth.middleware.js';
import { getChatUsers, getChatMessages } from '../controllers/chat.controller.js';

const chatRoutes = express.Router();

chatRoutes.get('/users', protectRoute, getChatUsers);
chatRoutes.get('/:contactId', protectRoute, getChatMessages);

export { chatRoutes };

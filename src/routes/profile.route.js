import express from 'express';

import { updateProfile } from '../controllers/profile.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const profileRoutes = express.Router();

profileRoutes.put('/update-profile', protectRoute, updateProfile);

export { profileRoutes };

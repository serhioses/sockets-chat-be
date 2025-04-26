import express from 'express';

import { updateProfile } from '../controllers/profile.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { fileUpload } from '../middleware/upload.middleware.js';

const profileRoutes = express.Router();

profileRoutes.put('/update-profile', protectRoute, fileUpload.single('avatar'), updateProfile);

export { profileRoutes };

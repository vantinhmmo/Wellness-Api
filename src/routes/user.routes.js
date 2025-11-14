import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.route('/profile')
    .get(authMiddleware, getUserProfile)
    .put(authMiddleware, updateUserProfile);

export default router;

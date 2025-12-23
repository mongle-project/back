import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 회원가입
// POST /api/users
router.post("/", userController.registerUser);

// 내 정보 조회
// GET /api/users/me
router.get("/me", authMiddleware, userController.getMyProfile);

// 비밀번호 재설정 (비로그인)
// PATCH /api/users/me/password
router.patch("/me/password", userController.resetPassword);

export default router;

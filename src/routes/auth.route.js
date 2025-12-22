import express from "express";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

// 회원가입
// POST /api/auth/register
router.post("/register", authController.registerUser);

// 로그인
// POST /api/auth/login
router.post("/login", authController.loginUser);

// 로그아웃
// POST /api/auth/logout
router.post("/logout", authController.logoutUser);

// 토큰 갱신
// POST /api/auth/refresh
router.post("/refresh", authController.refreshToken);

export default router;

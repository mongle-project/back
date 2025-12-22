import express from "express";
import * as userController from "../controllers/user.controller.js";

const router = express.Router();

// 회원가입
// POST /api/users
router.post("/", userController.registerUser);

// TODO: 추후 사용자 조회/수정/삭제 라우트 추가 가능
// router.get('/', userController.getUsers);
// router.get('/:id', userController.getUserById);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

export default router;

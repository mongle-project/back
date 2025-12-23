import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import * as petController from "../controllers/pet.controller.js";

const router = express.Router();

// 반려동물 프로필 등록 (이미지 업로드 포함)
router.post("/", authMiddleware, upload.single("imageFile"), petController.createPetProfile);

// 내 반려동물 목록 조회
router.get("/", authMiddleware, petController.getPetList);

// 반려동물 상세 조회
router.get("/:petId", authMiddleware, petController.getPetDetail);

// 반려동물 프로필 수정 (이미지 업로드 포함)
router.put("/:petId", authMiddleware, upload.single("imageFile"), petController.updatePetProfile);

// 반려동물 프로필 삭제
router.delete("/:petId", authMiddleware, petController.deletePetProfile);

export default router;

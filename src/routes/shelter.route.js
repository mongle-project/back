import express from "express";
import * as shelterController from "../controllers/shelter.controller.js";

const router = express.Router();

// GET /api/shelters - 보호소 목록 조회
// Query: ?lat=37.5&lng=127.0&radius=2000 (위치 기반)
//        또는 ?keyword=강남 (키워드 검색)
router.get("/", shelterController.getShelters);

// GET /api/shelters/:shelterId - 보호소 상세 조회
router.get("/:shelterId", shelterController.getShelterById);

export default router;
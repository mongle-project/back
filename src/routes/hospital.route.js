import express from "express";
import * as hospitalController from "../controllers/hospital.controller.js";

const router = express.Router();

// GET /api/hospitals - 병원 목록 조회
// Query: ?lat=37.5&lng=127.0&radius=2000 (위치 기반)
//        또는 ?city=서울&district=강남 (도시 기반)
router.get("/", hospitalController.getHospitals);

// GET /api/hospitals/:hospitalId - 병원 상세 조회
router.get("/:hospitalId", hospitalController.getHospitalById);

export default router;
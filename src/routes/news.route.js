import express from "express";
import * as newsController from "../controllers/news.controller.js";

const router = express.Router();

// GET /api/news - 뉴스 목록 조회
router.get("/", newsController.getNews);

// POST /api/news/refresh - 캐시 강제 갱신
router.post("/refresh", newsController.refreshNews);

// GET /api/news/status - 캐시 상태 조회 (디버깅용)
router.get("/status", newsController.getCacheStatus);

export default router;

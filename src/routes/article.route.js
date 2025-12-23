import express from "express";
import * as articleController from "../controllers/article.controller.js";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

// 게시글 작성
router.post("/", authMiddleware, upload.single("imageFile"), articleController.createArticle);

// 게시글 목록 조회
router.get("/", optionalAuthMiddleware, articleController.getArticles);

// 게시글 상세 조회
router.get("/:articleId", optionalAuthMiddleware, articleController.getArticleDetail);

// 게시글 수정
router.patch("/:articleId", authMiddleware, upload.single("imageFile"), articleController.updateArticle);

// 게시글 삭제
router.delete("/:articleId", authMiddleware, articleController.deleteArticle);

// 좋아요 토글
router.post("/:articleId/likes", authMiddleware, articleController.toggleLike);

// 신고
router.post("/:articleId/reports", authMiddleware, articleController.reportArticle);

// 북마크 토글
router.post("/:articleId/bookmarks", authMiddleware, articleController.toggleBookmark);

export default router;

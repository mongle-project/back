import express from "express";
import * as calendarController from "../controllers/calendar.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 모든 캘린더 라우트는 인증 필요
router.use(authMiddleware);

// 일정 등록
// POST /api/calendar-events
router.post("/", calendarController.createEvent);

// 월별 일정 조회
// GET /api/calendar-events?year=2025&month=12
router.get("/", calendarController.getEventsByMonth);

// 일정 상세 조회
// GET /api/calendar-events/:eventId
router.get("/:eventId", calendarController.getEventDetail);

// 일정 수정
// PATCH /api/calendar-events/:eventId
router.patch("/:eventId", calendarController.updateEvent);

// 일정 삭제
// DELETE /api/calendar-events/:eventId
router.delete("/:eventId", calendarController.deleteEvent);

export default router;

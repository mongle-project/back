// src/routes/index.js
import express from 'express';
import authRouter from './auth.route.js';
import userRouter from './user.route.js';
import petRouter from './pet.route.js';
import articleRouter from './article.route.js';
import hospitalRouter from './hospital.route.js';
import shelterRouter from './shelter.route.js';
import calendarRouter from './calendar.route.js';
import newsRouter from './news.route.js';
import healthRouter from './health.route.js';

const router = express.Router();

// 여기서 경로를 통합 관리
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/pets', petRouter);
router.use('/articles', articleRouter);
router.use('/hospitals', hospitalRouter); // 병원 관련
router.use('/shelters', shelterRouter); // 보호소 관련
router.use('/calendar-events', calendarRouter);
router.use('/news', newsRouter);
router.use('/health', healthRouter); // AI 건강 상담

export default router;
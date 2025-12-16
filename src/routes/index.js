// src/routes/index.js
import express from 'express';
import authRouter from './auth.route.js';
import userRouter from './user.route.js';
import petRouter from './pet.route.js';
import articleRouter from './article.route.js';
import locationRouter from './location.route.js';
import calendarRouter from './calendar.route.js';
import newsRouter from './news.route.js';

const router = express.Router();

// 여기서 경로를 통합 관리
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/pets', petRouter);
router.use('/articles', articleRouter);
router.use('/hospitals', locationRouter); // 병원, 보호소 관련
router.use('/calendar-events', calendarRouter);
router.use('/news', newsRouter);

export default router;
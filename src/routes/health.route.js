import express from 'express';
import * as healthController from '../controllers/health.controller.js';

const router = express.Router();

// POST /api/health/consult - AI 건강 상담
router.post('/consult', healthController.consultPetHealth);

export default router;

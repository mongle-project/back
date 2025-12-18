import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import calenderController from "../controllers/calendar.controller.js";

const router = express.Router();

router.post("/", authMiddleware, calenderController.createEvent);
router.get("/:petId", authMiddleware, calenderController.getPetEvents);
router.delete("/:eventId", authMiddleware, calenderController.deleteEvent);

export default router;

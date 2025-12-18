import express from "express";
import {
  createPet,
  getMyPets,
  updatePet,
  deletePet,
} from "../controllers/pet.controller.js";

const router = express.Router();

router.post("/", createPet);
router.get("/", getMyPets);
router.patch("/:petid", updatePet);
router.delete("/:petid", deletePet);

export default router;

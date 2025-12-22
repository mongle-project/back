import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import articleController from "../controllers/article.controller.js";

const router = express.Router();

//create article
router.post("/", articleController.createArticle);

//get article
router.get("/", articleController.getArticles);

//update article
router.patch("/:articleid", articleController.updateArticle);

//delete article
router.delete("/:articleid", articleController.deleteArticle);

//article report
router.post("/:articleid/report", articleController.reportArticle);

// TODO: Add a route related to the post
// router.get('/', ...);

// router.post('/', ...);

// router.get('/:id', ...);

// router.put('/:id', ...);

// router.delete('/:id', ...);

export default router;

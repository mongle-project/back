import articleModel from "../models/article.model.js";

// Create a new article
const createArticle = async ({ userId, title, content, category, img_url }) => {
  if (!title || !content || !category) {
    throw new Error("Missing required fields");
  }
  const articleId = await articleModel.createArticle({
    userId,
    title,
    content,
    category,
    img_url,
  });
  return articleId;
};
//get articles

const getArticles = async () => {
  const articles = await articleModel.getArticles();
  return articles;
};

//get article by id

const getArticleById = async (articleId) => {
  if (!articleId) {
    throw new Error("Article ID is required");
  }
  const article = await articleModel.getArticleById(articleId);

  if (!article) {
    throw new Error("Article not found");
  }
  return article;
};

//update article
const updateArticle = async (articleId, userId, updateData) => {
  if (articleId) {
    throw new Error("Article ID is required");
  }
  const article = await articleModel.getArticleById(articleId);
  if (!article) {
    throw new Error("Article not found");
  }
  if (article.userId !== userId) {
    throw new Error("Unauthorized");
  }
  await articleModel.updateArticle(articleId, updateData);
};

//delete article
const deleteArticle = async (articleId, userId) => {
  if (!articleId) {
    throw new Error("Article ID is required");
  }
  const article = await articleModel.getArticleById(articleId);
  if (!article) {
    throw new Error("Article not found");
  }
  if (article.userId !== userId) {
    throw new Error("Unauthorized");
  }
  await articleModel.deleteArticle(articleId);
};

//report article
const reportArticle = async (articleId, userId, reason) => {};

export default {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  reportArticle,
};

import articles from "../services/article.service.js";

const createArticle = async (req, res) => {
  try {
    // const { title, content, category, img_url } = req.body;
    // const userId = req.user.id; // Assuming user ID is available in req.user

    // const newArticle = await articles.createArticle({
    //   userId,
    //   title,
    //   content,
    //   category,
    //   img_url,
    // });

    res.status(200).json({ messsage: "success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getArticles = async (req, res) => {
  try {
    // const { category, page = 1, limit = 10 } = req.query;
    // const articlesList = await articles.getArticles(category, page, limit);
    // res.status(200).json({ articles: articlesList });
    res.status(200).json({ messsage: "success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getArticleById = async (req, res) => {
  try {
    // const articleId = req.params.id;
    // const article = await articles.getArticleById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ messsage: "success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateArticle = async (req, res) => {
  try {
    // const articleId = req.params.id;
    // const { title, content, category, img_url } = req.body;
    // const updatedArticle = await articles.updateArticle(articleId, {
    //   title,
    //   content,
    //   category,
    //   img_url,
    // });
    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ messsage: "success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteArticle = async (req, res) => {
  try {
    // const articleId = req.params.id;
    // const deleted = await articles.deleteArticle(articleId);
    if (!deleted) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ messsage: "success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
const reportArticle = async (req, res) => {};

export default {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  reportArticle,
};

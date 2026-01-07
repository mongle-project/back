import * as articleService from "../services/article.service.js";

/**
 * 게시글 작성
 * POST /api/articles
 */
export const createArticle = async (req, res) => {
  try {
    const userId = req.user.userId; // authMiddleware에서 주입된 userId
    const { title, content, category } = req.body;
    const imageFile = req.file; // multer upload.single("imageFile")

    console.log(category);

    // 필수 필드 검증
    if (!title || !content) {
      return res.status(400).json({
        message: "필수 항목을 모두 입력해주세요. (title, content)",
      });
    }

    const articleData = {
      title: title.trim(),
      content: content.trim(),
      category: category?.trim() || null,
    };

    const createdArticle = await articleService.createArticle(
      userId,
      articleData,
      imageFile
    );

    res.status(201).json({
      message: "게시글이 작성되었습니다.",
      data: createdArticle,
    });
  } catch (error) {
    console.error("게시글 작성 오류:", error);

    // 유효성 검증 에러
    if (error.message.includes("유효하지 않은")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 게시글 목록 조회
 * GET /api/articles
 */
export const getArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const sort = req.query.sort || "latest"; // latest, popular, comment
    const userId = req.user?.userId; // optionalAuthMiddleware (있을 수도, 없을 수도)

    const result = await articleService.getArticles(
      limit,
      offset,
      userId,
      sort
    );

    res.status(200).json({
      message: "게시글 목록 조회 성공",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("게시글 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 내가 작성한 게시글 목록 조회
 * GET /api/articles/me/my-articles
 */
export const getMyArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const userId = req.user.userId; // authMiddleware로 보호됨

    const result = await articleService.getMyArticles(limit, offset, userId);

    res.status(200).json({
      message: "내 게시글 목록 조회 성공",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("내 게시글 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 게시글 상세 조회
 * GET /api/articles/:articleId
 */
export const getArticleDetail = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user?.userId;

    // articleId 숫자 검증
    if (!articleId || isNaN(parseInt(articleId))) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 게시글 ID입니다." });
    }

    const article = await articleService.getArticleById(
      parseInt(articleId),
      userId
    );

    res.status(200).json({
      message: "게시글 상세 조회 성공",
      data: article,
    });
  } catch (error) {
    console.error("게시글 상세 조회 오류:", error);

    // Not found 에러
    if (error.message.includes("찾을 수 없습니다")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 게시글 수정
 * PATCH /api/articles/:articleId
 */
export const updateArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;
    const { title, content, category } = req.body;
    const imageFile = req.file;

    // articleId 숫자 검증
    if (!articleId || isNaN(parseInt(articleId))) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 게시글 ID입니다." });
    }

    // 업데이트할 필드만 객체에 포함
    const updates = {};
    if (title) updates.title = title.trim();
    if (content) updates.content = content.trim();
    if (category) updates.category = category.trim();

    const updatedArticle = await articleService.updateArticle(
      parseInt(articleId),
      userId,
      updates,
      imageFile
    );

    res.status(200).json({
      message: "게시글이 수정되었습니다.",
      data: updatedArticle,
    });
  } catch (error) {
    console.error("게시글 수정 오류:", error);

    // Ownership 에러
    if (error.message.includes("권한이 없습니다")) {
      return res.status(403).json({ message: error.message });
    }

    // Not found 에러
    if (error.message.includes("찾을 수 없습니다")) {
      return res.status(404).json({ message: error.message });
    }

    // 유효성 검증 에러
    if (error.message.includes("유효하지 않은")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 게시글 삭제
 * DELETE /api/articles/:articleId
 */
export const deleteArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;

    // articleId 숫자 검증
    if (!articleId || isNaN(parseInt(articleId))) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 게시글 ID입니다." });
    }

    await articleService.deleteArticle(parseInt(articleId), userId);

    res.status(200).json({
      message: "게시글이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("게시글 삭제 오류:", error);

    // Ownership 에러
    if (error.message.includes("권한이 없습니다")) {
      return res.status(403).json({ message: error.message });
    }

    // Not found 에러
    if (error.message.includes("찾을 수 없습니다")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 좋아요 토글
 * POST /api/articles/:articleId/likes
 */
export const toggleLike = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;

    // articleId 숫자 검증
    if (!articleId || isNaN(parseInt(articleId))) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 게시글 ID입니다." });
    }

    const result = await articleService.toggleLike(parseInt(articleId), userId);

    const message =
      result.action === "added"
        ? "좋아요가 추가되었습니다."
        : "좋아요가 취소되었습니다.";

    res.status(200).json({
      message,
      action: result.action,
      likesCount: result.likesCount,
    });
  } catch (error) {
    console.error("좋아요 토글 오류:", error);

    // Not found 에러
    if (error.message.includes("찾을 수 없습니다")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 신고
 * POST /api/articles/:articleId/reports
 */
export const reportArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;

    // articleId 숫자 검증
    if (!articleId || isNaN(parseInt(articleId))) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 게시글 ID입니다." });
    }

    await articleService.reportArticle(parseInt(articleId), userId);

    res.status(200).json({
      message: "게시글이 신고되었습니다.",
    });
  } catch (error) {
    console.error("게시글 신고 오류:", error);

    // 이미 신고한 경우
    if (error.message.includes("이미 신고한")) {
      return res.status(400).json({ message: error.message });
    }

    // Not found 에러
    if (error.message.includes("찾을 수 없습니다")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 북마크 토글
 * POST /api/articles/:articleId/bookmarks
 */
export const toggleBookmark = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;

    // articleId 숫자 검증
    if (!articleId || isNaN(parseInt(articleId))) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 게시글 ID입니다." });
    }

    const result = await articleService.toggleBookmark(
      parseInt(articleId),
      userId
    );

    const message =
      result.action === "added"
        ? "북마크가 추가되었습니다."
        : "북마크가 취소되었습니다.";

    res.status(200).json({
      message,
      action: result.action,
    });
  } catch (error) {
    console.error("북마크 토글 오류:", error);

    // Not found 에러
    if (error.message.includes("찾을 수 없습니다")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 북마크한 게시글 목록 조회
 * GET /api/articles/me/bookmarked
 */
export const getBookmarkedArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const userId = req.user.userId; // authMiddleware로 보호됨

    const result = await articleService.getBookmarkedArticles(
      limit,
      offset,
      userId
    );

    res.status(200).json({
      message: "북마크한 게시글 목록 조회 성공",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("북마크한 게시글 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

import pool from "../config/db.config.js";

/**
 * 게시글 생성
 */
export const insertArticle = async ({
  userId,
  title,
  content,
  category,
  imgUrl,
}) => {
  const query = `
    INSERT INTO articles (user_id, title, content, category, img_url)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [
    userId,
    title,
    content,
    category,
    imgUrl,
  ]);
  return result.insertId;
};

/**
 * 게시글 목록 조회 (기본, 통계 없음)
 */
export const findArticles = async (limit, offset) => {
  const query = `
    SELECT id, user_id, title, content, category, img_url, created_at, updated_at
    FROM articles
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.query(query, [limit, offset]);
  return rows;
};

/**
 * 전체 게시글 수 조회
 */
export const countArticles = async () => {
  const query = `SELECT COUNT(*) as count FROM articles`;
  const [rows] = await pool.query(query);
  return rows[0].count;
};

/**
 * 내가 작성한 게시글 수 조회
 */
export const countMyArticles = async (userId) => {
  const query = `SELECT COUNT(*) as count FROM articles WHERE user_id = ?`;
  const [rows] = await pool.query(query, [userId]);
  return rows[0].count;
};

/**
 * 게시글 단일 조회 (기본, 통계 없음)
 */
export const findArticleById = async (articleId) => {
  const query = `
    SELECT id, user_id, title, content, category, img_url, created_at, updated_at
    FROM articles
    WHERE id = ?
  `;
  const [rows] = await pool.query(query, [articleId]);
  return rows[0] || null;
};

/**
 * 게시글 수정
 */
export const updateArticle = async (articleId, updates) => {
  const fields = [];
  const values = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push("content = ?");
    values.push(updates.content);
  }
  if (updates.category !== undefined) {
    fields.push("category = ?");
    values.push(updates.category);
  }
  if (updates.img_url !== undefined) {
    fields.push("img_url = ?");
    values.push(updates.img_url);
  }

  if (fields.length === 0) {
    return 0;
  }

  values.push(articleId);
  const query = `UPDATE articles SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await pool.query(query, values);
  return result.affectedRows;
};

/**
 * 게시글 삭제
 */
export const deleteArticle = async (articleId) => {
  const query = `DELETE FROM articles WHERE id = ?`;
  const [result] = await pool.query(query, [articleId]);
  return result.affectedRows;
};

/**
 * 게시글 목록 조회 (통계 포함)
 * - likesCount, commentsCount, bookmarksCount
 * - liked, bookmarked (userId가 있을 때만)
 */
export const getArticlesWithStats = async (
  limit,
  offset,
  userId = null,
  sort = "latest"
) => {
  // 정렬 조건 결정
  let orderByClause;
  switch (sort) {
    case "popular":
      orderByClause = "ORDER BY likesCount DESC, a.created_at DESC";
      break;
    case "latest":
    default:
      orderByClause = "ORDER BY a.created_at DESC";
      break;
  }

  const query = `
    SELECT
      a.id,
      a.user_id,
      a.title,
      a.content,
      a.category,
      a.img_url,
      a.created_at,
      a.updated_at,
      COALESCE(likes.count, 0) AS likesCount,
      0 AS commentsCount,
      COALESCE(bookmarks.count, 0) AS bookmarksCount
      ${
        userId
          ? ", IF(user_likes.user_id IS NOT NULL, true, false) AS liked"
          : ""
      }
      ${
        userId
          ? ", IF(user_bookmarks.user_id IS NOT NULL, true, false) AS bookmarked"
          : ""
      }
    FROM articles a
    LEFT JOIN (
      SELECT article_id, COUNT(*) AS count
      FROM article_likes
      GROUP BY article_id
    ) likes ON a.id = likes.article_id
    LEFT JOIN (
      SELECT article_id, COUNT(*) AS count
      FROM user_save_articles
      GROUP BY article_id
    ) bookmarks ON a.id = bookmarks.article_id
    ${
      userId
        ? "LEFT JOIN article_likes user_likes ON a.id = user_likes.article_id AND user_likes.user_id = ?"
        : ""
    }
    ${
      userId
        ? "LEFT JOIN user_save_articles user_bookmarks ON a.id = user_bookmarks.article_id AND user_bookmarks.user_id = ?"
        : ""
    }
    ${orderByClause}
    LIMIT ? OFFSET ?
  `;

  const params = userId ? [userId, userId, limit, offset] : [limit, offset];
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * 내가 작성한 게시글 목록 조회 (통계 포함)
 */
export const getMyArticlesWithStats = async (limit, offset, userId) => {
  const query = `
    SELECT
      a.id,
      a.user_id,
      a.title,
      a.content,
      a.category,
      a.img_url,
      a.created_at,
      a.updated_at,
      COALESCE(likes.count, 0) AS likesCount,
      0 AS commentsCount,
      COALESCE(bookmarks.count, 0) AS bookmarksCount,
      IF(user_likes.user_id IS NOT NULL, true, false) AS liked,
      IF(user_bookmarks.user_id IS NOT NULL, true, false) AS bookmarked
    FROM articles a
    LEFT JOIN (
      SELECT article_id, COUNT(*) AS count
      FROM article_likes
      GROUP BY article_id
    ) likes ON a.id = likes.article_id
    LEFT JOIN (
      SELECT article_id, COUNT(*) AS count
      FROM user_save_articles
      GROUP BY article_id
    ) bookmarks ON a.id = bookmarks.article_id
    LEFT JOIN article_likes user_likes ON a.id = user_likes.article_id AND user_likes.user_id = ?
    LEFT JOIN user_save_articles user_bookmarks ON a.id = user_bookmarks.article_id AND user_bookmarks.user_id = ?
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(query, [
    userId,
    userId,
    userId,
    limit,
    offset,
  ]);
  return rows;
};

/**
 * 게시글 상세 조회 (통계 포함)
 */
export const getArticleWithStats = async (articleId, userId = null) => {
  const query = `
    SELECT
      a.id,
      a.user_id,
      a.title,
      a.content,
      a.category,
      a.img_url,
      a.created_at,
      a.updated_at,
      COALESCE(likes.count, 0) AS likesCount,
      0 AS commentsCount,
      COALESCE(bookmarks.count, 0) AS bookmarksCount
      ${
        userId
          ? ", IF(user_likes.user_id IS NOT NULL, true, false) AS liked"
          : ""
      }
      ${
        userId
          ? ", IF(user_bookmarks.user_id IS NOT NULL, true, false) AS bookmarked"
          : ""
      }
    FROM articles a
    LEFT JOIN (
      SELECT article_id, COUNT(*) AS count
      FROM article_likes
      WHERE article_id = ?
      GROUP BY article_id
    ) likes ON a.id = likes.article_id
    LEFT JOIN (
      SELECT article_id, COUNT(*) AS count
      FROM user_save_articles
      WHERE article_id = ?
      GROUP BY article_id
    ) bookmarks ON a.id = bookmarks.article_id
    ${
      userId
        ? "LEFT JOIN article_likes user_likes ON a.id = user_likes.article_id AND user_likes.user_id = ?"
        : ""
    }
    ${
      userId
        ? "LEFT JOIN user_save_articles user_bookmarks ON a.id = user_bookmarks.article_id AND user_bookmarks.user_id = ?"
        : ""
    }
    WHERE a.id = ?
  `;

  const params = userId
    ? [articleId, articleId, userId, userId, articleId]
    : [articleId, articleId, articleId];

  const [rows] = await pool.query(query, params);
  return rows[0] || null;
};

/**
 * 좋아요 추가
 */
export const insertLike = async (userId, articleId) => {
  const query = `
    INSERT INTO article_likes (user_id, article_id)
    VALUES (?, ?)
  `;
  const [result] = await pool.query(query, [userId, articleId]);
  return result.affectedRows;
};

/**
 * 좋아요 삭제
 */
export const deleteLike = async (userId, articleId) => {
  const query = `
    DELETE FROM article_likes
    WHERE user_id = ? AND article_id = ?
  `;
  const [result] = await pool.query(query, [userId, articleId]);
  return result.affectedRows;
};

/**
 * 좋아요 존재 여부 확인
 */
export const checkLikeExists = async (userId, articleId) => {
  const query = `
    SELECT 1 FROM article_likes
    WHERE user_id = ? AND article_id = ?
  `;
  const [rows] = await pool.query(query, [userId, articleId]);
  return rows.length > 0;
};

/**
 * 좋아요 수 조회
 */
export const getLikesCount = async (articleId) => {
  const query = `
    SELECT COUNT(*) AS count FROM article_likes
    WHERE article_id = ?
  `;
  const [rows] = await pool.query(query, [articleId]);
  return rows[0].count;
};

/**
 * 신고 추가
 */
export const insertReport = async (userId, articleId) => {
  const query = `
    INSERT INTO article_reports (user_id, article_id)
    VALUES (?, ?)
  `;
  const [result] = await pool.query(query, [userId, articleId]);
  return result.affectedRows;
};

/**
 * 신고 존재 여부 확인
 */
export const checkReportExists = async (userId, articleId) => {
  const query = `
    SELECT 1 FROM article_reports
    WHERE user_id = ? AND article_id = ?
  `;
  const [rows] = await pool.query(query, [userId, articleId]);
  return rows.length > 0;
};

/**
 * 북마크 추가
 */
export const insertBookmark = async (userId, articleId) => {
  const query = `
    INSERT INTO user_save_articles (user_id, article_id)
    VALUES (?, ?)
  `;
  const [result] = await pool.query(query, [userId, articleId]);
  return result.affectedRows;
};

/**
 * 북마크 삭제
 */
export const deleteBookmark = async (userId, articleId) => {
  const query = `
    DELETE FROM user_save_articles
    WHERE user_id = ? AND article_id = ?
  `;
  const [result] = await pool.query(query, [userId, articleId]);
  return result.affectedRows;
};

/**
 * 북마크 존재 여부 확인
 */
export const checkBookmarkExists = async (userId, articleId) => {
  const query = `
    SELECT 1 FROM user_save_articles
    WHERE user_id = ? AND article_id = ?
  `;
  const [rows] = await pool.query(query, [userId, articleId]);
  return rows.length > 0;
};

/**
 * 북마크한 게시글 수 조회
 */
export const countBookmarkedArticles = async (userId) => {
  const query = `SELECT COUNT(*) as count FROM user_save_articles WHERE user_id = ?`;
  const [rows] = await pool.query(query, [userId]);
  return rows[0].count;
};

/**
 * 북마크한 게시글 목록 조회 (통계 포함)
 */
export const getBookmarkedArticlesWithStats = async (limit, offset, userId) => {
  const query = `
    SELECT
      a.id,
      a.user_id,
      a.title,
      a.content,
      a.category,
      a.img_url,
      a.created_at,
      a.updated_at,
      COALESCE(likes.count, 0) AS likesCount,
      0 AS commentsCount,
      COALESCE(bookmarks.count, 0) AS bookmarksCount,
      IF(user_likes.user_id IS NOT NULL, true, false) AS liked,
      true AS bookmarked
    FROM user_save_articles usa
    INNER JOIN articles a ON usa.article_id = a.id
    LEFT JOIN (
      SELECT article_id, COUNT(*) AS count
      FROM article_likes
      GROUP BY article_id
    ) likes ON a.id = likes.article_id
    LEFT JOIN (
      SELECT article_id, COUNT(*) AS count
      FROM user_save_articles
      GROUP BY article_id
    ) bookmarks ON a.id = bookmarks.article_id
    LEFT JOIN article_likes user_likes ON a.id = user_likes.article_id AND user_likes.user_id = ?
    WHERE usa.user_id = ?
    ORDER BY usa.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(query, [userId, userId, limit, offset]);
  return rows;
};

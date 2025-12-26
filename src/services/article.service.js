import * as articleModel from "../models/article.model.js";
import * as s3Service from "./s3.service.js";

const VALID_CATEGORIES = [
  "dog",
  "cat",
  "small",
  "bird",
  "reptile",
  "fish",
  "etc",
];

/**
 * 게시글 생성
 */
export const createArticle = async (userId, articleData, imageFile) => {
  const { title, content, category } = articleData;

  // 카테고리 검증
  if (category && !VALID_CATEGORIES.includes(category)) {
    throw new Error(
      `유효하지 않은 카테고리입니다. 가능한 값: ${VALID_CATEGORIES.join(", ")}`
    );
  }

  let imgUrl = null;

  try {
    // 이미지 업로드 (있는 경우)
    if (imageFile) {
      imgUrl = await s3Service.uploadToS3(imageFile, userId, "articles");
    }

    // DB에 게시글 저장
    const articleId = await articleModel.insertArticle({
      userId,
      title,
      content,
      category: category || null,
      imgUrl,
    });

    // 생성된 게시글 조회 (통계 포함)
    const createdArticle = await articleModel.getArticleWithStats(
      articleId,
      userId
    );
    return createdArticle;
  } catch (error) {
    // S3 업로드 실패 시 정리
    if (imgUrl) {
      try {
        await s3Service.deleteFromS3(imgUrl);
      } catch (cleanupError) {
        console.error("S3 이미지 정리 실패:", cleanupError);
      }
    }
    throw error;
  }
};

/**
 * 게시글 목록 조회
 */
export const getArticles = async (
  limit = 20,
  offset = 0,
  requestingUserId = null,
  sort = "latest"
) => {
  // 통계와 함께 게시글 조회
  const articles = await articleModel.getArticlesWithStats(
    limit,
    offset,
    requestingUserId,
    sort
  );

  // 전체 개수 조회
  const totalCount = await articleModel.countArticles();

  return {
    data: articles,
    pagination: {
      limit,
      offset,
      totalCount,
      hasNext: offset + limit < totalCount,
    },
  };
};

/**
 * 내가 작성한 게시글 목록 조회
 */
export const getMyArticles = async (limit = 20, offset = 0, userId) => {
  // 내 게시글만 조회
  const articles = await articleModel.getMyArticlesWithStats(
    limit,
    offset,
    userId
  );

  // 내 게시글 전체 개수 조회
  const totalCount = await articleModel.countMyArticles(userId);

  return {
    data: articles,
    pagination: {
      limit,
      offset,
      totalCount,
      hasNext: offset + limit < totalCount,
    },
  };
};

/**
 * 게시글 상세 조회
 */
export const getArticleById = async (articleId, requestingUserId = null) => {
  const article = await articleModel.getArticleWithStats(
    articleId,
    requestingUserId
  );

  if (!article) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  return article;
};

/**
 * 게시글 수정
 */
export const updateArticle = async (
  articleId,
  requestingUserId,
  updates,
  newImageFile
) => {
  // 기존 게시글 조회 (ownership 검증용)
  const existingArticle = await articleModel.findArticleById(articleId);

  if (!existingArticle) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  if (existingArticle.user_id !== requestingUserId) {
    throw new Error("이 게시글을 수정할 권한이 없습니다.");
  }

  // 카테고리 검증
  if (updates.category && !VALID_CATEGORIES.includes(updates.category)) {
    throw new Error(
      `유효하지 않은 카테고리입니다. 가능한 값: ${VALID_CATEGORIES.join(", ")}`
    );
  }

  const updateData = { ...updates };
  let oldImgUrl = existingArticle.img_url;

  try {
    // 새 이미지 업로드
    if (newImageFile) {
      const newImgUrl = await s3Service.uploadToS3(
        newImageFile,
        requestingUserId,
        "articles"
      );
      updateData.img_url = newImgUrl;
    }

    // DB 업데이트
    await articleModel.updateArticle(articleId, updateData);

    // 기존 이미지 삭제 (새 이미지로 교체한 경우)
    if (newImageFile && oldImgUrl) {
      try {
        await s3Service.deleteFromS3(oldImgUrl);
      } catch (cleanupError) {
        console.error("기존 이미지 삭제 실패:", cleanupError);
      }
    }

    // 수정된 게시글 조회 (통계 포함)
    const updatedArticle = await articleModel.getArticleWithStats(
      articleId,
      requestingUserId
    );
    return updatedArticle;
  } catch (error) {
    // 새 이미지 업로드 실패 시 정리
    if (newImageFile && updateData.img_url) {
      try {
        await s3Service.deleteFromS3(updateData.img_url);
      } catch (cleanupError) {
        console.error("새 이미지 정리 실패:", cleanupError);
      }
    }
    throw error;
  }
};

/**
 * 게시글 삭제
 */
export const deleteArticle = async (articleId, requestingUserId) => {
  // 기존 게시글 조회 (ownership 검증용)
  const existingArticle = await articleModel.findArticleById(articleId);

  if (!existingArticle) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  if (existingArticle.user_id !== requestingUserId) {
    throw new Error("이 게시글을 삭제할 권한이 없습니다.");
  }

  // S3 이미지 삭제
  if (existingArticle.img_url) {
    try {
      await s3Service.deleteFromS3(existingArticle.img_url);
    } catch (error) {
      console.error("S3 이미지 삭제 실패:", error);
      // 이미지 삭제 실패해도 게시글은 삭제 진행
    }
  }

  // DB에서 삭제
  await articleModel.deleteArticle(articleId);
};

/**
 * 좋아요 토글
 */
export const toggleLike = async (articleId, userId) => {
  // 게시글 존재 확인
  const article = await articleModel.findArticleById(articleId);
  if (!article) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  // 좋아요 존재 여부 확인
  const exists = await articleModel.checkLikeExists(userId, articleId);

  let action;
  if (exists) {
    await articleModel.deleteLike(userId, articleId);
    action = "removed";
  } else {
    await articleModel.insertLike(userId, articleId);
    action = "added";
  }

  // 좋아요 수 조회
  const likesCount = await articleModel.getLikesCount(articleId);

  return {
    action,
    likesCount,
  };
};

/**
 * 신고
 */
export const reportArticle = async (articleId, userId) => {
  // 게시글 존재 확인
  const article = await articleModel.findArticleById(articleId);
  if (!article) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  // 이미 신고했는지 확인
  const exists = await articleModel.checkReportExists(userId, articleId);
  if (exists) {
    throw new Error("이미 신고한 게시글입니다.");
  }

  // 신고 추가
  await articleModel.insertReport(userId, articleId);
};

/**
 * 북마크 토글
 */
export const toggleBookmark = async (articleId, userId) => {
  // 게시글 존재 확인
  const article = await articleModel.findArticleById(articleId);
  if (!article) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  // 북마크 존재 여부 확인
  const exists = await articleModel.checkBookmarkExists(userId, articleId);

  let action;
  if (exists) {
    await articleModel.deleteBookmark(userId, articleId);
    action = "removed";
  } else {
    await articleModel.insertBookmark(userId, articleId);
    action = "added";
  }

  return {
    action,
  };
};

/**
 * 북마크한 게시글 목록 조회
 */
export const getBookmarkedArticles = async (limit = 20, offset = 0, userId) => {
  // 북마크한 게시글 조회
  const articles = await articleModel.getBookmarkedArticlesWithStats(
    limit,
    offset,
    userId
  );

  // 북마크한 게시글 전체 개수 조회
  const totalCount = await articleModel.countBookmarkedArticles(userId);

  return {
    data: articles,
    pagination: {
      limit,
      offset,
      totalCount,
      hasNext: offset + limit < totalCount,
    },
  };
};

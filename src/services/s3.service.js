import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.config.js";

/**
 * S3에 파일 업로드
 * @param {Object} file - multer file object (buffer, originalname, mimetype)
 * @param {number} userId - 사용자 ID
 * @param {string} folder - S3 폴더명 (기본값: 'pets', 예: 'articles')
 * @returns {Promise<string>} S3 public URL
 */
export const uploadToS3 = async (file, userId, folder = 'pets') => {
  try {
    // 파일명 sanitize 및 고유 키 생성
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${userId}/${timestamp}_${sanitizedFilename}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    // Public URL 생성
    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log(`[S3] 파일 업로드 성공: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("[S3] 파일 업로드 실패:", error);
    throw new Error(`S3 업로드 실패: ${error.message}`);
  }
};

/**
 * S3에서 파일 삭제
 * @param {string} imageUrl - S3 public URL
 * @returns {Promise<void>}
 */
export const deleteFromS3 = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    const key = extractS3Key(imageUrl);
    if (!key) {
      console.warn("[S3] 유효하지 않은 S3 URL, 삭제 건너뜀:", imageUrl);
      return;
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`[S3] 파일 삭제 성공: ${key}`);
  } catch (error) {
    // Silent failure - 파일이 이미 삭제되었거나 존재하지 않는 경우 무시
    console.error("[S3] 파일 삭제 실패 (무시됨):", error.message);
  }
};

/**
 * S3 URL에서 Object Key 추출
 * @param {string} imageUrl - S3 public URL
 * @returns {string|null} S3 object key
 */
export const extractS3Key = (imageUrl) => {
  if (!imageUrl) return null;

  try {
    // https://bucket.s3.region.amazonaws.com/key 형식
    const url = new URL(imageUrl);
    // pathname에서 leading slash 제거
    return url.pathname.substring(1);
  } catch (error) {
    console.error("[S3] URL 파싱 실패:", error.message);
    return null;
  }
};

import multer from "multer";

// 메모리 스토리지 사용 (디스크에 저장하지 않음)
const storage = multer.memoryStorage();

// 파일 타입 필터
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("JPG 또는 PNG 이미지만 업로드 가능합니다."), false);
  }
};

// Multer 설정
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

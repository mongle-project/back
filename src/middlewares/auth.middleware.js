import jwt from 'jsonwebtoken';

/**
 * JWT 토큰 검증 미들웨어
 *
 * 사용법:
 * import { authMiddleware } from '../middlewares/auth.middleware.js';
 * router.post('/endpoint', authMiddleware, controller.method);
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: '인증 토큰이 필요합니다.'
      });
    }

    // "Bearer TOKEN" 형식에서 토큰만 추출
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        message: '유효하지 않은 토큰 형식입니다.'
      });
    }

    // JWT 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 검증된 사용자 정보를 req.user에 저장
    req.user = decoded;

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: '토큰이 만료되었습니다. 다시 로그인해주세요.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: '유효하지 않은 토큰입니다.'
      });
    }

    console.error('인증 미들웨어 오류:', error);
    return res.status(500).json({
      message: '인증 처리 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고, 없으면 통과
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }

    next();

  } catch (error) {
    // 선택적 인증이므로 에러가 있어도 통과
    next();
  }
};

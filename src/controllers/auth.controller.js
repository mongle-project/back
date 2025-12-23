import * as authService from "../services/auth.service.js";

/**
 * 로그인
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { userid, password } = req.body;

    if (!userid || !password) {
      return res.status(400).json({
        message: "userid와 password를 모두 입력해주세요.",
      });
    }

    const tokens = await authService.login({ userid, password });

    return res.status(200).json(tokens);
  } catch (error) {
    console.error("로그인 오류:", error);
    return res.status(401).json({
      message: error.message || "로그인에 실패했습니다.",
    });
  }
};

/**
 * 로그아웃
 * POST /api/auth/logout
 * - 현재 서버 저장 토큰이 없으므로 클라이언트에서 토큰 삭제만 수행
 */
export const logoutUser = async (_req, res) => {
  return res.status(204).send();
};

/**
 * 토큰 갱신
 * POST /api/auth/refresh
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "refreshToken이 필요합니다.",
      });
    }

    const tokens = await authService.refreshTokens(refreshToken);

    return res.status(200).json(tokens);
  } catch (error) {
    console.error("토큰 갱신 오류:", error);
    return res.status(401).json({
      message: error.message || "토큰 갱신에 실패했습니다.",
    });
  }
};

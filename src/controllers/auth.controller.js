import * as userService from "../services/user.service.js";
import * as authService from "../services/auth.service.js";

/**
 * 회원가입
 * POST /api/auth/register
 * Body: { "id": string, "email": string, "password": string, "passwordConfirm": string }
 */
export const registerUser = async (req, res) => {
  try {
    const { id, email, password, passwordConfirm } = req.body;

    // 필수 필드 검증
    const requiredFields = ["id", "email", "password", "passwordConfirm"];
    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `필수 필드가 누락되었습니다: ${missingFields.join(", ")}`,
      });
    }

    // 서비스 레이어에 회원가입 위임
    const result = await userService.register({
      id: String(id), // 명시적으로 문자열로 변환
      email,
      password,
      passwordConfirm,
    });

    return res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      data: result,
    });
  } catch (error) {
    console.error("회원가입 오류:", error);

    // 서비스에서 던진 오류는 400으로 응답
    return res.status(400).json({
      message: error.message || "회원가입 중 오류가 발생했습니다.",
    });
  }
};

/**
 * 로그인
 * POST /api/auth/login
 * Body: { "id": string, "password": string }
 */
export const loginUser = async (req, res) => {
  try {
    const { id, password } = req.body;

    const requiredFields = ["id", "password"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `필수 필드가 누락되었습니다: ${missingFields.join(", ")}`,
      });
    }

    // 서비스 레이어에서 로그인 처리
    const tokens = await authService.login({ id, password });

    return res.status(200).json(tokens);
  } catch (error) {
    console.error("로그인 오류:", error);

    return res.status(400).json({
      message: error.message || "로그인 중 오류가 발생했습니다.",
    });
  }
};

/**
 * 로그아웃
 * POST /api/auth/logout
 * Body: { "refreshToken": "..." } (선택적)
 *
 * 현재는 서버 측 상태 저장 없이, 클라이언트에서 토큰을 폐기하는 방식으로 동작합니다.
 */
export const logoutUser = async (req, res) => {
  try {
    // TODO: 추후 refreshToken 블랙리스트나 저장소를 사용할 경우 여기서 처리
    return res.status(204).send();
  } catch (error) {
    console.error("로그아웃 오류:", error);

    return res.status(400).json({
      message: error.message || "로그아웃 중 오류가 발생했습니다.",
    });
  }
};

/**
 * 토큰 갱신
 * POST /api/auth/refresh
 * Body: { "refreshToken": "..." }
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "refreshToken 필드는 필수입니다.",
      });
    }

    const tokens = await authService.refreshTokens(refreshToken);

    return res.status(200).json(tokens);
  } catch (error) {
    console.error("토큰 갱신 오류:", error);

    return res.status(400).json({
      message: error.message || "토큰 갱신 중 오류가 발생했습니다.",
    });
  }
};

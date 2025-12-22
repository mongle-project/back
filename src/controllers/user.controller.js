import * as userService from "../services/user.service.js";

/**
 * 회원가입
 * POST /api/users
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


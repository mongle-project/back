import * as userService from "../services/user.service.js";

/**
 * 회원가입
 * POST /api/users
 */
export const registerUser = async (req, res) => {
  try {
    const { userid, email, password, passwordConfirm } = req.body;

    const user = await userService.register({
      userid,
      email,
      password,
      passwordConfirm,
    });

    return res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      data: user,
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    return res.status(400).json({
      message: error.message || "회원가입 중 오류가 발생했습니다.",
    });
  }
};

/**
 * 내 정보 조회
 * GET /api/users/me
 */
export const getMyProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.userId);
    return res.status(200).json(user);
  } catch (error) {
    console.error("내 정보 조회 오류:", error);
    return res.status(400).json({
      message: error.message || "내 정보 조회에 실패했습니다.",
    });
  }
};

/**
 * 아이디 찾기
 * POST /api/users/find-email
 */
export const findEmail = async (req, res) => {
  try {
    const { userid, email } = req.body;

    await userService.verifyUserIdentity({ userid, email });

    return res.status(200).json({
      message: "사용자 인증이 완료되었습니다.",
    });
  } catch (error) {
    console.error("아이디 찾기 오류:", error);
    return res.status(400).json({
      message: error.message || "사용자 인증에 실패했습니다.",
    });
  }
};

/**
 * 비밀번호 재설정
 * PATCH /api/users/me/password
 */
export const resetPassword = async (req, res) => {
  try {
    const { userid, email, newPassword } = req.body;

    await userService.resetPassword({
      userid,
      email,
      newPassword,
    });

    return res.status(204).send();
  } catch (error) {
    console.error("비밀번호 재설정 오류:", error);
    return res.status(400).json({
      message: error.message || "비밀번호 재설정에 실패했습니다.",
    });
  }
};

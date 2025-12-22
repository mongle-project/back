import * as userModel from "../models/user.model.js";
import * as authService from "./auth.service.js";

/**
 * 회원가입 처리
 */
export const register = async (registerData) => {
  const { id, email, password, passwordConfirm } = registerData;

  // ID 검증
  if (id === undefined || id === null) {
    throw new Error("ID는 필수입니다.");
  }
  if (typeof id !== "string") {
    throw new Error("ID는 문자열이어야 합니다.");
  }
  if (id.trim().length === 0) {
    throw new Error("ID는 공백일 수 없습니다.");
  }

  // ID 중복 확인
  const existingUserById = await userModel.findUserById(id);
  if (existingUserById) {
    throw new Error("이미 사용 중인 ID입니다.");
  }

  // 이메일 형식 검증
  if (!authService.validateEmail(email)) {
    throw new Error("올바른 이메일 형식이 아닙니다.");
  }

  // 비밀번호 형식 검증
  if (!authService.validatePassword(password)) {
    throw new Error("비밀번호는 특수기호(!@#$%^&*)를 포함해야 합니다.");
  }

  // 비밀번호 확인 일치 검증
  if (password !== passwordConfirm) {
    throw new Error("비밀번호가 일치하지 않습니다.");
  }

  // 이메일 중복 확인
  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }

  // 비밀번호 해싱 (auth.service의 헬퍼 사용)
  const hashedPassword = await authService.hashPassword(password);

  // 사용자 생성
  const userId = await userModel.createUser(id, email, hashedPassword);

  return {
    userId,
    email,
  };
};

import bcrypt from "bcrypt";
import * as userModel from "../models/user.model.js";

const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  if (!password) return false;
  const lengthOk = password.length >= 8;
  const hasSpecial = /[!@#$%^&*]/.test(password);
  return lengthOk && hasSpecial;
};

/**
 * 회원가입 서비스
 */
export const register = async ({
  userid,
  email,
  password,
  passwordConfirm,
}) => {
  if (!userid || !email || !password || !passwordConfirm) {
    throw new Error(
      "userid, email, password, passwordConfirm이 모두 필요합니다."
    );
  }

  if (password !== passwordConfirm) {
    throw new Error("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
  }

  if (!validateEmail(email)) {
    throw new Error("이메일 형식이 올바르지 않습니다.");
  }

  if (!validatePassword(password)) {
    throw new Error(
      "비밀번호는 8자리 이상이며 특수문자(!@#$%^&*)가 포함되어야 합니다."
    );
  }

  const existingById = await userModel.findUserByUserId(userid);
  if (existingById) {
    throw new Error("이미 존재하는 userid입니다.");
  }

  const existingByEmail = await userModel.findUserByEmail(email);
  if (existingByEmail) {
    throw new Error("이미 존재하는 이메일입니다.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await userModel.createUser(userid, email, hashedPassword);

  return {
    id: userId,
    email,
  };
};

/**
 * 내 정보 조회
 */
export const getProfile = async (userId) => {
  if (!userId) {
    throw new Error("사용자 식별자가 필요합니다.");
  }

  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
};

/**
 * 비밀번호 재설정
 */
export const resetPassword = async ({
  userid,
  email,
  newPassword,
  newPasswordConfirm,
}) => {
  if (!userid || !email) {
    throw new Error("userid와 email이 모두 필요합니다.");
  }

  if (!newPassword || !newPasswordConfirm) {
    throw new Error("새 비밀번호와 확인값이 모두 필요합니다.");
  }

  if (newPassword !== newPasswordConfirm) {
    throw new Error("새 비밀번호와 확인값이 일치하지 않습니다.");
  }

  if (!validatePassword(newPassword)) {
    throw new Error(
      "비밀번호는 8자리 이상이며 특수문자(!@#$%^&*)가 포함되어야 합니다."
    );
  }

  const user = await userModel.findUserByUserId(userid);
  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  if (email !== user.email) {
    throw new Error("요청한 이메일이 사용자 정보와 일치하지 않습니다.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userModel.updatePasswordById(user.id, hashedPassword);
};

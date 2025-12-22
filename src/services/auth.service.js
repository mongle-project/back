import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userModel from "../models/user.model.js";

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

/**
 * 이메일 형식 검증
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false;
  // 간단한 이메일 형식 체크
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 형식 검증
 *  - 최소 8자리
 *  - 특수문자(!@#$%^&*) 1개 이상 포함
 * @param {string} password
 * @returns {boolean}
 */
export const validatePassword = (password) => {
  if (!password) return false;
  const lengthOk = password.length >= 8;
  const specialCharRegex = /[!@#$%^&*]/;
  return lengthOk && specialCharRegex.test(password);
};

/**
 * 비밀번호 해시 생성
 */
export const hashPassword = async (plainPassword) => {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
};

/**
 * 액세스 토큰 생성
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

/**
 * 리프레시 토큰 생성
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

/**
 * 리프레시 토큰 검증
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

/**
 * 로그인 처리
 *  - id와 password를 사용합니다.
 */
export const login = async ({ id, password }) => {
  if (!id) {
    throw new Error("ID는 필수입니다.");
  }
  if (typeof id !== "string") {
    throw new Error("ID는 문자열이어야 합니다.");
  }

  const user = await userModel.findUserById(id);
  if (!user) {
    throw new Error("존재하지 않는 사용자입니다.");
  }

  // bcrypt로 해시된 비밀번호 비교
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("비밀번호가 올바르지 않습니다.");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * 리프레시 토큰을 사용해 토큰 재발급
 */
export const refreshTokens = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("refreshToken이 필요합니다.");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new Error("유효하지 않은 refreshToken 입니다.");
  }

  // 사용자가 아직 존재하는지 확인 (탈퇴 등 대비)
  const user = await userModel.findUserById(payload.userId);
  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

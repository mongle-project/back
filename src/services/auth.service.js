import jwt from "jsonwebtoken";
import * as userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

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
 */
export const login = async ({ userid, password }) => {
  const user =
    (userid && (await userModel.findUserByUserId(userid))) ||
    (await userModel.findUserByEmail(userid));
  if (!user) {
    throw new Error("존재하지 않는 사용자입니다.");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
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
  const user = await userModel.findUserByEmail(payload.email);
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

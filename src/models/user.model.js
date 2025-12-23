import pool from "../config/db.config.js";

/**
 * 이메일로 사용자 조회
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export const findUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password, created_at AS createdAt
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [email]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * 새 사용자 생성
 * @param {string} email
 * @param {string} hashedPassword
 * @returns {Promise<number>} 생성된 사용자 ID
 */
export const createUser = async (id, email, hashedPassword) => {
  const query = `
    INSERT INTO users (id, email, password)
    VALUES (?, ?, ?)
  `;

  await pool.query(query, [id, email, hashedPassword]);
  return id;
};

/**
 * ID로 사용자 조회
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export const findUserById = async (id) => {
  const query = `
    SELECT id, email, created_at AS createdAt
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [id]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * 사용자 아이디(userid)로 조회
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findUserByUserId = async (userId) => {
  const query = `
    SELECT id, email, password, created_at AS createdAt
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [userId]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * 비밀번호 업데이트
 * @param {number} id
 * @param {string} hashedPassword
 */
export const updatePasswordById = async (id, hashedPassword) => {
  const query = `
    UPDATE users
    SET password = ?
    WHERE id = ?
  `;

  await pool.query(query, [hashedPassword, id]);
};

import pool from "../config/db.config.js";

/**
 * 이메일로 사용자 조회
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export const findUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password, created_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [email]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * ID로 사용자 조회
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findUserById = async (id) => {
  const query = `
    SELECT id, email, password, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [id]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * 새 사용자 생성
 * @param {string} id
 * @param {string} email
 * @param {string} hashedPassword
 * @returns {Promise<string>} 생성된 사용자 ID
 */
export const createUser = async (id, email, hashedPassword) => {
  const query = `
    INSERT INTO users (id, email, password)
    VALUES (?, ?, ?)
  `;

  const [result] = await pool.query(query, [id, email, hashedPassword]);
  return id;
};

/**
 * 모든 사용자 조회 (마이그레이션용)
 * @returns {Promise<Array>}
 */
export const findAllUsers = async () => {
  const query = `
    SELECT id, email, password, created_at
    FROM users
  `;

  const [rows] = await pool.query(query);
  return rows;
};

/**
 * 사용자 비밀번호 업데이트 (마이그레이션용)
 * @param {string} id
 * @param {string} hashedPassword
 * @returns {Promise<void>}
 */
export const updateUserPassword = async (id, hashedPassword) => {
  const query = `
    UPDATE users
    SET password = ?
    WHERE id = ?
  `;

  await pool.query(query, [hashedPassword, id]);
};

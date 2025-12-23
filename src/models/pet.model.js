import pool from "../config/db.config.js";

/**
 * 반려동물 프로필 등록
 * @param {Object} petData - { userId, name, gender, species, feature, birthDay, imgUrl }
 * @returns {Promise<number>} insertId
 */
export const insertPet = async ({ userId, name, gender, species, feature, birthDay, imgUrl }) => {
  const query = `
    INSERT INTO pet_profiles (user_id, name, gender, species, feature, birth_day, img_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(query, [userId, name, gender, species, feature, birthDay, imgUrl]);
  return result.insertId;
};

/**
 * 사용자의 반려동물 목록 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} 반려동물 목록
 */
export const findPetsByUserId = async (userId) => {
  const query = `
    SELECT
      id,
      user_id,
      name,
      gender,
      species,
      feature,
      birth_day,
      img_url,
      created_at,
      updated_at
    FROM pet_profiles
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  const [rows] = await pool.query(query, [userId]);
  return rows;
};

/**
 * 반려동물 ID로 조회
 * @param {number} petId - 반려동물 ID
 * @returns {Promise<Object|null>} 반려동물 정보 또는 null
 */
export const findPetById = async (petId) => {
  const query = `
    SELECT
      id,
      user_id,
      name,
      gender,
      species,
      feature,
      birth_day,
      img_url,
      created_at,
      updated_at
    FROM pet_profiles
    WHERE id = ?
  `;

  const [rows] = await pool.query(query, [petId]);
  return rows[0] || null;
};

/**
 * 반려동물 프로필 수정
 * @param {number} petId - 반려동물 ID
 * @param {Object} updates - 업데이트할 필드 { name, gender, species, feature, birth_day, img_url 등 }
 * @returns {Promise<number>} affectedRows
 */
export const updatePet = async (petId, updates) => {
  const fields = Object.keys(updates);
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = Object.values(updates);

  const query = `UPDATE pet_profiles SET ${setClause} WHERE id = ?`;
  const [result] = await pool.query(query, [...values, petId]);

  return result.affectedRows;
};

/**
 * 반려동물 프로필 삭제
 * @param {number} petId - 반려동물 ID
 * @returns {Promise<number>} affectedRows
 */
export const deletePet = async (petId) => {
  const query = `DELETE FROM pet_profiles WHERE id = ?`;
  const [result] = await pool.query(query, [petId]);

  return result.affectedRows;
};

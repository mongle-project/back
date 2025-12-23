import pool from "../config/db.config.js";

/**
 * 위치 기반 보호소 검색 (Haversine 공식으로 거리 계산)
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @param {number} radius - 검색 반경 (미터)
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Array>} 보호소 목록 (거리순 정렬)
 */
export const findByLocation = async (latitude, longitude, radius, limit, offset) => {
  let query = `
    SELECT
      id,
      shelter_name,
      phone_number,
      road_address,
      latitude,
      longitude,
      (6371000 * ACOS(
        COS(RADIANS(?)) * COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) * SIN(RADIANS(latitude))
      )) AS distance
    FROM shelters
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
    HAVING distance <= ?
    ORDER BY distance ASC
  `;

  const params = [latitude, longitude, latitude, radius];

  if (limit !== undefined && offset !== undefined) {
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
  }

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * 위치 기반 보호소 총 개수 조회
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @param {number} radius - 검색 반경 (미터)
 * @returns {Promise<number>} 총 개수
 */
export const countByLocation = async (latitude, longitude, radius) => {
  const query = `
    SELECT COUNT(*) as total
    FROM (
      SELECT
        id,
        (6371000 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(latitude))
        )) AS distance
      FROM shelters
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
      HAVING distance <= ?
    ) AS filtered
  `;

  const [rows] = await pool.query(query, [latitude, longitude, latitude, radius]);
  return rows[0].total;
};

/**
 * 키워드 기반 보호소 검색 (보호소명, 주소 검색)
 * @param {string} keyword - 검색 키워드
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Array>} 보호소 목록
 */
export const findByKeyword = async (keyword, limit, offset) => {
  let query = `
    SELECT
      id,
      shelter_name,
      phone_number,
      road_address,
      latitude,
      longitude
    FROM shelters
    WHERE shelter_name LIKE ?
       OR road_address LIKE ?
    ORDER BY shelter_name ASC
  `;

  const searchPattern = `%${keyword}%`;
  const params = [searchPattern, searchPattern];

  if (limit !== undefined && offset !== undefined) {
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
  }

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * 키워드 기반 보호소 총 개수 조회
 * @param {string} keyword - 검색 키워드
 * @returns {Promise<number>} 총 개수
 */
export const countByKeyword = async (keyword) => {
  const query = `
    SELECT COUNT(*) as total
    FROM shelters
    WHERE shelter_name LIKE ?
       OR road_address LIKE ?
  `;

  const searchPattern = `%${keyword}%`;
  const [rows] = await pool.query(query, [searchPattern, searchPattern]);
  return rows[0].total;
};

/**
 * 전체 보호소 목록 조회
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Array>} 전체 보호소 목록
 */
export const findAll = async (limit, offset) => {
  let query = `
    SELECT
      id,
      shelter_name,
      phone_number,
      road_address,
      latitude,
      longitude
    FROM shelters
    ORDER BY shelter_name ASC
  `;

  const params = [];

  if (limit !== undefined && offset !== undefined) {
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
  }

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * 전체 보호소 총 개수 조회
 * @returns {Promise<number>} 총 개수
 */
export const countAll = async () => {
  const query = `SELECT COUNT(*) as total FROM shelters`;
  const [rows] = await pool.query(query);
  return rows[0].total;
};

/**
 * 보호소 상세 조회
 * @param {number} shelterId - 보호소 ID
 * @returns {Promise<Object|null>} 보호소 정보 또는 null
 */
export const findById = async (shelterId) => {
  const query = `
    SELECT
      id,
      shelter_name,
      phone_number,
      road_address,
      latitude,
      longitude
    FROM shelters
    WHERE id = ?
  `;

  const [rows] = await pool.query(query, [shelterId]);
  return rows[0] || null;
};

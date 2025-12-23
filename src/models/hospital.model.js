import pool from "../config/db.config.js";

/**
 * 위치 기반 병원 검색 (Haversine 공식으로 거리 계산)
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @param {number} radius - 검색 반경 (미터)
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Array>} 병원 목록 (거리순 정렬)
 */
export const findByLocation = async (latitude, longitude, radius, limit, offset) => {
  let query = `
    SELECT
      id,
      hospital_name,
      phone_number,
      road_address,
      postal_code,
      latitude,
      longitude,
      (6371000 * ACOS(
        COS(RADIANS(?)) * COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) * SIN(RADIANS(latitude))
      )) AS distance
    FROM hospitals
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
 * 위치 기반 병원 총 개수 조회
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
      FROM hospitals
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
      HAVING distance <= ?
    ) AS filtered
  `;

  const [rows] = await pool.query(query, [latitude, longitude, latitude, radius]);
  return rows[0].total;
};

/**
 * 도시/구 기반 병원 검색
 * @param {string} city - 도시명
 * @param {string} district - 구 이름 (선택사항)
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Array>} 병원 목록
 */
export const findByCity = async (city, district, limit, offset) => {
  let query = `
    SELECT
      id,
      hospital_name,
      phone_number,
      road_address,
      postal_code,
      latitude,
      longitude
    FROM hospitals
    WHERE road_address LIKE ?
  `;

  const params = [`%${city}%`];

  if (district) {
    query += ` AND road_address LIKE ?`;
    params.push(`%${district}%`);
  }

  query += ` ORDER BY hospital_name ASC`;

  if (limit !== undefined && offset !== undefined) {
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
  }

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * 도시/구 기반 병원 총 개수 조회
 * @param {string} city - 도시명
 * @param {string} district - 구 이름 (선택사항)
 * @returns {Promise<number>} 총 개수
 */
export const countByCity = async (city, district) => {
  let query = `
    SELECT COUNT(*) as total
    FROM hospitals
    WHERE road_address LIKE ?
  `;

  const params = [`%${city}%`];

  if (district) {
    query += ` AND road_address LIKE ?`;
    params.push(`%${district}%`);
  }

  const [rows] = await pool.query(query, params);
  return rows[0].total;
};

/**
 * 전체 병원 목록 조회
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Array>} 전체 병원 목록
 */
export const findAll = async (limit, offset) => {
  let query = `
    SELECT
      id,
      hospital_name,
      phone_number,
      road_address,
      postal_code,
      latitude,
      longitude
    FROM hospitals
    ORDER BY hospital_name ASC
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
 * 전체 병원 총 개수 조회
 * @returns {Promise<number>} 총 개수
 */
export const countAll = async () => {
  const query = `SELECT COUNT(*) as total FROM hospitals`;
  const [rows] = await pool.query(query);
  return rows[0].total;
};

/**
 * 병원 상세 조회
 * @param {number} hospitalId - 병원 ID
 * @returns {Promise<Object|null>} 병원 정보 또는 null
 */
export const findById = async (hospitalId) => {
  const query = `
    SELECT
      id,
      hospital_name,
      phone_number,
      road_address,
      postal_code,
      latitude,
      longitude
    FROM hospitals
    WHERE id = ?
  `;

  const [rows] = await pool.query(query, [hospitalId]);
  return rows[0] || null;
};

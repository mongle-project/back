import pool from "../config/db.config.js";

/**
 * 캘린더 일정 등록
 * @param {Object} eventData - { userId, petProfileId, title, category, eventDate, eventTime, isComplete }
 * @returns {Promise<number>} insertId
 */
export const insertEvent = async ({
  userId,
  petProfileId,
  title,
  category,
  eventDate,
  eventTime = null,
  isComplete = 0,
}) => {
  const query = `
    INSERT INTO calendar_events (user_id, pet_profile_id, title, category, event_date, event_time, is_complete)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(query, [
    userId,
    petProfileId,
    title,
    category,
    eventDate,
    eventTime,
    isComplete,
  ]);
  return result.insertId;
};

/**
 * 월별 일정 조회 (사용자별)
 * @param {number} userId - 사용자 ID
 * @param {number} year - 연도
 * @param {number} month - 월 (1-12)
 * @returns {Promise<Array>} 일정 목록
 */
export const findEventsByMonth = async (userId, year, month) => {
  const query = `
    SELECT
      ce.id,
      ce.user_id,
      ce.pet_profile_id,
      ce.title,
      ce.category,
      ce.event_date,
      ce.event_time,
      ce.is_complete,
      ce.created_at,
      pp.name AS pet_name,
      pp.species AS pet_species
    FROM calendar_events ce
    LEFT JOIN pet_profiles pp ON ce.pet_profile_id = pp.id
    WHERE ce.user_id = ?
      AND YEAR(ce.event_date) = ?
      AND MONTH(ce.event_date) = ?
    ORDER BY ce.event_date ASC, ce.event_time ASC, ce.created_at ASC
  `;

  const [rows] = await pool.query(query, [userId, year, month]);
  return rows;
};

/**
 * 일정 ID로 조회
 * @param {number} eventId - 일정 ID
 * @returns {Promise<Object|null>} 일정 정보 또는 null
 */
export const findEventById = async (eventId) => {
  const query = `
    SELECT
      ce.id,
      ce.user_id,
      ce.pet_profile_id,
      ce.title,
      ce.category,
      ce.event_date,
      ce.event_time,
      ce.is_complete,
      ce.created_at,
      pp.name AS pet_name,
      pp.species AS pet_species
    FROM calendar_events ce
    LEFT JOIN pet_profiles pp ON ce.pet_profile_id = pp.id
    WHERE ce.id = ?
  `;

  const [rows] = await pool.query(query, [eventId]);
  return rows[0] || null;
};

/**
 * 일정 수정
 * @param {number} eventId - 일정 ID
 * @param {Object} updates - 업데이트할 필드
 * @returns {Promise<number>} affectedRows
 */
export const updateEvent = async (eventId, updates) => {
  // 필드명 매핑 (camelCase → snake_case)
  const fieldMap = {
    petProfileId: "pet_profile_id",
    title: "title",
    category: "category",
    eventDate: "event_date",
    eventTime: "event_time",
    isComplete: "is_complete",
  };

  const mappedUpdates = {};
  for (const [key, value] of Object.entries(updates)) {
    const dbField = fieldMap[key] || key;
    mappedUpdates[dbField] = value;
  }

  const fields = Object.keys(mappedUpdates);
  if (fields.length === 0) {
    return 0;
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = Object.values(mappedUpdates);

  const query = `UPDATE calendar_events SET ${setClause} WHERE id = ?`;
  const [result] = await pool.query(query, [...values, eventId]);

  return result.affectedRows;
};

/**
 * 일정 삭제
 * @param {number} eventId - 일정 ID
 * @returns {Promise<number>} affectedRows
 */
export const deleteEvent = async (eventId) => {
  const query = `DELETE FROM calendar_events WHERE id = ?`;
  const [result] = await pool.query(query, [eventId]);

  return result.affectedRows;
};

/**
 * 특정 날짜의 일정 조회
 * @param {number} userId - 사용자 ID
 * @param {string} date - 날짜 (YYYY-MM-DD)
 * @returns {Promise<Array>} 일정 목록
 */
export const findEventsByDate = async (userId, date) => {
  const query = `
    SELECT
      ce.id,
      ce.user_id,
      ce.pet_profile_id,
      ce.content,
      ce.category,
      ce.event_date,
      ce.is_complete,
      ce.created_at,
      pp.name AS pet_name,
      pp.species AS pet_species
    FROM calendar_events ce
    LEFT JOIN pet_profiles pp ON ce.pet_profile_id = pp.id
    WHERE ce.user_id = ?
      AND ce.event_date = ?
    ORDER BY ce.created_at ASC
  `;

  const [rows] = await pool.query(query, [userId, date]);
  return rows;
};

import * as calendarModel from "../models/calendar.model.js";
import * as petModel from "../models/pet.model.js";

// 유효한 카테고리 목록 (4개)
const VALID_CATEGORIES = [
  "vaccination", // 예방접종
  "hospital", // 병원
  "grooming", // 미용
  "medication", // 투약
];

/**
 * 일정 등록
 * @param {number} userId - 사용자 ID
 * @param {Object} eventData - { petProfileId, title, category, eventDate, eventTime, isComplete }
 * @returns {Promise<Object>} 생성된 일정 정보
 */
export const createEvent = async (userId, eventData) => {
  const { petProfileId, title, category, eventDate, eventTime, isComplete } =
    eventData;

  // 필수 필드 검증
  if (!title || !eventDate) {
    throw new Error("일정명과 날짜는 필수 항목입니다.");
  }

  // petProfileId가 제공된 경우, 해당 펫이 사용자 소유인지 확인
  if (petProfileId) {
    const pet = await petModel.findPetById(petProfileId);
    if (!pet) {
      throw new Error("존재하지 않는 반려동물입니다.");
    }
    if (pet.user_id !== userId) {
      throw new Error("해당 반려동물에 대한 권한이 없습니다.");
    }
  }

  // 카테고리 유효성 검증 (필수)
  if (!category || !VALID_CATEGORIES.includes(category.toLowerCase())) {
    throw new Error(
      `유효하지 않은 카테고리입니다. (vaccination, hospital, grooming, medication)`
    );
  }

  // DB에 일정 저장
  const eventId = await calendarModel.insertEvent({
    userId,
    petProfileId: petProfileId || null,
    title: title.trim(),
    category: category.toLowerCase(),
    eventDate,
    eventTime: eventTime || null,
    isComplete: isComplete ? 1 : 0,
  });

  // 생성된 일정 정보 조회
  const createdEvent = await calendarModel.findEventById(eventId);
  return formatEventResponse(createdEvent);
};

/**
 * 월별 일정 조회
 * @param {number} userId - 사용자 ID
 * @param {number} year - 연도
 * @param {number} month - 월 (1-12)
 * @returns {Promise<Array>} 일정 목록
 */
export const getEventsByMonth = async (userId, year, month) => {
  // 유효성 검증
  if (!year || !month || month < 1 || month > 12) {
    throw new Error("유효하지 않은 연도 또는 월입니다.");
  }

  const events = await calendarModel.findEventsByMonth(userId, year, month);
  return events.map(formatEventResponse);
};

/**
 * 일정 상세 조회 (ownership 검증 포함)
 * @param {number} eventId - 일정 ID
 * @param {number} requestingUserId - 요청 사용자 ID
 * @returns {Promise<Object>} 일정 정보
 */
export const getEventById = async (eventId, requestingUserId) => {
  const event = await calendarModel.findEventById(eventId);

  if (!event) {
    throw new Error("존재하지 않는 일정입니다.");
  }

  // 소유권 검증
  if (event.user_id !== requestingUserId) {
    throw new Error("해당 일정에 대한 권한이 없습니다.");
  }

  return formatEventResponse(event);
};

/**
 * 일정 수정
 * @param {number} eventId - 일정 ID
 * @param {number} requestingUserId - 요청 사용자 ID
 * @param {Object} updateData - 업데이트할 필드
 * @returns {Promise<Object>} 수정된 일정 정보
 */
export const updateEvent = async (eventId, requestingUserId, updateData) => {
  // 기존 일정 조회 및 소유권 검증
  const existingEvent = await calendarModel.findEventById(eventId);

  if (!existingEvent) {
    throw new Error("존재하지 않는 일정입니다.");
  }

  if (existingEvent.user_id !== requestingUserId) {
    throw new Error("해당 일정에 대한 권한이 없습니다.");
  }

  // petProfileId 변경 시 소유권 검증
  if (
    updateData.petProfileId !== undefined &&
    updateData.petProfileId !== null
  ) {
    const pet = await petModel.findPetById(updateData.petProfileId);
    if (!pet) {
      throw new Error("존재하지 않는 반려동물입니다.");
    }
    if (pet.user_id !== requestingUserId) {
      throw new Error("해당 반려동물에 대한 권한이 없습니다.");
    }
  }

  // 업데이트 가능한 필드만 추출
  const allowedFields = [
    "petProfileId",
    "title",
    "category",
    "eventDate",
    "eventTime",
    "isComplete",
  ];
  const filteredUpdates = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      if (field === "title" && typeof updateData[field] === "string") {
        filteredUpdates[field] = updateData[field].trim();
      } else if (
        field === "category" &&
        typeof updateData[field] === "string"
      ) {
        filteredUpdates[field] = updateData[field].toLowerCase();
      } else if (field === "isComplete") {
        filteredUpdates[field] = updateData[field] ? 1 : 0;
      } else {
        filteredUpdates[field] = updateData[field];
      }
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error("수정할 내용이 없습니다.");
  }

  // DB 업데이트
  await calendarModel.updateEvent(eventId, filteredUpdates);

  // 수정된 일정 정보 조회
  const updatedEvent = await calendarModel.findEventById(eventId);
  return formatEventResponse(updatedEvent);
};

/**
 * 일정 삭제
 * @param {number} eventId - 일정 ID
 * @param {number} requestingUserId - 요청 사용자 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export const deleteEvent = async (eventId, requestingUserId) => {
  // 기존 일정 조회 및 소유권 검증
  const existingEvent = await calendarModel.findEventById(eventId);

  if (!existingEvent) {
    throw new Error("존재하지 않는 일정입니다.");
  }

  if (existingEvent.user_id !== requestingUserId) {
    throw new Error("해당 일정에 대한 권한이 없습니다.");
  }

  const affectedRows = await calendarModel.deleteEvent(eventId);
  return affectedRows > 0;
};

/**
 * 응답 형식으로 변환 (snake_case → camelCase)
 * @param {Object} event - DB에서 조회된 일정 객체
 * @returns {Object} 변환된 일정 객체
 */
const formatEventResponse = (event) => {
  if (!event) return null;

  return {
    id: event.id,
    userId: event.user_id,
    petProfileId: event.pet_profile_id,
    title: event.title,
    category: event.category,
    eventDate: event.event_date,
    eventTime: event.event_time,
    isComplete: Boolean(event.is_complete),
    createdAt: event.created_at,
    pet: event.pet_profile_id
      ? {
          id: event.pet_profile_id,
          name: event.pet_name,
          species: event.pet_species,
        }
      : null,
  };
};

import * as shelterModel from "../models/shelter.model.js";

/**
 * 위치 기반 보호소 검색
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @param {number} radius - 검색 반경 (미터)
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Object>} { data: 보호소 목록, totalCount: 총 개수 }
 */
export const getSheltersByLocation = async (latitude, longitude, radius, limit, offset) => {
  const data = await shelterModel.findByLocation(latitude, longitude, radius, limit, offset);

  // 페이지네이션 사용 시 총 개수도 함께 반환
  if (limit !== undefined && offset !== undefined) {
    const totalCount = await shelterModel.countByLocation(latitude, longitude, radius);
    return { data, totalCount };
  }

  return { data, totalCount: data.length };
};

/**
 * 키워드 기반 보호소 검색
 * @param {string} keyword - 검색 키워드 (보호소명, 주소 등)
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Object>} { data: 보호소 목록, totalCount: 총 개수 }
 */
export const getSheltersByKeyword = async (keyword, limit, offset) => {
  const data = await shelterModel.findByKeyword(keyword, limit, offset);

  // 페이지네이션 사용 시 총 개수도 함께 반환
  if (limit !== undefined && offset !== undefined) {
    const totalCount = await shelterModel.countByKeyword(keyword);
    return { data, totalCount };
  }

  return { data, totalCount: data.length };
};

/**
 * 전체 보호소 목록 조회
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Object>} { data: 보호소 목록, totalCount: 총 개수 }
 */
export const getAllShelters = async (limit, offset) => {
  const data = await shelterModel.findAll(limit, offset);

  // 페이지네이션 사용 시 총 개수도 함께 반환
  if (limit !== undefined && offset !== undefined) {
    const totalCount = await shelterModel.countAll();
    return { data, totalCount };
  }

  return { data, totalCount: data.length };
};

/**
 * 보호소 상세 조회
 * @param {number} shelterId - 보호소 ID
 * @returns {Promise<Object|null>} 보호소 정보 또는 null
 */
export const getShelterById = async (shelterId) => {
  return await shelterModel.findById(shelterId);
};

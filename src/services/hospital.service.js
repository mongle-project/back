import * as hospitalModel from "../models/hospital.model.js";

/**
 * 위치 기반 병원 검색
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @param {number} radius - 검색 반경 (미터)
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Object>} { data: 병원 목록, totalCount: 총 개수 }
 */
export const getHospitalsByLocation = async (latitude, longitude, radius, limit, offset) => {
  const data = await hospitalModel.findByLocation(latitude, longitude, radius, limit, offset);

  // 페이지네이션 사용 시 총 개수도 함께 반환
  if (limit !== undefined && offset !== undefined) {
    const totalCount = await hospitalModel.countByLocation(latitude, longitude, radius);
    return { data, totalCount };
  }

  return { data, totalCount: data.length };
};

/**
 * 도시/구 기반 병원 검색
 * @param {string} city - 도시명 (예: 서울)
 * @param {string} district - 구 이름 (예: 강남, 선택사항)
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Object>} { data: 병원 목록, totalCount: 총 개수 }
 */
export const getHospitalsByCity = async (city, district, limit, offset) => {
  const data = await hospitalModel.findByCity(city, district, limit, offset);

  // 페이지네이션 사용 시 총 개수도 함께 반환
  if (limit !== undefined && offset !== undefined) {
    const totalCount = await hospitalModel.countByCity(city, district);
    return { data, totalCount };
  }

  return { data, totalCount: data.length };
};

/**
 * 전체 병원 목록 조회
 * @param {number} limit - 페이지당 개수 (optional)
 * @param {number} offset - 건너뛸 개수 (optional)
 * @returns {Promise<Object>} { data: 병원 목록, totalCount: 총 개수 }
 */
export const getAllHospitals = async (limit, offset) => {
  const data = await hospitalModel.findAll(limit, offset);

  // 페이지네이션 사용 시 총 개수도 함께 반환
  if (limit !== undefined && offset !== undefined) {
    const totalCount = await hospitalModel.countAll();
    return { data, totalCount };
  }

  return { data, totalCount: data.length };
};

/**
 * 병원 상세 조회
 * @param {number} hospitalId - 병원 ID
 * @returns {Promise<Object|null>} 병원 정보 또는 null
 */
export const getHospitalById = async (hospitalId) => {
  return await hospitalModel.findById(hospitalId);
};

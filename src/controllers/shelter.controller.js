import * as shelterService from "../services/shelter.service.js";

/**
 * 보호소 목록 조회
 * GET /api/shelters
 * Query: ?lat=37.5&lng=127.0&radius=2000 (위치 기반)
 *        또는 ?keyword=강남 (키워드 검색)
 *        페이지네이션: ?limit=20&offset=0
 */
export const getShelters = async (req, res) => {
  try {
    const { lat, lng, radius, keyword, limit, offset } = req.query;

    // 페이지네이션 파라미터 처리
    const parsedLimit = limit ? parseInt(limit) : undefined;
    const parsedOffset = offset ? parseInt(offset) : undefined;

    // limit과 offset 유효성 검사
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit <= 0)) {
      return res.status(400).json({ message: "limit은 양수여야 합니다." });
    }
    if (parsedOffset !== undefined && (isNaN(parsedOffset) || parsedOffset < 0)) {
      return res.status(400).json({ message: "offset은 0 이상이어야 합니다." });
    }

    // 위치 기반 검색
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const searchRadius = radius ? parseInt(radius) : 5000; // 기본 5km

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "위도와 경도는 숫자여야 합니다." });
      }

      const { data, totalCount } = await shelterService.getSheltersByLocation(
        latitude,
        longitude,
        searchRadius,
        parsedLimit,
        parsedOffset
      );

      const response = {
        message: "보호소 목록 조회 성공",
        data,
      };

      // 페이지네이션 사용 시 pagination 정보 추가
      if (parsedLimit !== undefined && parsedOffset !== undefined) {
        response.pagination = {
          limit: parsedLimit,
          offset: parsedOffset,
          totalCount,
          hasNext: parsedOffset + data.length < totalCount,
        };
      } else {
        response.count = data.length;
      }

      return res.status(200).json(response);
    }

    // 키워드 검색
    if (keyword) {
      const { data, totalCount } = await shelterService.getSheltersByKeyword(
        keyword,
        parsedLimit,
        parsedOffset
      );

      const response = {
        message: "보호소 목록 조회 성공",
        data,
      };

      // 페이지네이션 사용 시 pagination 정보 추가
      if (parsedLimit !== undefined && parsedOffset !== undefined) {
        response.pagination = {
          limit: parsedLimit,
          offset: parsedOffset,
          totalCount,
          hasNext: parsedOffset + data.length < totalCount,
        };
      } else {
        response.count = data.length;
      }

      return res.status(200).json(response);
    }

    // 파라미터 없으면 전체 조회
    const { data, totalCount } = await shelterService.getAllShelters(
      parsedLimit,
      parsedOffset
    );

    const response = {
      message: "전체 보호소 목록 조회 성공",
      data,
    };

    // 페이지네이션 사용 시 pagination 정보 추가
    if (parsedLimit !== undefined && parsedOffset !== undefined) {
      response.pagination = {
        limit: parsedLimit,
        offset: parsedOffset,
        totalCount,
        hasNext: parsedOffset + data.length < totalCount,
      };
    } else {
      response.count = data.length;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("보호소 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 보호소 상세 조회
 * GET /api/shelters/:shelterId
 */
export const getShelterById = async (req, res) => {
  try {
    const { shelterId } = req.params;

    if (!shelterId || isNaN(parseInt(shelterId))) {
      return res.status(400).json({ message: "유효하지 않은 보호소 ID입니다." });
    }

    const shelter = await shelterService.getShelterById(parseInt(shelterId));

    if (!shelter) {
      return res.status(404).json({ message: "보호소를 찾을 수 없습니다." });
    }

    res.status(200).json({
      message: "보호소 상세 조회 성공",
      data: shelter,
    });
  } catch (error) {
    console.error("보호소 상세 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

import * as hospitalService from "../services/hospital.service.js";

/**
 * 병원 목록 조회
 * GET /api/hospitals
 * Query: ?lat=37.5&lng=127.0&radius=2000 (위치 기반)
 *        또는 ?city=서울&district=강남 (도시 기반)
 *        페이지네이션: ?limit=20&offset=0
 */
export const getHospitals = async (req, res) => {
  try {
    const { lat, lng, radius, city, district, limit, offset } = req.query;

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

      const { data, totalCount } = await hospitalService.getHospitalsByLocation(
        latitude,
        longitude,
        searchRadius,
        parsedLimit,
        parsedOffset
      );

      const response = {
        message: "병원 목록 조회 성공",
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

    // 도시 기반 검색
    if (city) {
      const { data, totalCount } = await hospitalService.getHospitalsByCity(
        city,
        district,
        parsedLimit,
        parsedOffset
      );

      const response = {
        message: "병원 목록 조회 성공",
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
    const { data, totalCount } = await hospitalService.getAllHospitals(
      parsedLimit,
      parsedOffset
    );

    const response = {
      message: "전체 병원 목록 조회 성공",
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
    console.error("병원 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 병원 상세 조회
 * GET /api/hospitals/:hospitalId
 */
export const getHospitalById = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    if (!hospitalId || isNaN(parseInt(hospitalId))) {
      return res.status(400).json({ message: "유효하지 않은 병원 ID입니다." });
    }

    const hospital = await hospitalService.getHospitalById(parseInt(hospitalId));

    if (!hospital) {
      return res.status(404).json({ message: "병원을 찾을 수 없습니다." });
    }

    res.status(200).json({
      message: "병원 상세 조회 성공",
      data: hospital,
    });
  } catch (error) {
    console.error("병원 상세 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

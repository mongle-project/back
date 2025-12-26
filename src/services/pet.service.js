import * as petModel from "../models/pet.model.js";
import * as s3Service from "./s3.service.js";

// 유효한 species 목록
const VALID_SPECIES = [
  "dog",
  "cat",
  "rabbit",
  "hamster",
  "guineapig",
  "bird",
  "fish",
  "reptile",
  "turtle",
];

/**
 * 반려동물 프로필 등록
 * @param {number} userId - 사용자 ID
 * @param {Object} petData - { name, gender, species, feature, birthDay }
 * @param {Object} imageFile - multer file object (optional)
 * @returns {Promise<Object>} 생성된 반려동물 정보
 */
export const createPet = async (userId, petData, imageFile) => {
  // species 유효성 검증
  if (!VALID_SPECIES.includes(petData.species.toLowerCase())) {
    throw new Error(`유효하지 않은 동물 종류입니다: ${petData.species}`);
  }

  let imgUrl = null;

  try {
    // 이미지 업로드 (선택사항)
    console.log('[Pet Service] imageFile 존재 여부:', !!imageFile);
    if (imageFile) {
      console.log('[Pet Service] 이미지 업로드 시작:', imageFile.originalname);
      imgUrl = await s3Service.uploadToS3(imageFile, userId);
      console.log('[Pet Service] 이미지 업로드 완료:', imgUrl);
    } else {
      console.log('[Pet Service] 이미지 파일이 제공되지 않음');
    }

    // DB에 반려동물 정보 저장
    const petId = await petModel.insertPet({
      userId,
      name: petData.name,
      gender: petData.gender,
      species: petData.species.toLowerCase(),
      feature: petData.feature || null,
      birthDay: petData.birthDay,
      imgUrl,
    });

    // 생성된 반려동물 정보 조회
    const createdPet = await petModel.findPetById(petId);
    return createdPet;
  } catch (error) {
    // DB 저장 실패 시 S3 이미지 정리 (rollback)
    if (imgUrl) {
      await s3Service.deleteFromS3(imgUrl).catch((err) => {
        console.error("[Pet Service] S3 cleanup 실패:", err);
      });
    }
    throw error;
  }
};

/**
 * 사용자의 반려동물 목록 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} 반려동물 목록
 */
export const getPetsByUserId = async (userId) => {
  return await petModel.findPetsByUserId(userId);
};

/**
 * 반려동물 상세 조회 (ownership 검증 포함)
 * @param {number} petId - 반려동물 ID
 * @param {number} requestingUserId - 요청 사용자 ID
 * @returns {Promise<Object|null>} 반려동물 정보 또는 null
 */
export const getPetById = async (petId, requestingUserId) => {
  const pet = await petModel.findPetById(petId);

  if (!pet) {
    return null;
  }

  // Ownership 검증
  if (pet.user_id !== requestingUserId) {
    throw new Error("권한이 없습니다.");
  }

  return pet;
};

/**
 * 반려동물 프로필 수정 (ownership 검증 포함)
 * @param {number} petId - 반려동물 ID
 * @param {number} requestingUserId - 요청 사용자 ID
 * @param {Object} updates - 업데이트할 필드
 * @param {Object} newImageFile - 새 이미지 파일 (optional)
 * @param {boolean} removeImage - 이미지 삭제 여부 (optional)
 * @returns {Promise<Object>} 수정된 반려동물 정보
 */
export const updatePet = async (petId, requestingUserId, updates, newImageFile, removeImage = false) => {
  // 기존 반려동물 조회 및 ownership 검증
  const existingPet = await petModel.findPetById(petId);

  if (!existingPet) {
    throw new Error("반려동물을 찾을 수 없습니다.");
  }

  if (existingPet.user_id !== requestingUserId) {
    throw new Error("권한이 없습니다.");
  }

  let oldImageUrl = existingPet.img_url;

  try {
    // 이미지 삭제 요청
    if (removeImage && !newImageFile) {
      updates.img_url = null;

      // 기존 이미지 삭제
      if (oldImageUrl) {
        await s3Service.deleteFromS3(oldImageUrl).catch((err) => {
          console.error("[Pet Service] 기존 이미지 삭제 실패:", err);
        });
      }
    }
    // 새 이미지 업로드
    else if (newImageFile) {
      const newImageUrl = await s3Service.uploadToS3(newImageFile, requestingUserId);
      updates.img_url = newImageUrl;

      // 기존 이미지 삭제
      if (oldImageUrl) {
        await s3Service.deleteFromS3(oldImageUrl).catch((err) => {
          console.error("[Pet Service] 기존 이미지 삭제 실패:", err);
        });
      }
    }

    // species가 있으면 소문자로 변환
    if (updates.species) {
      if (!VALID_SPECIES.includes(updates.species.toLowerCase())) {
        throw new Error(`유효하지 않은 동물 종류입니다: ${updates.species}`);
      }
      updates.species = updates.species.toLowerCase();
    }

    // DB 업데이트
    await petModel.updatePet(petId, updates);

    // 업데이트된 반려동물 정보 반환
    const updatedPet = await petModel.findPetById(petId);
    return updatedPet;
  } catch (error) {
    // 새 이미지 업로드 후 DB 업데이트 실패 시 새 이미지 정리
    if (newImageFile && updates.img_url) {
      await s3Service.deleteFromS3(updates.img_url).catch((err) => {
        console.error("[Pet Service] 새 이미지 cleanup 실패:", err);
      });
    }
    throw error;
  }
};

/**
 * 반려동물 프로필 삭제 (ownership 검증 포함)
 * @param {number} petId - 반려동물 ID
 * @param {number} requestingUserId - 요청 사용자 ID
 * @returns {Promise<void>}
 */
export const deletePet = async (petId, requestingUserId) => {
  // 기존 반려동물 조회 및 ownership 검증
  const existingPet = await petModel.findPetById(petId);

  if (!existingPet) {
    throw new Error("반려동물을 찾을 수 없습니다.");
  }

  if (existingPet.user_id !== requestingUserId) {
    throw new Error("권한이 없습니다.");
  }

  // S3 이미지 삭제
  if (existingPet.img_url) {
    await s3Service.deleteFromS3(existingPet.img_url).catch((err) => {
      console.error("[Pet Service] S3 이미지 삭제 실패:", err);
    });
  }

  // DB에서 삭제
  await petModel.deletePet(petId);
};

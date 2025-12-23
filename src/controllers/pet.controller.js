import * as petService from "../services/pet.service.js";

/**
 * 반려동물 프로필 등록
 * POST /api/pets
 */
export const createPetProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // authMiddleware에서 주입된 userId
    const { name, species, birthday, gender, feature } = req.body;
    const imageFile = req.file; // multer upload.single("imageFile")

    console.log('[Pet Controller] req.file:', req.file);
    console.log('[Pet Controller] req.body:', req.body);

    // 필수 필드 검증
    if (!name || !species || !birthday || !gender) {
      return res.status(400).json({
        message: "필수 항목을 모두 입력해주세요. (name, species, birthday, gender)",
      });
    }

    // 필드 매핑: birthday → birthDay
    const petData = {
      name: name.trim(),
      species: species.trim(),
      birthDay: birthday,
      gender,
      feature: feature?.trim() || null,
    };

    const createdPet = await petService.createPet(userId, petData, imageFile);

    res.status(201).json({
      message: "반려동물 프로필이 등록되었습니다.",
      data: createdPet,
    });
  } catch (error) {
    console.error("반려동물 등록 오류:", error);

    // 유효성 검증 에러
    if (error.message.includes("유효하지 않은")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 내 반려동물 목록 조회
 * GET /api/pets
 */
export const getPetList = async (req, res) => {
  try {
    const userId = req.user.userId;

    const pets = await petService.getPetsByUserId(userId);

    res.status(200).json({
      message: "반려동물 목록 조회 성공",
      count: pets.length,
      data: pets,
    });
  } catch (error) {
    console.error("반려동물 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 반려동물 상세 조회
 * GET /api/pets/:petId
 */
export const getPetDetail = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.userId;

    // petId 숫자 검증
    if (!petId || isNaN(parseInt(petId))) {
      return res.status(400).json({ message: "유효하지 않은 반려동물 ID입니다." });
    }

    const pet = await petService.getPetById(parseInt(petId), userId);

    if (!pet) {
      return res.status(404).json({ message: "반려동물을 찾을 수 없습니다." });
    }

    res.status(200).json({
      message: "반려동물 상세 조회 성공",
      data: pet,
    });
  } catch (error) {
    console.error("반려동물 상세 조회 오류:", error);

    // Ownership 에러
    if (error.message.includes("권한이 없습니다")) {
      return res.status(403).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 반려동물 프로필 수정
 * PUT /api/pets/:petId
 */
export const updatePetProfile = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.userId;
    const { name, species, birthday, gender, feature } = req.body;
    const imageFile = req.file;

    // petId 숫자 검증
    if (!petId || isNaN(parseInt(petId))) {
      return res.status(400).json({ message: "유효하지 않은 반려동물 ID입니다." });
    }

    // 업데이트할 필드만 객체에 포함
    const updates = {};
    if (name) updates.name = name.trim();
    if (species) updates.species = species.trim();
    if (birthday) updates.birth_day = birthday; // 필드 매핑
    if (gender) updates.gender = gender;
    if (feature !== undefined) updates.feature = feature?.trim() || null;

    const updatedPet = await petService.updatePet(parseInt(petId), userId, updates, imageFile);

    res.status(200).json({
      message: "반려동물 프로필이 수정되었습니다.",
      data: updatedPet,
    });
  } catch (error) {
    console.error("반려동물 수정 오류:", error);

    // Ownership 에러
    if (error.message.includes("권한이 없습니다")) {
      return res.status(403).json({ message: error.message });
    }

    // Not found 에러
    if (error.message.includes("찾을 수 없습니다")) {
      return res.status(404).json({ message: error.message });
    }

    // 유효성 검증 에러
    if (error.message.includes("유효하지 않은")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 반려동물 프로필 삭제
 * DELETE /api/pets/:petId
 */
export const deletePetProfile = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.userId;

    // petId 숫자 검증
    if (!petId || isNaN(parseInt(petId))) {
      return res.status(400).json({ message: "유효하지 않은 반려동물 ID입니다." });
    }

    await petService.deletePet(parseInt(petId), userId);

    res.status(200).json({
      message: "반려동물 프로필이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("반려동물 삭제 오류:", error);

    // Ownership 에러
    if (error.message.includes("권한이 없습니다")) {
      return res.status(403).json({ message: error.message });
    }

    // Not found 에러
    if (error.message.includes("찾을 수 없습니다")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

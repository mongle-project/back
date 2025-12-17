import * as healthService from '../services/health.service.js';

/**
 * AI 건강 상담
 * POST /api/health/consult
 */
export const consultPetHealth = async (req, res) => {
  try {
    const consultData = req.body;

    // 필수 필드 검증
    const requiredFields = ['animalType', 'breed', 'age', 'gender', 'consultContent'];
    const missingFields = requiredFields.filter(field => !consultData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`
      });
    }

    // GPT API를 통한 상담 응답 생성
    const aiResponse = await healthService.getAIConsultation(consultData);

    res.status(200).json({
      message: '상담이 완료되었습니다.',
      data: {
        consultData,
        aiResponse
      }
    });

  } catch (error) {
    console.error('AI 상담 오류:', error);
    res.status(500).json({
      message: 'AI 상담 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

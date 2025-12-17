import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GPT API를 통한 반려동물 건강 상담
 */
export const getAIConsultation = async (consultData) => {
  const {
    animalType,
    breed,
    age,
    weight,
    gender,
    existingDiseases,
    medications,
    consultContent,
  } = consultData;

  // 배열을 문자열로 변환 (existingDiseases 처리)
  const diseasesText =
    existingDiseases && existingDiseases.length > 0
      ? existingDiseases.join(", ")
      : null;

  // GPT에게 전달할 프롬프트 구성
  const systemPrompt = `당신은 반려동물 건강 상담 전문가입니다.
반려동물의 건강 상태에 대해 전문적이고 친절하게 조언해주세요.
답변은 한국어로 작성하며, 다음 구조로 작성해주세요:
1. 증상 분석
2. 가능한 원인
3. 권장 조치사항
4. 주의사항

단, 이것은 참고용 정보이며 정확한 진단은 수의사의 진료가 필요함을 명시해주세요.`;

  const userPrompt = `
반려동물 정보:
- 동물 종류: ${animalType}
- 품종: ${breed}
- 나이: ${age}
${weight ? `- 체중: ${weight}` : ""}
- 성별: ${gender}
${diseasesText ? `- 기존 질병: ${diseasesText}` : ""}
${medications ? `- 복용 중인 약/영양제: ${medications}` : ""}

상담 내용:
${consultContent}

위 정보를 바탕으로 전문적인 건강 상담을 제공해주세요.
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API 오류:", error);
    throw new Error("AI 상담 생성 중 오류가 발생했습니다.");
  }
};

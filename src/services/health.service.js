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
답변은 한국어로 작성하며, 구조화된 형식으로 제공해야 합니다.`;

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
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pet_health_consultation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              subtitle1: {
                type: "string",
                description: "첫 번째 섹션 제목 (예: 증상 분석)",
              },
              text1: {
                type: "string",
                description: "첫 번째 섹션 내용",
              },
              subtitle2: {
                type: "string",
                description: "두 번째 섹션 제목 (예: 가능한 원인)",
              },
              text2: {
                type: "string",
                description: "두 번째 섹션 내용",
              },
              subtitle3: {
                type: "string",
                description: "세 번째 섹션 제목 (예: 권장 조치사항)",
              },
              text3: {
                type: "string",
                description: "세 번째 섹션 내용",
              },
              subtitle4: {
                type: "string",
                description: "네 번째 섹션 제목 (예: 주의사항)",
              },
              text4: {
                type: "string",
                description:
                  "네 번째 섹션 내용 - 이것은 참고용 정보이며 정확한 진단은 수의사의 진료가 필요함을 포함",
              },
            },
            required: [
              "subtitle1",
              "text1",
              "subtitle2",
              "text2",
              "subtitle3",
              "text3",
              "subtitle4",
              "text4",
            ],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.7,
    });

    // JSON 문자열 파싱
    const aiResponse = JSON.parse(completion.choices[0].message.content);
    return aiResponse;
  } catch (error) {
    console.error("OpenAI API 오류:", error);
    throw new Error("AI 상담 생성 중 오류가 발생했습니다.");
  }
};

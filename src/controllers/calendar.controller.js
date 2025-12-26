import * as calendarService from "../services/calendar.service.js";

/**
 * 일정 등록
 * POST /api/calendar-events
 */
export const createEvent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { petId, title, category, date, startTime, completed } = req.body;

    // 필수 필드 검증
    if (!title || !date) {
      return res.status(400).json({
        message: "필수 항목을 모두 입력해주세요. (title, date)",
      });
    }

    if (!category) {
      return res.status(400).json({
        message: "카테고리를 선택해주세요.",
      });
    }

    const eventData = {
      petProfileId: petId || null,
      title,
      category,
      eventDate: date,
      eventTime: startTime || null,
      isComplete: completed || false,
    };

    const createdEvent = await calendarService.createEvent(userId, eventData);

    res.status(201).json({
      message: "일정이 등록되었습니다.",
      data: createdEvent,
    });
  } catch (error) {
    console.error("일정 등록 오류:", error);

    if (error.message.includes("필수") || error.message.includes("유효하지")) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message.includes("권한")) {
      return res.status(403).json({ message: error.message });
    }

    if (error.message.includes("존재하지 않는")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 월별 일정 조회
 * GET /api/calendar-events?year=2025&month=12
 */
export const getEventsByMonth = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year, month } = req.query;

    // year, month 파라미터 검증
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);

    if (!year || !month || isNaN(parsedYear) || isNaN(parsedMonth)) {
      return res.status(400).json({
        message: "year와 month 파라미터가 필요합니다.",
      });
    }

    if (parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({
        message: "month는 1-12 사이의 값이어야 합니다.",
      });
    }

    const events = await calendarService.getEventsByMonth(
      userId,
      parsedYear,
      parsedMonth
    );

    res.status(200).json({
      message: "월별 일정 조회 성공",
      year: parsedYear,
      month: parsedMonth,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("월별 일정 조회 오류:", error);

    if (error.message.includes("유효하지 않은")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 일정 상세 조회
 * GET /api/calendar-events/:eventId
 */
export const getEventDetail = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    // eventId 숫자 검증
    const parsedEventId = parseInt(eventId, 10);
    if (isNaN(parsedEventId)) {
      return res.status(400).json({
        message: "유효하지 않은 일정 ID입니다.",
      });
    }

    const event = await calendarService.getEventById(parsedEventId, userId);

    res.status(200).json({
      message: "일정 상세 조회 성공",
      data: event,
    });
  } catch (error) {
    console.error("일정 상세 조회 오류:", error);

    if (error.message.includes("존재하지 않는")) {
      return res.status(404).json({ message: error.message });
    }

    if (error.message.includes("권한")) {
      return res.status(403).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 일정 수정
 * PATCH /api/calendar-events/:eventId
 */
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;
    const { petId, title, category, date, startTime, completed } = req.body;

    // eventId 숫자 검증
    const parsedEventId = parseInt(eventId, 10);
    if (isNaN(parsedEventId)) {
      return res.status(400).json({
        message: "유효하지 않은 일정 ID입니다.",
      });
    }

    // 프론트엔드 필드명을 서비스 레이어 필드명으로 매핑
    const updateData = {};
    if (petId !== undefined) updateData.petProfileId = petId;
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.eventDate = date;
    if (startTime !== undefined) updateData.eventTime = startTime;
    if (completed !== undefined) updateData.isComplete = completed;

    const updatedEvent = await calendarService.updateEvent(
      parsedEventId,
      userId,
      updateData
    );

    res.status(200).json({
      message: "일정이 수정되었습니다.",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("일정 수정 오류:", error);

    if (error.message.includes("수정할 내용이 없습니다")) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message.includes("존재하지 않는")) {
      return res.status(404).json({ message: error.message });
    }

    if (error.message.includes("권한")) {
      return res.status(403).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 일정 삭제
 * DELETE /api/calendar-events/:eventId
 */
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    // eventId 숫자 검증
    const parsedEventId = parseInt(eventId, 10);
    if (isNaN(parsedEventId)) {
      return res.status(400).json({
        message: "유효하지 않은 일정 ID입니다.",
      });
    }

    await calendarService.deleteEvent(parsedEventId, userId);

    res.status(200).json({
      message: "일정이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("일정 삭제 오류:", error);

    if (error.message.includes("존재하지 않는")) {
      return res.status(404).json({ message: error.message });
    }

    if (error.message.includes("권한")) {
      return res.status(403).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

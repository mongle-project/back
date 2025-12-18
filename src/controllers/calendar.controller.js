import calenderService from "../services/calendar.service.js";

const createEvent = async (req, res) => {
  try {
    const eventId = await calenderService.createEvent(req.body);
    res.status(201).json({ success: true, eventId });
  } catch (e) {
    res.status(500).json({ success: false, messagge: e.message });
  }
};

const getPetEvents = async (req, res) => {
  try {
    const { petId } = req.params;
    const events = await calenderService.getPetEvents(petId);
    res.json({ success: true, data: events });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    await calenderService.deleteEvent(eventId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.messge });
  }
};

export default {
  createEvent,
  getPetEvents,
  deleteEvent,
};

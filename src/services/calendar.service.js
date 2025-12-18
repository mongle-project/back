import calenderModel from "../models/calendar.model.js";

const createEvent = async (data) => {
  if (!data.pet_id || !data.title || !data.event_data)
    throw new Error("Missing fields");

  return await calenderModel.createEvent(data);
};

const getPetEvents = async (petId) => {
  return await calenderModel.getEventsByPet(petId);
};

const deleteEvent = async (eventId) => {
  await calenderModel.deleteEvent(eventId);
};

export default {
  createEvent,
  getPetEvents,
  deleteEvent,
};

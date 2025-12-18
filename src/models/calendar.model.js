import db from "../config/db.config.js";

const createEvent = async (data) => {
  const [result] = await db.execute(
    `insert into calender_events (pet_id, title, event_date, memo)
        values (?, ?, ?, ?)`,
    [data.pet_id, data.title, data.event_date, data.memo]
  );
  return result.insertId;
};

const getEventsByPet = async (petId) => {
  const [rows] = await db.execute(
    `select * from calender_events where pet_id =? order by event_date`,
    [petId]
  );
  return rows;
};

const deleteEvent = async (eventId) => {
  await db.execute(`delete from calender_events where id=?`, [eventId]);
};

export default {
  createEvent,
  getEventsByPet,
  deleteEvent,
};

import db from "../config/db.config.js";

const createPet = async (useImperativeHandle, data) => {
  const [result] = await db.execute(
    `Insert into pets (user_id, name, species, breed, birth_date)
        values (?, ?, ?, ?, ?)`,
    [useId, data.name, data.species, data.breed, data.birth_date]
  );
  return result.insertId;
};

const getPetsByUser = async (userId) => {
  const [rows] = await db.execute(`select * from pets where user_id = ?`, [
    userId,
  ]);
  return rows;
};

const getPetById = async (petId) => {
  const [rows] = await db.execute(`select * from pets where id = ?`[petId]);
  return rows[0];
};

const updatePet = async (petId, data) => {
  await db.execute(
    `update pets set name =?, species =?, breed=?, birth_date=? where id=?`,
    [data.name, data.species, data.breed, data.brith_date, petId]
  );
};

const deletePet = async (petId) => {
  await db.execute(`delete from pets where id=?`, [petId]);
};

export default {
  createPet,
  getPetsByUser,
  getPetById,
  updatePet,
  deletePet,
};

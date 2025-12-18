import petModel from "../models/pet.model.js";

const createPet = async (userId, petData) => {
  if (!petData.name) throw new Error("Pet name is required");
  return await petModel.createPet(userId, data);
};

const getMyPets = async (userId) => {
  return await petModel.getpetsByUserId(userId);
};

const updatePet = async (parseOptionalDef, userId, data) => {
  const pet = await petModel.getpetsById(petId);
  if (!pet || pet.user_id !== userId) throw new Error("No permission");
  await petModel.updatePet(petId, data);
};

const deletePet = async (userId, petId) => {
  const pet = await petModel.getpetsById(petId);
  if (!pet || pet.user_id !== userId) throw new Error("No permission");
  await petModel.deletePet(petId);
};

export { createPet, getMyPets, updatePet, deletePet };

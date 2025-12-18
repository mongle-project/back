import * as petService from "../services/pet.service.js";

const createPet = async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = await petService.createPet(userId, req.body);
    res.status(201).json({ success: true, petId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMyPets = async (req, res) => {
  try {
    const userId = req.user.id;
    const pets = await petService.getMyPets(userId);
    res.status(200).json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updatePet = async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = req.params.petid;
    await petService.updatePet(userId, petId, req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = req.params.petid;
    await petService.deletePet(userId, petId);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export { createPet, getMyPets, updatePet, deletePet };

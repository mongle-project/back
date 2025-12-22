import * as petService from "../services/pet.service.js";

const createPet = async (req, res) => {
  try {
    // const userId = req.user.id;
    // const petId = await petService.createPet(userId, req.body);
    res.status(200).json({ messsage: "success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
const getMyPets = async (req, res) => {
  try {
    // const userId = req.user.id;
    // const pets = await petService.getMyPets(userId);
    res.status(200).json({ messsage: "success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const updatePet = async (req, res) => {
  try {
    // const userId = req.user.id;
    // const petId = req.params.petid;
    // await petService.updatePet(userId, petId, req.body);
    res.status(200).json({ messsage: "success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deletePet = async (req, res) => {
  try {
    // const userId = req.user.id;
    // const petId = req.params.petid;
    // await petService.deletePet(userId, petId);
    res.status(200).json({ messsage: "success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createPet, getMyPets, updatePet, deletePet };

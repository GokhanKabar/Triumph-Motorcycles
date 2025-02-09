import express from "express";
import { Request, Response } from "express";
import MotorcycleModel from "../../../infrastructure/frameworks/postgres/models/MotorcycleModel";
import { PostgreSQLMotorcycleRepository } from "../../../infrastructure/repositories/PostgreSQLMotorcycleRepository";
import { Op } from "sequelize";

const router = express.Router();

// Création du repository de motos
const motorcycleRepository = new PostgreSQLMotorcycleRepository();

// Routes publiques
router.get("/", async (req: Request, res: Response) => {
  try {
    const { concessionId } = req.query;
    
    const whereCondition = concessionId 
      ? { concessionId: concessionId as string }
      : {};

    const motorcycles = await MotorcycleModel.findAll({
      where: whereCondition,
      attributes: ['id', 'brand', 'model', 'concessionId']
    });
    
    res.json(motorcycles);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des motos" });
  }
});

// GET /api/motorcycles/:id - Récupérer une moto par son ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const motorcycle = await MotorcycleModel.findByPk(req.params.id);
    if (!motorcycle) {
      return res.status(404).json({ message: "Moto non trouvée" });
    }
    res.json(motorcycle);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la moto" });
  }
});

// POST /api/motorcycles - Créer une nouvelle moto
router.post("/", async (req: Request, res: Response) => {
  try {
    const newMotorcycle = await MotorcycleModel.create(req.body);
    res.status(201).json(newMotorcycle);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la moto" });
  }
});

// PUT /api/motorcycles/:id - Mettre à jour une moto
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const [updated] = await MotorcycleModel.update(req.body, {
      where: { id: req.params.id }
    });

    if (updated) {
      const updatedMotorcycle = await MotorcycleModel.findByPk(req.params.id);
      return res.json(updatedMotorcycle);
    }

    throw new Error('Moto non trouvée');
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de la moto" });
  }
});

// DELETE /api/motorcycles/:id - Supprimer une moto
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await MotorcycleModel.destroy({
      where: { id: req.params.id }
    });

    if (deleted) {
      return res.status(204).send();
    }

    return res.status(404).json({ message: "Moto non trouvée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la moto" });
  }
});

export default router;

import express from "express";
import { Request, Response } from "express";
import MotorcycleModel from "../../../infrastructure/frameworks/postgres/models/MotorcycleModel";
import CompanyMotorcycleModel from "../../../infrastructure/frameworks/postgres/models/CompanyMotorcycleModel";
import ConcessionModel from "../../../infrastructure/frameworks/postgres/models/ConcessionModel";
import UserModel from "../../../infrastructure/frameworks/postgres/models/UserModel";
import { PostgreSQLMotorcycleRepository } from "../../../infrastructure/repositories/PostgreSQLMotorcycleRepository";
import { Op } from "sequelize";
import { UserRole } from "../../../domain/enums/UserRole";

const router = express.Router();

// Création du repository de motos
const motorcycleRepository = new PostgreSQLMotorcycleRepository();

// Route pour récupérer les motos non assignées
router.get("/unassigned", async (req: Request, res: Response) => {
  try {
    // Récupérer les IDs des motos qui sont assignées à des entreprises
    const assignedMotorcycleIds = await CompanyMotorcycleModel.findAll({
      attributes: ['motorcycleId'],
      raw: true
    }).then(results => results.map(result => result.motorcycleId));

    // Récupérer toutes les motos qui ne sont pas dans la liste des motos assignées
    const unassignedMotorcycles = await MotorcycleModel.findAll({
      where: {
        id: {
          [Op.notIn]: assignedMotorcycleIds
        }
      },
      attributes: [
        "id",
        "brand",
        "model",
        "year",
        "vin",
        "mileage",
        "status",
        "concessionId",
        "createdAt",
        "updatedAt",
      ],
    });

    res.json(unassignedMotorcycles);
  } catch (error) {
    console.error('Erreur lors de la récupération des motos non assignées:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des motos non assignées",
    });
  }
});

// Routes publiques
router.get("/", async (req: Request, res: Response) => {
  try {
    const { concessionId, userId } = req.query;

    let whereCondition: any = {};

    if (userId) {
      // Vérifier si l'utilisateur est un DEALER
      const user = await UserModel.findOne({
        where: { id: userId as string },
        attributes: ['id', 'role']
      });

      if (user?.role === UserRole.DEALER) {
        // Pour un DEALER, récupérer sa concession
        const dealerConcession = await ConcessionModel.findOne({
          where: { userId: user.id },
          attributes: ['id']
        });

        if (dealerConcession) {
          whereCondition.concessionId = dealerConcession.id;
        } else {
          // Si le dealer n'a pas de concession, retourner un tableau vide
          return res.json([]);
        }
      }
    } else if (concessionId) {
      // Pour les autres rôles ou si pas d'userId, utiliser le concessionId s'il est fourni
      whereCondition.concessionId = concessionId;
    }

    const motorcycles = await MotorcycleModel.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "brand",
        "model",
        "year",
        "vin",
        "mileage",
        "status",
        "concessionId",
        "createdAt",
        "updatedAt",
      ],
    });

    res.json(motorcycles);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des motos" });
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
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la moto" });
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
      where: { id: req.params.id },
    });

    if (updated) {
      const updatedMotorcycle = await MotorcycleModel.findByPk(req.params.id);
      return res.json(updatedMotorcycle);
    }

    throw new Error("Moto non trouvée");
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la moto" });
  }
});

// DELETE /api/motorcycles/:id - Supprimer une moto
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await MotorcycleModel.destroy({
      where: { id: req.params.id },
    });

    if (deleted) {
      return res.status(204).send();
    }

    return res.status(404).json({ message: "Moto non trouvée" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la moto" });
  }
});

export default router;

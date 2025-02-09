import { IMotorcycleRepository } from "../../domain/motorcycle/repositories/IMotorcycleRepository";
import Motorcycle from "../../domain/motorcycle/entities/Motorcycle";
import MotorcycleModel from "../frameworks/postgres/models/MotorcycleModel";
import MaintenanceModel from "../frameworks/postgres/models/MaintenanceModel";
import { sequelize } from "../frameworks/postgres/config/database";
import { MotorcycleStatus } from "../../domain/motorcycle/enums/MotorcycleStatus";

export class PostgreSQLMotorcycleRepository implements IMotorcycleRepository {
  private toMotorcycle(motorcycle: MotorcycleModel): Motorcycle {
    console.log('DEBUG: Conversion du modèle de moto:', {
      id: motorcycle.id,
      brand: motorcycle.brand,
      status: motorcycle.status,
      rawStatus: motorcycle.getDataValue('status'),
      statusType: typeof motorcycle.status,
      stackTrace: new Error().stack
    });

    // Forcer le statut par défaut si undefined ou null
    const safeStatus = motorcycle.status || MotorcycleStatus.AVAILABLE;

    console.log('DEBUG: Statut final de la moto:', {
      safeStatus,
      isDefault: safeStatus === MotorcycleStatus.AVAILABLE
    });

    // Validation supplémentaire du statut
    if (!Object.values(MotorcycleStatus).includes(safeStatus)) {
      console.warn('DEBUG: Statut de moto invalide, utilisation du statut par défaut', {
        invalidStatus: safeStatus,
        defaultStatus: MotorcycleStatus.AVAILABLE
      });
      safeStatus = MotorcycleStatus.AVAILABLE;
    }

    return new Motorcycle(
      motorcycle.id,
      motorcycle.brand,
      motorcycle.model,
      motorcycle.year,
      motorcycle.vin,
      motorcycle.mileage,
      safeStatus,
      motorcycle.concessionId,
      motorcycle.createdAt,
      motorcycle.updatedAt
    );
  }
  async findAll(): Promise<Motorcycle[]> {
    try {
      console.log("DEBUG: Récupération de toutes les motos");
      const motorcycles = await MotorcycleModel.findAll();
      
      // Log détaillé des statuts
      const statusCounts = motorcycles.reduce((acc, moto) => {
        console.log('DEBUG: Statut de moto individuel:', {
          id: moto.id,
          status: moto.status,
          rawStatus: moto.getDataValue('status'),
          statusType: typeof moto.status
        });
        
        acc[moto.status] = (acc[moto.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("DEBUG: Répartition des statuts de motos:", JSON.stringify(statusCounts, null, 2));
      
      return motorcycles.map(this.toMotorcycle.bind(this));
    } catch (error) {
      console.error("DEBUG: Erreur lors de la récupération des motos:", error);
      throw error;
    }
  }

  async findById(id: string): Promise<Motorcycle | null> {
    try {
      console.log("DEBUG: Recherche de la moto avec ID:", id);
      const motorcycle = await MotorcycleModel.findByPk(id);
      if (!motorcycle) {
        console.log("DEBUG: Moto non trouvée");
        return null;
      }

      return this.toMotorcycle(motorcycle);
    } catch (error) {
      console.error("DEBUG: Erreur lors de la recherche de la moto:", error);
      throw error;
    }
  }

  async findByConcessionId(concessionId: string): Promise<Motorcycle[]> {
    try {
      console.log(
        "DEBUG: Recherche des motos pour la concession:",
        concessionId
      );
      const motorcycles = await MotorcycleModel.findAll({
        where: { concessionId },
      });

      return motorcycles.map(this.toMotorcycle.bind(this));
    } catch (error) {
      console.error("DEBUG: Erreur lors de la recherche des motos:", error);
      throw error;
    }
  }

  async save(motorcycle: Motorcycle): Promise<void> {
    try {
      console.log("DEBUG: Sauvegarde d'une nouvelle moto:", motorcycle);
      await MotorcycleModel.create({
        id: motorcycle.id,
        brand: motorcycle.brand,
        model: motorcycle.model,
        year: motorcycle.year,
        vin: motorcycle.vin,
        mileage: motorcycle.mileage,
        status: motorcycle.status,
        concessionId: motorcycle.concessionId,
        createdAt: motorcycle.createdAt,
        updatedAt: motorcycle.updatedAt,
      });
      console.log("DEBUG: Moto sauvegardée avec succès");
    } catch (error) {
      console.error("DEBUG: Erreur lors de la sauvegarde de la moto:", error);
      throw error;
    }
  }

  async update(motorcycle: Motorcycle): Promise<void> {
    try {
      console.log("DEBUG: Mise à jour de la moto:", motorcycle);
      await MotorcycleModel.update(
        {
          brand: motorcycle.brand,
          model: motorcycle.model,
          year: motorcycle.year,
          vin: motorcycle.vin,
          color: motorcycle.color,
          mileage: motorcycle.mileage,
          status: motorcycle.status,
          concessionId: motorcycle.concessionId,
          updatedAt: motorcycle.updatedAt,
        },
        {
          where: { id: motorcycle.id },
        }
      );
      console.log("DEBUG: Moto mise à jour avec succès");
    } catch (error) {
      console.error("DEBUG: Erreur lors de la mise à jour de la moto:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const transaction = await sequelize.transaction();
    
    try {
      console.log("DEBUG: Vérification des maintenances pour la moto:", id);
      
      // Vérifier si la moto a des maintenances
      const maintenances = await MaintenanceModel.findAll({
        where: { motorcycleId: id }
      });

      if (maintenances.length > 0) {
        throw new Error('Impossible de supprimer cette moto car elle a des maintenances associées');
      }

      // Si pas de maintenances, supprimer la moto
      await MotorcycleModel.destroy({
        where: { id },
        transaction
      });

      await transaction.commit();
      console.log("DEBUG: Moto supprimée avec succès");
    } catch (error) {
      await transaction.rollback();
      console.error("DEBUG: Erreur lors de la suppression de la moto:", error);
      throw error;
    }
  }

  async count(): Promise<number> {
    return await MotorcycleModel.count();
  }
}

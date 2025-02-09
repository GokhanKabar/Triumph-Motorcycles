import { IMaintenanceRepository } from '../../domain/maintenance/repositories/IMaintenanceRepository';
import Maintenance, { MaintenanceType, MaintenanceStatus } from '../../domain/maintenance/entities/Maintenance';
import { MaintenanceNotFoundError } from '../../domain/maintenance/errors/MaintenanceNotFoundError';
import { MaintenanceValidationError } from '../../domain/maintenance/errors/MaintenanceValidationError';
import MaintenanceModel from '../frameworks/postgres/models/MaintenanceModel';
import MotorcycleModel from '../frameworks/postgres/models/MotorcycleModel';
import { Op } from 'sequelize';

export class PostgreSQLMaintenanceRepository implements IMaintenanceRepository {
  private parseReplacedParts(replacedParts: any): string[] | undefined {
    if (!replacedParts) return undefined;

    try {
      // Si c'est déjà un tableau, le retourner tel quel
      if (Array.isArray(replacedParts)) {
        return replacedParts;
      }

      // Si c'est une chaîne, essayer de parser comme JSON
      if (typeof replacedParts === 'string') {
        // Nettoyer les caractères spéciaux et non-JSON
        const cleanedParts = replacedParts
          .replace(/'/g, '"')  // Remplacer les apostrophes par des guillemets
          .replace(/\\/g, '')  // Supprimer les backslashes
          .trim();

        // Essayer de parser
        const parsed = JSON.parse(cleanedParts);
        return Array.isArray(parsed) ? parsed : [parsed];
      }

      // Convertir en tableau si c'est un objet ou une valeur unique
      return [replacedParts];
    } catch (error) {
      // En cas d'échec, retourner un tableau avec la chaîne originale
      return [replacedParts];
    }
  }

  private serializeReplacedParts(replacedParts?: string[] | null): string[] {
    // Si replacedParts est undefined ou null, retourner un tableau vide
    if (!replacedParts) {
      return [];
    }

    // Si c'est déjà un tableau, le retourner tel quel
    if (Array.isArray(replacedParts)) {
      return replacedParts;
    }

    // Si c'est une chaîne unique, la convertir en tableau
    return [replacedParts];
  }

  async save(maintenance: Maintenance): Promise<void> {
    try {
      await MaintenanceModel.create({
        id: maintenance.id,
        motorcycleId: maintenance.motorcycleId,
        type: maintenance.type,
        status: maintenance.status,
        scheduledDate: maintenance.scheduledDate,
        actualDate: maintenance.actualDate,
        mileageAtMaintenance: maintenance.mileageAtMaintenance,
        technicianNotes: maintenance.technicianNotes,
        replacedParts: this.serializeReplacedParts(maintenance.replacedParts),
        totalCost: maintenance.totalCost ? parseFloat(maintenance.totalCost.toString()) : null,
        nextMaintenanceRecommendation: maintenance.nextMaintenanceRecommendation
      });
    } catch (error) {
      throw new MaintenanceValidationError(error.message);
    }
  }

  async findById(id: string): Promise<Maintenance | MaintenanceNotFoundError> {
    const maintenance = await MaintenanceModel.findByPk(id, {
      raw: true  // Retourne un objet simple
    });
    
    if (!maintenance) {
      return new MaintenanceNotFoundError();
    }

    return Maintenance.from(
      maintenance.id,
      maintenance.motorcycleId,
      maintenance.type,
      maintenance.scheduledDate,
      maintenance.status,
      maintenance.mileageAtMaintenance,
      maintenance.actualDate,
      maintenance.technicianNotes,
      this.parseReplacedParts(maintenance.replacedParts),
      maintenance.totalCost,
      maintenance.nextMaintenanceRecommendation,
      maintenance.createdAt,
      maintenance.updatedAt
    ) as Maintenance;
  }

  async findByMotorcycleId(motorcycleId: string): Promise<Maintenance[]> {
    const maintenances = await MaintenanceModel.findAll({
      where: { motorcycleId },
      raw: true
    });

    return maintenances.map(m => 
      Maintenance.from(
        m.id,
        m.motorcycleId,
        m.type,
        m.scheduledDate,
        m.status,
        m.mileageAtMaintenance,
        m.actualDate,
        m.technicianNotes,
        this.parseReplacedParts(m.replacedParts),
        m.totalCost,
        m.nextMaintenanceRecommendation,
        m.createdAt,
        m.updatedAt
      ) as Maintenance
    );
  }

  async findByType(type: MaintenanceType): Promise<Maintenance[]> {
    const maintenances = await MaintenanceModel.findAll({
      where: { type },
      raw: true
    });

    return maintenances.map(m => 
      Maintenance.from(
        m.id,
        m.motorcycleId,
        m.type,
        m.scheduledDate,
        m.status,
        m.mileageAtMaintenance,
        m.actualDate,
        m.technicianNotes,
        this.parseReplacedParts(m.replacedParts),
        m.totalCost,
        m.nextMaintenanceRecommendation,
        m.createdAt,
        m.updatedAt
      ) as Maintenance
    );
  }

  async findByStatus(status: MaintenanceStatus): Promise<Maintenance[]> {
    const maintenances = await MaintenanceModel.findAll({
      where: { status },
      raw: true
    });

    return maintenances.map(m => 
      Maintenance.from(
        m.id,
        m.motorcycleId,
        m.type,
        m.scheduledDate,
        m.status,
        m.mileageAtMaintenance,
        m.actualDate,
        m.technicianNotes,
        this.parseReplacedParts(m.replacedParts),
        m.totalCost,
        m.nextMaintenanceRecommendation,
        m.createdAt,
        m.updatedAt
      ) as Maintenance
    );
  }

  async update(
    maintenanceId: string, 
    maintenanceData: CreateMaintenanceDTO
  ): Promise<MaintenanceResponseDTO> {
    try {
      const { 
        motorcycleId, 
        type, 
        scheduledDate, 
        status, 
        mileageAtMaintenance, 
        technicianNotes, 
        replacedParts, 
        totalCost, 
        nextMaintenanceRecommendation,
        actualDate
      } = maintenanceData;

      // Trouver la maintenance existante
      const existingMaintenance = await MaintenanceModel.findByPk(maintenanceId);

      if (!existingMaintenance) {
        throw new Error('Maintenance non trouvée');
      }

      // Mettre à jour les champs
      existingMaintenance.set({
        motorcycleId: motorcycleId || existingMaintenance.motorcycleId,
        type: type || existingMaintenance.type,
        scheduledDate: scheduledDate || existingMaintenance.scheduledDate,
        status: status || existingMaintenance.status,
        mileageAtMaintenance: mileageAtMaintenance || existingMaintenance.mileageAtMaintenance,
        technicianNotes: technicianNotes || existingMaintenance.technicianNotes,
        replacedParts: this.serializeReplacedParts(replacedParts || existingMaintenance.replacedParts),
        totalCost: totalCost !== undefined ? parseFloat(totalCost.toString()) : existingMaintenance.totalCost,
        nextMaintenanceRecommendation: nextMaintenanceRecommendation || existingMaintenance.nextMaintenanceRecommendation,
        actualDate: actualDate || existingMaintenance.actualDate,
        updatedAt: new Date()
      });

      // Sauvegarder les modifications
      await existingMaintenance.save();

      // Convertir et retourner la maintenance mise à jour
      return {
        id: existingMaintenance.id,
        motorcycleId: existingMaintenance.motorcycleId,
        type: existingMaintenance.type,
        scheduledDate: existingMaintenance.scheduledDate,
        status: existingMaintenance.status,
        mileageAtMaintenance: existingMaintenance.mileageAtMaintenance,
        technicianNotes: existingMaintenance.technicianNotes,
        replacedParts: this.parseReplacedParts(existingMaintenance.replacedParts),
        totalCost: existingMaintenance.totalCost,
        nextMaintenanceRecommendation: existingMaintenance.nextMaintenanceRecommendation,
        actualDate: existingMaintenance.actualDate
      };
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const deletedRows = await MaintenanceModel.destroy({
        where: { id }
      });

      if (deletedRows === 0) {
        throw new MaintenanceNotFoundError(`Maintenance with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof MaintenanceNotFoundError) {
        throw error;
      }
      throw new MaintenanceValidationError(`Failed to delete maintenance: ${error.message}`);
    }
  }

  async findDueMaintenances(currentDate: Date): Promise<Maintenance[]> {
    const dueMaintenances = await MaintenanceModel.findAll({
      where: {
        status: MaintenanceStatus.SCHEDULED,
        scheduledDate: {
          [Op.lte]: currentDate
        }
      },
      raw: true
    });

    return dueMaintenances.map(m => 
      Maintenance.from(
        m.id,
        m.motorcycleId,
        m.type,
        m.scheduledDate,
        m.status,
        m.mileageAtMaintenance,
        m.actualDate,
        m.technicianNotes,
        this.parseReplacedParts(m.replacedParts),
        m.totalCost,
        m.nextMaintenanceRecommendation,
        m.createdAt,
        m.updatedAt
      ) as Maintenance
    );
  }

  async findAll(): Promise<Maintenance[]> {
    const maintenances = await MaintenanceModel.findAll({
      include: [{
        model: MotorcycleModel,
        as: 'motorcycle',
        required: false  // LEFT JOIN
      }],
      raw: false  // Garder l'objet Sequelize complet
    });

    return maintenances.map(m => {
      const motorcycle = m.get('motorcycle');
      return Maintenance.from(
        m.id,
        m.motorcycleId,
        m.type,
        m.scheduledDate,
        m.status,
        m.mileageAtMaintenance,
        m.actualDate,
        m.technicianNotes,
        this.parseReplacedParts(m.replacedParts),
        m.totalCost,
        m.nextMaintenanceRecommendation,
        m.createdAt,
        m.updatedAt,
        motorcycle ? {
          id: motorcycle.id,
          brand: motorcycle.brand,
          model: motorcycle.model,
          year: motorcycle.year,
          vin: motorcycle.vin,
          mileage: motorcycle.mileage,
          status: motorcycle.status,
          concessionId: motorcycle.concessionId
        } : undefined
      ) as Maintenance;
    });
  }
}

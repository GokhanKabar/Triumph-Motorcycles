import { Request, Response } from 'express';
import { CreateDriverUseCase } from '../../../application/driver/use-cases/CreateDriverUseCase';
import { AssignDriverMotorcycleUseCase } from '../../../application/driver/use-cases/AssignDriverMotorcycleUseCase';
import { RecordDriverIncidentUseCase } from '../../../application/driver/use-cases/RecordDriverIncidentUseCase';
import { CreateDriverDTO, AssignMotorcycleDTO, RecordIncidentDTO } from '../../../application/driver/dtos/DriverDTO';
import { IDriverRepository } from '../../../domain/driver/repositories/IDriverRepository';
import DriverNotFoundError from '../../../domain/driver/errors/DriverNotFoundError';
import DriverValidationError from '../../../domain/driver/errors/DriverValidationError';

export class DriverController {
  constructor(
    private readonly createDriverUseCase: CreateDriverUseCase,
    private readonly assignDriverMotorcycleUseCase: AssignDriverMotorcycleUseCase,
    private readonly recordDriverIncidentUseCase: RecordDriverIncidentUseCase,
    private readonly driverRepository: IDriverRepository
  ) {}

  async createDriver(req: Request, res: Response): Promise<void> {
    try {
      const driverData: CreateDriverDTO = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        licenseNumber: req.body.licenseNumber,
        licenseType: req.body.licenseType,
        licenseExpirationDate: req.body.licenseExpirationDate,
        status: req.body.status,
        companyId: req.body.companyId,
        currentMotorcycleId: req.body.currentMotorcycleId,
        drivingExperience: req.body.drivingExperience
      };

      const driver = await this.createDriverUseCase.execute(
        driverData.firstName,
        driverData.lastName,
        driverData.licenseNumber,
        driverData.licenseType,
        driverData.licenseExpirationDate,
        driverData.status,
        driverData.companyId,
        driverData.currentMotorcycleId,
        driverData.drivingExperience
      );

      res.status(201).json({
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        licenseNumber: driver.licenseNumber,
        licenseType: driver.licenseType,
        licenseExpirationDate: driver.licenseExpirationDate,
        status: driver.status,
        companyId: driver.companyId,
        currentMotorcycleId: driver.currentMotorcycleId,
        drivingExperience: driver.drivingExperience,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt
      });
    } catch (error) {
      console.error('Erreur lors de la création du conducteur:', error);
      res.status(500).json({ message: 'Erreur lors de la création du conducteur' });
    }
  }

  async getAllDrivers(req: Request, res: Response): Promise<void> {
    try {
      const drivers = await this.driverRepository.findAll();
      const driversDTO = drivers.map(driver => ({
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        licenseNumber: driver.licenseNumber,
        licenseType: driver.licenseType,
        licenseExpirationDate: driver.licenseExpirationDate,
        status: driver.status,
        companyId: driver.companyId,
        currentMotorcycleId: driver.currentMotorcycleId,
        drivingExperience: driver.drivingExperience,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt
      }));
      res.status(200).json(driversDTO);
    } catch (error) {
      console.error('Erreur lors de la récupération des conducteurs:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des conducteurs' });
    }
  }

  async updateDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const driverData: Partial<CreateDriverDTO> = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        licenseNumber: req.body.licenseNumber,
        licenseType: req.body.licenseType,
        licenseExpirationDate: req.body.licenseExpirationDate,
        status: req.body.status,
        companyId: req.body.companyId,
        currentMotorcycleId: req.body.currentMotorcycleId,
        drivingExperience: req.body.drivingExperience
      };

      // Vérifier si l'ID est fourni
      if (!id) {
        res.status(400).json({ message: 'ID du conducteur requis' });
        return;
      }

      // Mettre à jour le conducteur
      const updatedDriver = await this.driverRepository.update(id, driverData);

      res.status(200).json({
        id: updatedDriver.id,
        firstName: updatedDriver.firstName,
        lastName: updatedDriver.lastName,
        licenseNumber: updatedDriver.licenseNumber,
        licenseType: updatedDriver.licenseType,
        licenseExpirationDate: updatedDriver.licenseExpirationDate,
        status: updatedDriver.status,
        companyId: updatedDriver.companyId,
        currentMotorcycleId: updatedDriver.currentMotorcycleId,
        drivingExperience: updatedDriver.drivingExperience,
        createdAt: updatedDriver.createdAt,
        updatedAt: updatedDriver.updatedAt
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du conducteur:', error);
      
      if (error instanceof DriverNotFoundError) {
        res.status(404).json({ message: error.message });
      } else if (error instanceof DriverValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du conducteur' });
      }
    }
  }

  async deleteDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Vérifier si l'ID est fourni
      if (!id) {
        res.status(400).json({ message: 'ID du conducteur requis' });
        return;
      }

      // Vérifier si le conducteur existe
      const existingDriver = await this.driverRepository.findById(id);
      if (!existingDriver) {
        res.status(404).json({ message: 'Conducteur non trouvé' });
        return;
      }

      // Supprimer le conducteur
      await this.driverRepository.delete(id);

      res.status(200).json({ message: 'Conducteur supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du conducteur:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du conducteur' });
    }
  }

  async assignMotorcycle(req: Request, res: Response): Promise<void> {
    try {
      const { driverId, motorcycleId } = req.body as AssignMotorcycleDTO;
      const updatedDriver = await this.assignDriverMotorcycleUseCase.execute(driverId, motorcycleId);
      res.status(200).json({
        id: updatedDriver.id,
        firstName: updatedDriver.firstName,
        lastName: updatedDriver.lastName,
        licenseNumber: updatedDriver.licenseNumber,
        licenseType: updatedDriver.licenseType,
        licenseExpirationDate: updatedDriver.licenseExpirationDate,
        status: updatedDriver.status,
        companyId: updatedDriver.companyId,
        currentMotorcycleId: updatedDriver.currentMotorcycleId,
        drivingExperience: updatedDriver.drivingExperience,
        createdAt: updatedDriver.createdAt,
        updatedAt: updatedDriver.updatedAt
      });
    } catch (error) {
      console.error('Erreur lors de l\'assignation de la moto:', error);
      res.status(500).json({ message: 'Erreur lors de l\'assignation de la moto' });
    }
  }

  async recordIncident(req: Request, res: Response): Promise<void> {
    try {
      const { driverId, incident } = req.body as RecordIncidentDTO;
      const updatedDriver = await this.recordDriverIncidentUseCase.execute(driverId, incident);
      res.status(201).json({
        id: updatedDriver.id,
        firstName: updatedDriver.firstName,
        lastName: updatedDriver.lastName,
        licenseNumber: updatedDriver.licenseNumber,
        licenseType: updatedDriver.licenseType,
        licenseExpirationDate: updatedDriver.licenseExpirationDate,
        status: updatedDriver.status,
        companyId: updatedDriver.companyId,
        currentMotorcycleId: updatedDriver.currentMotorcycleId,
        drivingExperience: updatedDriver.drivingExperience,
        createdAt: updatedDriver.createdAt,
        updatedAt: updatedDriver.updatedAt
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'incident:', error);
      res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'incident' });
    }
  }

  async changeDriverStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Vérifier si l'ID et le statut sont fournis
      if (!id) {
        res.status(400).json({ message: 'ID du conducteur requis' });
        return;
      }

      if (!status) {
        res.status(400).json({ message: 'Statut requis' });
        return;
      }

      // Mettre à jour le statut du conducteur
      const updatedDriver = await this.driverRepository.update(id, { status });

      res.status(200).json({
        id: updatedDriver.id,
        firstName: updatedDriver.firstName,
        lastName: updatedDriver.lastName,
        licenseNumber: updatedDriver.licenseNumber,
        licenseType: updatedDriver.licenseType,
        licenseExpirationDate: updatedDriver.licenseExpirationDate,
        status: updatedDriver.status,
        companyId: updatedDriver.companyId,
        currentMotorcycleId: updatedDriver.currentMotorcycleId,
        drivingExperience: updatedDriver.drivingExperience,
        createdAt: updatedDriver.createdAt,
        updatedAt: updatedDriver.updatedAt
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut du conducteur:', error);
      
      if (error instanceof DriverNotFoundError) {
        res.status(404).json({ message: error.message });
      } else if (error instanceof DriverValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors du changement de statut du conducteur' });
      }
    }
  }
}

import { Request, Response } from 'express';
import { 
  CreateTestRideUseCase, 
  GetTestRideUseCase,
  GetAllTestRidesUseCase,
  DeleteTestRideUseCase,
  UpdateTestRideStatusUseCase
} from '../../../application/testRide';
import { 
  TestRideNotFoundError
} from '../../../domain/testRide';
import { TestRideStatus, RiderExperience, LicenseType } from '../../../domain/testRide/entities/TestRide';

export class TestRideController {
  constructor(
    private readonly createTestRideUseCase: CreateTestRideUseCase,
    private readonly getTestRideUseCase: GetTestRideUseCase,
    private readonly getAllTestRidesUseCase: GetAllTestRidesUseCase,
    private readonly deleteTestRideUseCase: DeleteTestRideUseCase,
    private readonly updateTestRideStatusUseCase: UpdateTestRideStatusUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { 
        concessionId, 
        motorcycleId, 
        motorcycleName,
        firstName, 
        lastName, 
        email, 
        phoneNumber, 
        desiredDate,
        riderExperience,
        licenseType,
        licenseNumber,
        hasTrainingCertificate,
        preferredRideTime,
        additionalRequirements,
        message 
      } = req.body;

      const testRide = await this.createTestRideUseCase.execute({
        concessionId,
        motorcycleId,
        motorcycleName,
        firstName,
        lastName,
        email,
        phoneNumber,
        desiredDate: new Date(desiredDate),
        riderExperience: RiderExperience[riderExperience as keyof typeof RiderExperience],
        licenseType: LicenseType[licenseType as keyof typeof LicenseType],
        licenseNumber,
        hasTrainingCertificate,
        preferredRideTime,
        additionalRequirements,
        message
      });

      res.status(201).json(testRide);
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Vérifier si l'erreur contient un message spécifique de validation
        if (error.message.includes('validation')) {
          res.status(400).json({
            message: error.message
          });
        } else {
          res.status(500).json({
            message: 'Erreur lors de la création du test ride',
            details: error.message
          });
        }
      } else {
        res.status(500).json({
          message: 'Erreur inconnue lors de la création du test ride'
        });
      }
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const testRide = await this.getTestRideUseCase.getById(id);
      res.status(200).json(testRide);
    } catch (error: unknown) {
      if (error instanceof TestRideNotFoundError) {
        res.status(404).json({
          message: 'Réservation non trouvée',
          error: error.message
        });
        return;
      }

      res.status(500).json({
        message: 'Erreur lors de la récupération de la réservation',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getByConcessionId(req: Request, res: Response): Promise<void> {
    try {
      const { concessionId } = req.params;
      const testRides = await this.getTestRideUseCase.getByConcessionId(concessionId);
      res.status(200).json(testRides);
    } catch (error: unknown) {
      res.status(500).json({
        message: 'Erreur lors de la récupération des réservations',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const testRides = await this.getAllTestRidesUseCase.execute();
      res.status(200).json(testRides);
    } catch (error: unknown) {
      res.status(500).json({
        message: 'Erreur lors de la récupération des test rides',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.deleteTestRideUseCase.execute(id);

      res.status(204).send(); // Pas de contenu, suppression réussie
    } catch (error: unknown) {
      if (error instanceof TestRideNotFoundError) {
        res.status(404).json({
          message: 'Test ride non trouvé',
          error: error.message
        });
        return;
      }
      res.status(500).json({
        message: 'Erreur lors de la suppression du test ride',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        res.status(400).json({
          message: 'ID de test ride requis'
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          message: 'Statut de test ride requis'
        });
        return;
      }

      const updatedTestRide = await this.updateTestRideStatusUseCase.execute({
        id,
        status: TestRideStatus[status as keyof typeof TestRideStatus]
      });

      res.status(200).json(updatedTestRide);
    } catch (error: unknown) {
      if (error instanceof TestRideNotFoundError) {
        res.status(404).json({
          message: error.message
        });
      } else {
        res.status(500).json({
          message: 'Erreur lors de la mise à jour du statut du test ride',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
  }

  async getDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Utiliser le cas d'utilisation pour récupérer les détails du test ride
      const testRide = await this.getTestRideUseCase.getById(id);

      // Retourner les détails du test ride
      res.status(200).json({
        id: testRide.id,
        motorcycleName: testRide.motorcycleName,
        firstName: testRide.firstName,
        lastName: testRide.lastName,
        email: testRide.email,
        phoneNumber: testRide.phoneNumber,
        status: testRide.status,
        riderExperience: testRide.riderExperience,
        licenseType: testRide.licenseType,
        desiredDate: testRide.desiredDate
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du test ride :', error);
      
      if (error instanceof TestRideNotFoundError) {
        res.status(404).json({ 
          message: 'Test ride non trouvé', 
          error: 'NOT_FOUND' 
        });
      } else {
        res.status(500).json({ 
          message: 'Erreur lors de la récupération des détails du test ride', 
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
  }
}

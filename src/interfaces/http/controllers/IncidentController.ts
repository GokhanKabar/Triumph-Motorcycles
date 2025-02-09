import { Request, Response } from 'express';
import { 
  CreateIncidentUseCase, 
  GetIncidentsUseCase,
  UpdateIncidentUseCase,
  DeleteIncidentUseCase
} from '../../../application/incident/use-case';
import { IncidentType } from '@domain/incident/enum/IncidentType';
import { IncidentStatus } from '@domain/incident/enum/IncidentStatus';

export class IncidentController {
  constructor(
    private readonly createIncidentUseCase: CreateIncidentUseCase,
    private readonly getIncidentsUseCase: GetIncidentsUseCase,
    private readonly updateIncidentUseCase: UpdateIncidentUseCase,
    private readonly deleteIncidentUseCase: DeleteIncidentUseCase
  ) {}

  createIncident = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        testRideId, 
        type, 
        description, 
        incidentDate 
      } = req.body;

      const incident = await this.createIncidentUseCase.execute(
        testRideId,
        type as IncidentType,
        description,
        new Date(incidentDate)
      );

      if (incident instanceof Error) {
        res.status(400).json({ message: incident.message });
        return;
      }

      res.status(201).json(incident);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la création de l\'incident',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  getIncidentsByTestRideId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { testRideId } = req.params;
      const incidents = await this.getIncidentsUseCase.getByTestRideId(testRideId);
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des incidents',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  getIncidentsByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      const incidents = await this.getIncidentsUseCase.getByType(type as IncidentType);
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des incidents par type',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  getIncidentsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.params;
      const incidents = await this.getIncidentsUseCase.getByStatus(status as IncidentStatus);
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des incidents par statut',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  getAllIncidents = async (req: Request, res: Response): Promise<void> => {
    try {
      const incidents = await this.getIncidentsUseCase.getAll();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des incidents',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  updateIncident = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { type, status, description, incidentDate } = req.body;

      const updatedIncident = await this.updateIncidentUseCase.execute(
        id, 
        { type, status, description, incidentDate: new Date(incidentDate) }
      );

      if (!updatedIncident) {
        res.status(404).json({ message: 'Incident non trouvé' });
        return;
      }

      res.json(updatedIncident);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour de l\'incident',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  deleteIncident = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const deleted = await this.deleteIncidentUseCase.execute(id);

      if (!deleted) {
        res.status(404).json({ message: 'Incident non trouvé' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la suppression de l\'incident',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };
}

import { Sequelize } from 'sequelize';
import IncidentModel from '../models/IncidentModel';
import TestRideModel from '../models/TestRideModel';
import { IncidentType, IncidentStatus } from '@domain/incident/enum';
import { v4 as uuidv4 } from 'uuid';

export class IncidentSeed {
  static async seed(sequelize?: Sequelize, force: boolean = false): Promise<void> {
    try {
      console.log('🚨 Début du seed des incidents...');

      // Vérifier si des incidents existent déjà
      const incidentCount = await IncidentModel.count();
      if (incidentCount > 0 && !force) {
        console.log('💡 Des incidents existent déjà. Seed ignoré.');
        return;
      }

      // Supprimer les incidents existants si force est true
      if (force) {
        await IncidentModel.destroy({ 
          where: {},
          truncate: true // Utiliser truncate pour réinitialiser complètement la table
        });
      }

      // Récupérer les test rides
      const testRides = await TestRideModel.findAll();

      if (testRides.length === 0) {
        console.warn('⚠️ Aucun test ride trouvé. Impossible de créer des incidents.');
        return;
      }

      // Créer des incidents de seed
      const seedIncidents = testRides.map((testRide, index) => ({
        id: uuidv4(), // Générer un nouvel UUID pour chaque incident
        testRideId: testRide.id,
        type: this.getRandomIncidentType(),
        status: this.getRandomIncidentStatus(),
        description: this.getRandomIncidentDescription(index),
        incidentDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Date dans les 30 derniers jours
      }));

      // Insérer les incidents de seed
      await IncidentModel.bulkCreate(seedIncidents);

      console.log(`🏍 Seed de ${seedIncidents.length} incidents terminé avec succès`);
    } catch (error) {
      console.error('❌ Erreur lors du seed des incidents:', error);
      throw error;
    }
  }

  private static getRandomIncidentType(): IncidentType {
    const types = Object.values(IncidentType);
    return types[Math.floor(Math.random() * types.length)];
  }

  private static getRandomIncidentStatus(): IncidentStatus {
    const statuses = Object.values(IncidentStatus);
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private static getRandomIncidentDescription(index: number): string {
    const baseDescriptions = [
      'Chute légère lors du test de la moto',
      'Problème de frein détecté durant le test',
      'Situation dangereuse évitée de justesse',
      'Préoccupation concernant la stabilité du véhicule',
      'Problème mécanique mineur observé',
      'Incident sans gravité durant le test ride'
    ];
    
    // Utiliser une combinaison de l'index pour garantir l'unicité
    const uniqueDescription = `${baseDescriptions[index % baseDescriptions.length]}`;
    
    return uniqueDescription;
  }
}

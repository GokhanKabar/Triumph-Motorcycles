import { IIncidentRepository } from '@/domain/incident/repositories/IIncidentRepository';
import { Incident } from '@/domain/incident/entities/Incident';
import { IncidentType } from '@domain/incident/enum/IncidentType';
import { IncidentStatus } from '@domain/incident/enum/IncidentStatus';
import IncidentModel from '../frameworks/postgres/models/IncidentModel';
import { Op } from 'sequelize';
import TestRideModel from '../frameworks/postgres/models/TestRideModel';

export class PostgreSQLIncidentRepository implements IIncidentRepository {
  static setupAssociations() {
    IncidentModel.belongsTo(TestRideModel, { 
      foreignKey: 'testRideId', 
      as: 'testRide' 
    });
    TestRideModel.hasMany(IncidentModel, { 
      foreignKey: 'testRideId', 
      as: 'incidents' 
    });
  }

  async findAll(): Promise<Incident[]> {
    const incidents = await IncidentModel.findAll({
      include: [{
        model: TestRideModel,
        as: 'testRide',
        attributes: ['motorcycleName', 'firstName', 'lastName', 'email', 'status', 'riderExperience', 'licenseType']
      }]
    });
    return incidents.map(incident => this.toDomain(incident));
  }

  async findById(id: string): Promise<Incident | null> {
    const incident = await IncidentModel.findByPk(id, {
      include: [{
        model: TestRideModel,
        as: 'testRide',
        attributes: ['motorcycleName', 'firstName', 'lastName', 'email', 'status', 'riderExperience', 'licenseType']
      }]
    });
    return incident ? this.toDomain(incident) : null;
  }

  async findByTestRideId(testRideId: string): Promise<Incident[]> {
    const incidents = await IncidentModel.findAll({
      where: { testRideId },
      include: [{
        model: TestRideModel,
        as: 'testRide',
        attributes: ['motorcycleName', 'firstName', 'lastName', 'email', 'status', 'riderExperience', 'licenseType']
      }]
    });
    return incidents.map(incident => this.toDomain(incident));
  }

  async findByType(type: IncidentType): Promise<Incident[]> {
    const incidents = await IncidentModel.findAll({
      where: { type },
      include: [{
        model: TestRideModel,
        as: 'testRide',
        attributes: ['motorcycleName', 'firstName', 'lastName', 'email', 'status', 'riderExperience', 'licenseType']
      }]
    });
    return incidents.map(incident => this.toDomain(incident));
  }

  async findByStatus(status: IncidentStatus): Promise<Incident[]> {
    const incidents = await IncidentModel.findAll({
      where: { status },
      include: [{
        model: TestRideModel,
        as: 'testRide',
        attributes: ['motorcycleName', 'firstName', 'lastName', 'email', 'status', 'riderExperience', 'licenseType']
      }]
    });
    return incidents.map(incident => this.toDomain(incident));
  }

  async save(incident: Incident): Promise<Incident> {
    const createdIncident = await IncidentModel.create(incident);

    return this.toDomain(createdIncident);
  }

  async update(id: string, incident: Partial<Incident>): Promise<Incident | null> {
    const [updatedRowsCount, updatedIncidents] = await IncidentModel.update(
      {
        type: incident.type,
        status: incident.status,
        description: incident.description,
        incidentDate: incident.incidentDate
      },
      { 
        where: { id },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      return null;
    }

    return this.toDomain(updatedIncidents[0]);
  }

  async delete(id: string): Promise<boolean> {
    const deletedRowsCount = await IncidentModel.destroy({ where: { id } });
    return deletedRowsCount > 0;
  }

  async count(): Promise<number> {
    return await IncidentModel.count();
  }

  private toDomain(model: IncidentModel & { testRide?: TestRideModel }): Incident {
    const testRide = model.testRide;
    return Incident.create(
      model.testRideId,
      model.type,
      model.description,
      model.incidentDate,
      model.id,
      model.status,
      model.createdAt,
      model.updatedAt
    );
  }

  async getTestRideDetails(testRideId: string) {
    const testRide = await TestRideModel.findByPk(testRideId, {
      attributes: ['motorcycleName', 'firstName', 'lastName', 'email', 'status', 'riderExperience', 'licenseType']
    });
    return testRide;
  }
}

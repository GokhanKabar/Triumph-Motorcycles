import { Model, DataTypes, Sequelize } from 'sequelize';
import { IncidentType } from '@domain/incident/enum/IncidentType';
import { IncidentStatus } from '@domain/incident/enum/IncidentStatus';
import TestRideModel from './TestRideModel';

class IncidentModel extends Model {
  public id!: string;
  public testRideId!: string;
  public type!: IncidentType;
  public status!: IncidentStatus;
  public description!: string;
  public incidentDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize): void {
    IncidentModel.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        testRideId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: TestRideModel,
            key: 'id'
          }
        },
        type: {
          type: DataTypes.ENUM(...Object.values(IncidentType)),
          allowNull: false
        },
        status: {
          type: DataTypes.ENUM(...Object.values(IncidentStatus)),
          defaultValue: IncidentStatus.REPORTED
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        incidentDate: {
          type: DataTypes.DATE,
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: 'Incident',
        tableName: 'incidents',
        timestamps: true
      }
    );

    // Associations
    IncidentModel.belongsTo(TestRideModel, {
      foreignKey: 'testRideId',
      as: 'testRide'
    });
  }
}

export default IncidentModel;
